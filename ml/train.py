import os
import json
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import TensorDataset, DataLoader
import pandas as pd
import numpy as np
import time

from ml.dataset import generate_synthetic_cicids_dataset, ATTACK_CATEGORIES
from ml.preprocessing.pipeline import PreprocessingPipeline
from ml.models.ann import CyberSentinelANN
from ml.models.cnn1d import CyberSentinelCNN1D
from ml.models.lstm import CyberSentinelLSTM
from ml.models.baseline import CyberSentinelBaselineRF
from ml.evaluation.metrics import evaluate_predictions

MODEL_DIR = "models"
DATA_DIR = "data"

def train_pytorch_model(
    model: nn.Module,
    train_loader: DataLoader,
    val_loader: DataLoader,
    num_classes: int,
    epochs: int = 15,
    lr: float = 0.001
):
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=lr, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', patience=2, factor=0.5)
    
    best_loss = float('inf')
    best_weights = None
    
    for epoch in range(epochs):
        model.train()
        train_loss = 0.0
        for batch_x, batch_y in train_loader:
            optimizer.zero_grad()
            outputs = model(batch_x)
            loss = criterion(outputs, batch_y)
            loss.backward()
            optimizer.step()
            train_loss += loss.item() * batch_x.size(0)
            
        train_loss /= len(train_loader.dataset)
        
        # Validation phase
        model.eval()
        val_loss = 0.0
        with torch.no_grad():
            for batch_x, batch_y in val_loader:
                outputs = model(batch_x)
                loss = criterion(outputs, batch_y)
                val_loss += loss.item() * batch_x.size(0)
        val_loss /= len(val_loader.dataset)
        scheduler.step(val_loss)
        
        if val_loss < best_loss:
            best_loss = val_loss
            best_weights = model.state_dict()
            
    if best_weights:
        model.load_state_dict(best_weights)
    return model

def run_training_pipeline():
    os.makedirs(DATA_DIR, exist_ok=True)
    os.makedirs(MODEL_DIR, exist_ok=True)
    
    dataset_path = os.path.join(DATA_DIR, "cicids_threat_dataset.csv")
    if not os.path.exists(dataset_path):
        print("[Pipeline] Generating synthetic dataset...")
        df = generate_synthetic_cicids_dataset(num_samples=10000)
        df.to_csv(dataset_path, index=False)
    else:
        df = pd.read_csv(dataset_path)
        
    print(f"[Pipeline] Loaded dataset with shape {df.shape}")
    
    # 1. Preprocessing & Split
    pipeline = PreprocessingPipeline(artifact_dir=MODEL_DIR)
    X_scaled, y_encoded = pipeline.fit_transform(df)
    X_train, y_train, X_val, y_val, X_test, y_test = pipeline.split_data(X_scaled, y_encoded)
    
    input_dim = X_train.shape[1]
    num_classes = len(pipeline.classes_)
    
    # PyTorch DataLoaders
    train_ds = TensorDataset(torch.tensor(X_train, dtype=torch.float32), torch.tensor(y_train, dtype=torch.long))
    val_ds = TensorDataset(torch.tensor(X_val, dtype=torch.float32), torch.tensor(y_val, dtype=torch.long))
    
    train_loader = DataLoader(train_ds, batch_size=64, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=64, shuffle=False)
    X_test_tensor = torch.tensor(X_test, dtype=torch.float32)
    
    comparison_results = {}
    
    # -------------------------------------------------------------
    # Model 1: ANN / MLP
    # -------------------------------------------------------------
    print("[Pipeline] Training Model 1: Artificial Neural Network (ANN)...")
    ann_model = CyberSentinelANN(input_dim, num_classes)
    t0 = time.time()
    ann_model = train_pytorch_model(ann_model, train_loader, val_loader, num_classes, epochs=12)
    t_ann = (time.time() - t0) / len(X_test) * 1000
    
    ann_model.eval()
    with torch.no_grad():
        logits = ann_model(X_test_tensor)
        probs_ann = torch.softmax(logits, dim=1).numpy()
        preds_ann = np.argmax(probs_ann, axis=1)
        
    metrics_ann = evaluate_predictions(y_test, preds_ann, probs_ann, pipeline.classes_)
    metrics_ann["inference_time_ms"] = round(t_ann, 3)
    torch.save(ann_model.state_dict(), os.path.join(MODEL_DIR, "ann.pt"))
    comparison_results["ANN / MLP"] = metrics_ann
    
    # -------------------------------------------------------------
    # Model 2: 1D CNN
    # -------------------------------------------------------------
    print("[Pipeline] Training Model 2: 1D Convolutional Neural Network (CNN)...")
    cnn_model = CyberSentinelCNN1D(input_dim, num_classes)
    t0 = time.time()
    cnn_model = train_pytorch_model(cnn_model, train_loader, val_loader, num_classes, epochs=12)
    t_cnn = (time.time() - t0) / len(X_test) * 1000
    
    cnn_model.eval()
    with torch.no_grad():
        logits = cnn_model(X_test_tensor)
        probs_cnn = torch.softmax(logits, dim=1).numpy()
        preds_cnn = np.argmax(probs_cnn, axis=1)
        
    metrics_cnn = evaluate_predictions(y_test, preds_cnn, probs_cnn, pipeline.classes_)
    metrics_cnn["inference_time_ms"] = round(t_cnn, 3)
    torch.save(cnn_model.state_dict(), os.path.join(MODEL_DIR, "cnn1d.pt"))
    comparison_results["1D CNN"] = metrics_cnn
    
    # -------------------------------------------------------------
    # Model 3: LSTM Sequence Model
    # -------------------------------------------------------------
    print("[Pipeline] Training Model 3: LSTM Sequence Threat Model...")
    lstm_model = CyberSentinelLSTM(input_dim, num_classes)
    t0 = time.time()
    lstm_model = train_pytorch_model(lstm_model, train_loader, val_loader, num_classes, epochs=12)
    t_lstm = (time.time() - t0) / len(X_test) * 1000
    
    lstm_model.eval()
    with torch.no_grad():
        logits = lstm_model(X_test_tensor)
        probs_lstm = torch.softmax(logits, dim=1).numpy()
        preds_lstm = np.argmax(probs_lstm, axis=1)
        
    metrics_lstm = evaluate_predictions(y_test, preds_lstm, probs_lstm, pipeline.classes_)
    metrics_lstm["inference_time_ms"] = round(t_lstm, 3)
    torch.save(lstm_model.state_dict(), os.path.join(MODEL_DIR, "lstm.pt"))
    comparison_results["LSTM"] = metrics_lstm
    
    # -------------------------------------------------------------
    # Model 4: Random Forest Baseline
    # -------------------------------------------------------------
    print("[Pipeline] Training Model 4: Random Forest Baseline Classifier...")
    rf_baseline = CyberSentinelBaselineRF()
    t0 = time.time()
    rf_baseline.fit(X_train, y_train)
    t_rf = (time.time() - t0) / len(X_test) * 1000
    
    probs_rf = rf_baseline.predict_proba(X_test)
    preds_rf = rf_baseline.predict(X_test)
    
    metrics_rf = evaluate_predictions(y_test, preds_rf, probs_rf, pipeline.classes_)
    metrics_rf["inference_time_ms"] = round(t_rf, 3)
    rf_baseline.save(os.path.join(MODEL_DIR, "baseline_rf.pkl"))
    comparison_results["Random Forest Baseline"] = metrics_rf

    # -------------------------------------------------------------
    # Save Model Comparison & Metadata
    # -------------------------------------------------------------
    comp_path = os.path.join(MODEL_DIR, "model_comparison.json")
    with open(comp_path, "w") as f:
        json.dump(comparison_results, f, indent=2)
        
    # Determine best model based on F1 score
    best_model_name = max(comparison_results.keys(), key=lambda k: comparison_results[k]["f1_score"])
    print(f"[Pipeline] Training Complete! Best performing model: {best_model_name}")
    print(f"[Pipeline] Saved model artifacts & evaluation metrics to '{MODEL_DIR}/'.")
    
    return comparison_results

if __name__ == "__main__":
    run_training_pipeline()
