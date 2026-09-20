import pytest
import numpy as np
import torch
from ml.models.baseline import CyberSentinelBaselineRF
from ml.models.ann import CyberSentinelANN
from ml.models.cnn1d import CyberSentinelCNN1D

def test_baseline_random_forest():
    """Verify Baseline Random Forest training, prediction, and feature importances."""
    X = np.random.randn(50, 20).astype(np.float32)
    y = np.random.randint(0, 2, size=50)

    model = CyberSentinelBaselineRF(n_estimators=10, random_state=42)
    model.fit(X, y)

    preds = model.predict(X[:5])
    assert len(preds) == 5

    probas = model.predict_proba(X[:5])
    assert probas.shape == (5, 2)

    importances = model.get_feature_importances()
    assert len(importances) == 20

def test_ann_model_architecture():
    """Verify ANN / MLP PyTorch forward pass output shape and softmax probability distribution."""
    model = CyberSentinelANN(input_dim=20, num_classes=2)
    model.eval()
    dummy_input = torch.randn(8, 20)

    with torch.no_grad():
        logits = model(dummy_input)
        assert logits.shape == (8, 2)

        probas = torch.softmax(logits, dim=1).numpy()
        assert probas.shape == (8, 2)
        assert np.allclose(probas.sum(axis=1), 1.0, atol=1e-4)

def test_cnn1d_model_architecture():
    """Verify 1D Convolutional Neural Network output shape and softmax probability distribution."""
    model = CyberSentinelCNN1D(input_dim=20, num_classes=2)
    model.eval()
    dummy_input = torch.randn(8, 20)

    with torch.no_grad():
        logits = model(dummy_input)
        assert logits.shape == (8, 2)

        probas = torch.softmax(logits, dim=1).numpy()
        assert probas.shape == (8, 2)
        assert np.allclose(probas.sum(axis=1), 1.0, atol=1e-4)
