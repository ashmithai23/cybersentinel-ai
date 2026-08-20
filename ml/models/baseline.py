import os
import pickle
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from typing import Dict, Any, List

class CyberSentinelBaselineRF:
    """
    Classical Machine Learning (Random Forest Ensemble) Baseline Classifier.
    Used as an operational benchmark against deep learning models (ANN, 1D CNN, LSTM).
    """
    def __init__(self, n_estimators: int = 100, max_depth: int = 15, random_state: int = 42):
        self.model = RandomForestClassifier(
            n_estimators=n_estimators,
            max_depth=max_depth,
            random_state=random_state,
            n_jobs=-1,
            class_weight="balanced"
        )
        self.is_fitted = False

    def fit(self, X: np.ndarray, y: np.ndarray):
        self.model.fit(X, y)
        self.is_fitted = True

    def predict(self, X: np.ndarray) -> np.ndarray:
        return self.model.predict(X)

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        return self.model.predict_proba(X)

    def get_feature_importances(self) -> np.ndarray:
        return self.model.feature_importances_

    def save(self, filepath: str):
        with open(filepath, "wb") as f:
            pickle.dump(self.model, f)

    def load(self, filepath: str):
        with open(filepath, "rb") as f:
            self.model = pickle.load(f)
        self.is_fitted = True
