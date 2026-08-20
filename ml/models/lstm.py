import torch
import torch.nn as nn

class CyberSentinelLSTM(nn.Module):
    """
    Bidirectional LSTM (BiLSTM) for Sequential Threat Pattern Recognition.
    Processes feature sequences in both forward and backward temporal directions
    to achieve maximum detection accuracy for multi-step attack campaigns.
    """
    def __init__(self, input_dim: int, num_classes: int, hidden_dim: int = 64, num_layers: int = 2):
        super(CyberSentinelLSTM, self).__init__()
        self.input_dim = input_dim
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers
        self.num_classes = num_classes
        
        self.lstm = nn.LSTM(
            input_size=input_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            bidirectional=True,
            dropout=0.2 if num_layers > 1 else 0.0
        )
        
        # Multiply hidden_dim by 2 for bidirectional output
        self.fc = nn.Sequential(
            nn.Linear(hidden_dim * 2, 64),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(64, num_classes)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        if x.dim() == 2:
            x = x.unsqueeze(1)
            
        lstm_out, _ = self.lstm(x)
        # Take last timestep feature representation
        last_out = lstm_out[:, -1, :]
        out = self.fc(last_out)
        return out

def get_lstm_model(input_dim: int, num_classes: int) -> CyberSentinelLSTM:
    return CyberSentinelLSTM(input_dim, num_classes)
