import torch
import torch.nn as nn

class CyberSentinelCNN1D(nn.Module):
    """
    Multi-Scale 1D Convolutional Neural Network.
    Uses dual parallel Conv1D kernel branches (kernel_size=3 and kernel_size=5)
    to extract both local and broad feature correlations across network packet attributes.
    """
    def __init__(self, input_dim: int, num_classes: int):
        super(CyberSentinelCNN1D, self).__init__()
        self.input_dim = input_dim
        self.num_classes = num_classes
        
        # Branch 1: Kernel 3
        self.branch1 = nn.Sequential(
            nn.Conv1d(in_channels=1, out_channels=32, kernel_size=3, padding=1),
            nn.BatchNorm1d(32),
            nn.ReLU(),
            nn.MaxPool1d(kernel_size=2, stride=1)
        )
        
        # Branch 2: Kernel 5
        self.branch2 = nn.Sequential(
            nn.Conv1d(in_channels=1, out_channels=32, kernel_size=5, padding=2),
            nn.BatchNorm1d(32),
            nn.ReLU(),
            nn.MaxPool1d(kernel_size=2, stride=1)
        )
        
        self.merged_conv = nn.Sequential(
            nn.Conv1d(in_channels=64, out_channels=128, kernel_size=3, padding=1),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.AdaptiveAvgPool1d(8)
        )
        
        self.classifier = nn.Sequential(
            nn.Linear(128 * 8, 128),
            nn.ReLU(),
            nn.Dropout(0.25),
            nn.Linear(128, num_classes)
        )
        
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        if x.dim() == 2:
            x = x.unsqueeze(1)
            
        b1 = self.branch1(x)
        b2 = self.branch2(x)
        merged = torch.cat([b1, b2], dim=1) # Concatenate filter maps
        
        feat = self.merged_conv(merged)
        feat_flat = feat.view(feat.size(0), -1)
        out = self.classifier(feat_flat)
        return out

def get_cnn1d_model(input_dim: int, num_classes: int) -> CyberSentinelCNN1D:
    return CyberSentinelCNN1D(input_dim, num_classes)
