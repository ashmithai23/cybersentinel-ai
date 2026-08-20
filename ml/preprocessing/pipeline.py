import os
import json
import pickle
import numpy as np
import pandas as pd
from typing import Tuple, Dict, Any, List
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split

class PreprocessingPipeline:
    """
    Data Preprocessing Pipeline for CyberSentinel AI.
    Handles data validation, missing value imputation, scaling, label encoding,
    and artifact persistence.
    """
    def __init__(self, artifact_dir: str = "models"):
        self.artifact_dir = artifact_dir
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        self.feature_columns: List[str] = []
        self.classes_: List[str] = []
        self.is_fitted = False
        os.makedirs(self.artifact_dir, exist_ok=True)

    def validate_dataframe(self, df: pd.DataFrame, is_training: bool = True) -> Tuple[bool, str]:
        """Validates incoming pandas DataFrame for necessary feature columns and data integrity."""
        if df.empty:
            return False, "Uploaded dataset is empty."
        
        # Replace infinite values with NaN
        df.replace([np.inf, -np.inf], np.nan, inplace=True)
        
        if is_training:
            if "label" not in df.columns:
                return False, "Missing target 'label' column in training data."
        
        return True, "Dataset validation successful."

    def fit_transform(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """Fits the scaler and label encoder on training data, then transforms features and target."""
        valid, msg = self.validate_dataframe(df, is_training=True)
        if not valid:
            raise ValueError(msg)

        # Separate target and features
        y_raw = df["label"].astype(str)
        X_raw = df.drop(columns=["label"], errors="ignore")
        
        # Filter numeric features only
        numeric_cols = X_raw.select_dtypes(include=[np.number]).columns.tolist()
        self.feature_columns = numeric_cols
        
        X_num = X_raw[self.feature_columns].fillna(X_raw[self.feature_columns].median())
        
        X_scaled = self.scaler.fit_transform(X_num)
        y_encoded = self.label_encoder.fit_transform(y_raw)
        
        self.classes_ = list(self.label_encoder.classes_)
        self.is_fitted = True
        
        self.save_artifacts()
        return X_scaled, y_encoded

    def transform(self, df: pd.DataFrame) -> np.ndarray:
        """Transforms unseen feature data using fitted scaler."""
        if not self.is_fitted:
            self.load_artifacts()
            
        df = df.copy()
        df.replace([np.inf, -np.inf], np.nan, inplace=True)
        
        # Ensure all required features are present; fill missing columns with 0
        for col in self.feature_columns:
            if col not in df.columns:
                df[col] = 0.0
                
        # Coerce all columns to numeric, replacing text/NaN with 0.0
        X_num = pd.DataFrame()
        for col in self.feature_columns:
            X_num[col] = pd.to_numeric(df[col], errors='coerce').fillna(0.0)
            
        X_scaled = self.scaler.transform(X_num)
        return X_scaled

    def inverse_transform_target(self, y_indices: np.ndarray) -> List[str]:
        """Decodes numeric class labels back to category names."""
        if not self.is_fitted:
            self.load_artifacts()
        return self.label_encoder.inverse_transform(y_indices).tolist()

    def split_data(
        self, X: np.ndarray, y: np.ndarray, train_ratio: float = 0.7, val_ratio: float = 0.15, seed: int = 42
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        """Splits preprocessed data into train, validation, and test sets reproducibly."""
        test_ratio = 1.0 - train_ratio - val_ratio
        
        X_train, X_temp, y_train, y_temp = train_test_split(
            X, y, test_size=(val_ratio + test_ratio), random_state=seed, stratify=y
        )
        
        val_relative = val_ratio / (val_ratio + test_ratio)
        X_val, X_test, y_val, y_test = train_test_split(
            X_temp, y_temp, test_size=(1.0 - val_relative), random_state=seed, stratify=y_temp
        )
        
        return X_train, y_train, X_val, y_val, X_test, y_test

    def save_artifacts(self):
        """Saves scaler, label encoder, and feature column list to disk."""
        scaler_path = os.path.join(self.artifact_dir, "scaler.pkl")
        encoder_path = os.path.join(self.artifact_dir, "label_encoder.pkl")
        meta_path = os.path.join(self.artifact_dir, "pipeline_meta.json")
        
        with open(scaler_path, "wb") as f:
            pickle.dump(self.scaler, f)
        with open(encoder_path, "wb") as f:
            pickle.dump(self.label_encoder, f)
            
        with open(meta_path, "w") as f:
            json.dump({
                "feature_columns": self.feature_columns,
                "classes": self.classes_
            }, f, indent=2)

    def load_artifacts(self):
        """Loads fitted scaler, label encoder, and feature metadata from disk."""
        scaler_path = os.path.join(self.artifact_dir, "scaler.pkl")
        encoder_path = os.path.join(self.artifact_dir, "label_encoder.pkl")
        meta_path = os.path.join(self.artifact_dir, "pipeline_meta.json")
        
        if not (os.path.exists(scaler_path) and os.path.exists(encoder_path) and os.path.exists(meta_path)):
            raise FileNotFoundError("Preprocessing pipeline artifacts not found. Please train models first.")
            
        with open(scaler_path, "rb") as f:
            self.scaler = pickle.load(f)
        with open(encoder_path, "rb") as f:
            self.label_encoder = pickle.load(f)
        with open(meta_path, "r") as f:
            meta = json.load(f)
            self.feature_columns = meta["feature_columns"]
            self.classes_ = meta["classes"]
            
        self.is_fitted = True
