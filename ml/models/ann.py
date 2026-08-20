import torch
import torch.nn as nn

class CyberSentinelANN(nn.Module):
    """
    High-Precision Artificial Neural Network (Multi-Layer Perceptron) with Residual Connections.
    Architecture:
    Input (input_dim) -> Dense(256) -> BatchNorm -> ReLU -> Dropout(0.2)
                      -> Dense(128) -> BatchNorm -> ReLU -> Dropout(0.2)
                      -> Residual Block -> Dense(64) -> BatchNorm -> ReLU
                      -> Dense(num_classes)
    """
    def __init__(self, input_dim: int, num_classes: int, dropout_rate: float = 0.25):
        super(CyberSentinelANN, self).__init__()
        self.input_dim = input_dim
        self.num_classes = num_classes
        
        self.layer1 = nn.Sequential(
            nn.Linear(input_dim, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(),
            nn.Dropout(dropout_rate)
        )
        
        self.layer2 = nn.Sequential(
            nn.Linear(256, 128),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.Dropout(dropout_rate)
        )
        
        # Residual projection block
        self.res_proj = nn.Linear(256, 128)
        
        self.layer3 = nn.Sequential(
            nn.Linear(128, 64),
            nn.BatchNorm1d(64),
            nn.ReLU()
        )
        
        self.out_layer = nn.Linear(64, num_classes)
        
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x1 = self.layer1(x)
        x2 = self.layer2(x1) + self.res_proj(x1) # Residual connection
        x3 = self.layer3(x2)
        out = self.out_layer(x3)
        return out

def get_ann_model(input_dim: int, num_classes: int) -> CyberSentinelANN:
    return CyberSentinelANN(input_dim, num_classes)
