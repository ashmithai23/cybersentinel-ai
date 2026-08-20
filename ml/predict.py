import os
import json
import torch
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Union

from ml.preprocessing.pipeline import PreprocessingPipeline
from ml.models.ann import CyberSentinelANN
from ml.models.cnn1d import CyberSentinelCNN1D
from ml.models.lstm import CyberSentinelLSTM
from ml.models.baseline import CyberSentinelBaselineRF
from ml.explainability.explain import explain_prediction
from ml.risk_engine.risk_scorer import CyberSentinelRiskEngine

class CyberSentinelInferenceEngine:
    """
    Unified Inference Engine for CyberSentinel AI.
    Handles artifact loading, feature scaling, model selection (ANN, 1D-CNN, LSTM, Baseline RF),
    threat classification, probability estimation, explainability, and risk scoring.
    """
    def __init__(self, model_dir: str = "models"):
        self.model_dir = model_dir
        self.pipeline = PreprocessingPipeline(artifact_dir=model_dir)
        self.pipeline.load_artifacts()
        
        self.input_dim = len(self.pipeline.feature_columns)
        self.num_classes = len(self.pipeline.classes_)
        
        # Models cache
        self.loaded_models: Dict[str, Any] = {}
        self.active_model_name = "ANN / MLP"
        self._load_active_models()

    def _load_active_models(self):
        """Loads available trained PyTorch models and Random Forest baseline."""
        # 1. ANN
        ann_path = os.path.join(self.model_dir, "ann.pt")
        if os.path.exists(ann_path):
            ann = CyberSentinelANN(self.input_dim, self.num_classes)
            ann.load_state_dict(torch.load(ann_path, weights_only=True))
            ann.eval()
            self.loaded_models["ANN / MLP"] = ann
            
        # 2. 1D CNN
        cnn_path = os.path.join(self.model_dir, "cnn1d.pt")
        if os.path.exists(cnn_path):
            cnn = CyberSentinelCNN1D(self.input_dim, self.num_classes)
            cnn.load_state_dict(torch.load(cnn_path, weights_only=True))
            cnn.eval()
            self.loaded_models["1D CNN"] = cnn

        # 3. LSTM
        lstm_path = os.path.join(self.model_dir, "lstm.pt")
        if os.path.exists(lstm_path):
            lstm = CyberSentinelLSTM(self.input_dim, self.num_classes)
            lstm.load_state_dict(torch.load(lstm_path, weights_only=True))
            lstm.eval()
            self.loaded_models["LSTM"] = lstm

        # 4. Baseline RF
        rf_path = os.path.join(self.model_dir, "baseline_rf.pkl")
        if os.path.exists(rf_path):
            rf = CyberSentinelBaselineRF()
            rf.load(rf_path)
            self.loaded_models["Random Forest Baseline"] = rf

    def predict_batch(
        self, df: pd.DataFrame, model_name: str = "ANN / MLP", asset_endpoint: str = "/api/v1/network"
    ) -> List[Dict[str, Any]]:
        """
        Performs batch inference on a pandas DataFrame of security events.
        """
        X_scaled = self.pipeline.transform(df)
        model = self.loaded_models.get(model_name) or list(self.loaded_models.values())[0]
        
        results = []
        
        if isinstance(model, (CyberSentinelANN, CyberSentinelCNN1D, CyberSentinelLSTM)):
            X_tensor = torch.tensor(X_scaled, dtype=torch.float32)
            with torch.no_grad():
                logits = model(X_tensor)
                probs_all = torch.softmax(logits, dim=1).numpy()
        else:
            probs_all = model.predict_proba(X_scaled)

        pred_indices = np.argmax(probs_all, axis=1)
        confidences = np.max(probs_all, axis=1)
        labels = self.pipeline.inverse_transform_target(pred_indices)

        for i in range(len(df)):
            label = labels[i]
            conf = float(confidences[i])
            sample_feats = X_scaled[i]
            
            # Explainability
            exp = explain_prediction(self.pipeline.feature_columns, sample_feats, label, conf)
            
            # Risk Engine
            risk = CyberSentinelRiskEngine.calculate_risk(
                attack_category=label,
                confidence=conf,
                asset_endpoint=asset_endpoint
            )
            
            row_dict = df.iloc[i].to_dict()
            results.append({
                "event_index": i,
                "prediction": label,
                "confidence": round(conf * 100, 2),
                "risk_score": risk["score"],
                "severity": risk["severity"],
                "severity_color": risk["color"],
                "risk_reasons": risk["reasons"],
                "top_features": exp["top_contributing_features"],
                "explanation": exp["explanation"],
                "model_used": model_name,
                "raw_attributes": row_dict
            })

        return results

    def predict_single(
        self, features_dict: Dict[str, Any], model_name: str = "ANN / MLP", asset_endpoint: str = "/api/v1/auth"
    ) -> Dict[str, Any]:
        """Performs single event inference from feature dictionary."""
        df_single = pd.DataFrame([features_dict])
        res = self.predict_batch(df_single, model_name=model_name, asset_endpoint=asset_endpoint)
        return res[0]
