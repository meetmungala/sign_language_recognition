"""
Sign Language Model Training Module

This module handles training of sign language recognition models using
TensorFlow/PyTorch with various datasets (ASL, ISL, CSL, WLASL).
"""

import tensorflow as tf
import numpy as np
import pandas as pd
import os
import json
from typing import List, Dict, Tuple, Optional
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SignLanguageModelTrainer:
    """
    Class for training sign language recognition models.
    """
    
    def __init__(self, input_shape: Tuple[int, ...] = (189,), num_classes: int = 36):
        """
        Initialize the model trainer.
        
        Args:
            input_shape: Shape of input features (landmarks)
            num_classes: Number of sign language classes
        """
        self.input_shape = input_shape
        self.num_classes = num_classes
        self.model = None
        self.label_encoder = LabelEncoder()
        self.training_history = None
        
    def create_model(self, model_type: str = "dense") -> tf.keras.Model:
        """
        Create a neural network model for sign language recognition.
        
        Args:
            model_type: Type of model architecture ("dense", "cnn", "lstm")
            
        Returns:
            Compiled TensorFlow model
        """
        if model_type == "dense":
            model = self._create_dense_model()
        elif model_type == "cnn":
            model = self._create_cnn_model()
        elif model_type == "lstm":
            model = self._create_lstm_model()
        else:
            raise ValueError(f"Unknown model type: {model_type}")
        
        # Compile model
        model.compile(
            optimizer='adam',
            loss='sparse_categorical_crossentropy',
            metrics=['accuracy']
        )
        
        self.model = model
        return model
    
    def _create_dense_model(self) -> tf.keras.Model:
        """Create a dense neural network model."""
        model = tf.keras.Sequential([
            tf.keras.layers.Dense(512, activation='relu', input_shape=self.input_shape),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(256, activation='relu'),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(128, activation='relu'),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(64, activation='relu'),
            tf.keras.layers.Dense(self.num_classes, activation='softmax')
        ])
        return model
    
    def _create_cnn_model(self) -> tf.keras.Model:
        """Create a CNN model (reshapes input for 2D convolution)."""
        # Reshape input to 2D for CNN
        reshaped_input_shape = (int(np.sqrt(self.input_shape[0])), int(np.sqrt(self.input_shape[0])), 1)
        
        model = tf.keras.Sequential([
            tf.keras.layers.Reshape(reshaped_input_shape, input_shape=self.input_shape),
            tf.keras.layers.Conv2D(32, (3, 3), activation='relu'),
            tf.keras.layers.MaxPooling2D((2, 2)),
            tf.keras.layers.Conv2D(64, (3, 3), activation='relu'),
            tf.keras.layers.MaxPooling2D((2, 2)),
            tf.keras.layers.Conv2D(64, (3, 3), activation='relu'),
            tf.keras.layers.Flatten(),
            tf.keras.layers.Dense(128, activation='relu'),
            tf.keras.layers.Dropout(0.5),
            tf.keras.layers.Dense(self.num_classes, activation='softmax')
        ])
        return model
    
    def _create_lstm_model(self) -> tf.keras.Model:
        """Create an LSTM model for sequence-based recognition."""
        # Reshape input for LSTM (sequence_length, features)
        sequence_length = 10
        features_per_step = self.input_shape[0] // sequence_length
        
        model = tf.keras.Sequential([
            tf.keras.layers.Reshape((sequence_length, features_per_step), input_shape=self.input_shape),
            tf.keras.layers.LSTM(128, return_sequences=True),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.LSTM(64),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(64, activation='relu'),
            tf.keras.layers.Dense(self.num_classes, activation='softmax')
        ])
        return model
    
    def load_dataset(self, data_path: str, dataset_type: str = "asl") -> Tuple[np.ndarray, np.ndarray]:
        """
        Load sign language dataset.
        
        Args:
            data_path: Path to dataset directory
            dataset_type: Type of dataset ("asl", "isl", "csl", "wlasl")
            
        Returns:
            Tuple of (features, labels)
        """
        features = []
        labels = []
        
        if dataset_type == "asl":
            features, labels = self._load_asl_dataset(data_path)
        elif dataset_type == "isl":
            features, labels = self._load_isl_dataset(data_path)
        elif dataset_type == "csl":
            features, labels = self._load_csl_dataset(data_path)
        elif dataset_type == "wlasl":
            features, labels = self._load_wlasl_dataset(data_path)
        else:
            raise ValueError(f"Unknown dataset type: {dataset_type}")
        
        return np.array(features), np.array(labels)
    
    def _load_asl_dataset(self, data_path: str) -> Tuple[List[np.ndarray], List[str]]:
        """Load ASL dataset."""
        features = []
        labels = []
        
        # This is a placeholder - in practice, you'd load actual ASL data
        # For now, generate synthetic data for demonstration
        logger.info("Loading ASL dataset (synthetic data for demonstration)")
        
        for i in range(1000):  # Generate 1000 samples
            # Generate random landmark features
            feature = np.random.randn(self.input_shape[0])
            features.append(feature)
            
            # Generate random labels
            label = f"ASL_{i % 26}"  # 26 letters
            labels.append(label)
        
        return features, labels
    
    def _load_isl_dataset(self, data_path: str) -> Tuple[List[np.ndarray], List[str]]:
        """Load ISL dataset."""
        features = []
        labels = []
        
        logger.info("Loading ISL dataset (synthetic data for demonstration)")
        
        for i in range(800):  # Generate 800 samples
            feature = np.random.randn(self.input_shape[0])
            features.append(feature)
            label = f"ISL_{i % 20}"  # 20 common signs
            labels.append(label)
        
        return features, labels
    
    def _load_csl_dataset(self, data_path: str) -> Tuple[List[np.ndarray], List[str]]:
        """Load CSL dataset."""
        features = []
        labels = []
        
        logger.info("Loading CSL dataset (synthetic data for demonstration)")
        
        for i in range(1200):  # Generate 1200 samples
            feature = np.random.randn(self.input_shape[0])
            features.append(feature)
            label = f"CSL_{i % 30}"  # 30 common signs
            labels.append(label)
        
        return features, labels
    
    def _load_wlasl_dataset(self, data_path: str) -> Tuple[List[np.ndarray], List[str]]:
        """Load WLASL dataset."""
        features = []
        labels = []
        
        logger.info("Loading WLASL dataset (synthetic data for demonstration)")
        
        for i in range(2000):  # Generate 2000 samples
            feature = np.random.randn(self.input_shape[0])
            features.append(feature)
            label = f"WLASL_{i % 50}"  # 50 common signs
            labels.append(label)
        
        return features, labels
    
    def prepare_data(self, features: np.ndarray, labels: np.ndarray, 
                    test_size: float = 0.2, validation_size: float = 0.1) -> Dict[str, np.ndarray]:
        """
        Prepare data for training.
        
        Args:
            features: Input features
            labels: Target labels
            test_size: Proportion of data for testing
            validation_size: Proportion of training data for validation
            
        Returns:
            Dictionary containing train/validation/test splits
        """
        # Encode labels
        encoded_labels = self.label_encoder.fit_transform(labels)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            features, encoded_labels, test_size=test_size, random_state=42, stratify=encoded_labels
        )
        
        X_train, X_val, y_train, y_val = train_test_split(
            X_train, y_train, test_size=validation_size, random_state=42, stratify=y_train
        )
        
        return {
            'X_train': X_train,
            'X_val': X_val,
            'X_test': X_test,
            'y_train': y_train,
            'y_val': y_val,
            'y_test': y_test
        }
    
    def train_model(self, data: Dict[str, np.ndarray], epochs: int = 100, 
                   batch_size: int = 32, callbacks: List = None) -> tf.keras.callbacks.History:
        """
        Train the model.
        
        Args:
            data: Training data dictionary
            epochs: Number of training epochs
            batch_size: Batch size for training
            callbacks: List of Keras callbacks
            
        Returns:
            Training history
        """
        if self.model is None:
            raise ValueError("Model not created. Call create_model() first.")
        
        # Default callbacks
        if callbacks is None:
            callbacks = [
                tf.keras.callbacks.EarlyStopping(patience=10, restore_best_weights=True),
                tf.keras.callbacks.ReduceLROnPlateau(factor=0.5, patience=5),
                tf.keras.callbacks.ModelCheckpoint(
                    'best_model.h5', save_best_only=True, monitor='val_accuracy'
                )
            ]
        
        # Train model
        self.training_history = self.model.fit(
            data['X_train'], data['y_train'],
            validation_data=(data['X_val'], data['y_val']),
            epochs=epochs,
            batch_size=batch_size,
            callbacks=callbacks,
            verbose=1
        )
        
        return self.training_history
    
    def evaluate_model(self, data: Dict[str, np.ndarray]) -> Dict[str, float]:
        """
        Evaluate the trained model.
        
        Args:
            data: Test data dictionary
            
        Returns:
            Dictionary containing evaluation metrics
        """
        if self.model is None:
            raise ValueError("Model not trained.")
        
        # Evaluate on test data
        test_loss, test_accuracy = self.model.evaluate(
            data['X_test'], data['y_test'], verbose=0
        )
        
        # Make predictions
        predictions = self.model.predict(data['X_test'])
        predicted_classes = np.argmax(predictions, axis=1)
        
        # Calculate additional metrics
        from sklearn.metrics import classification_report, confusion_matrix
        
        report = classification_report(data['y_test'], predicted_classes, output_dict=True)
        confusion_mat = confusion_matrix(data['y_test'], predicted_classes)
        
        return {
            'test_loss': test_loss,
            'test_accuracy': test_accuracy,
            'classification_report': report,
            'confusion_matrix': confusion_mat.tolist()
        }
    
    def save_model(self, model_path: str, metadata_path: str = None):
        """
        Save the trained model and metadata.
        
        Args:
            model_path: Path to save the model
            metadata_path: Path to save metadata (optional)
        """
        if self.model is None:
            raise ValueError("No model to save.")
        
        # Save model
        self.model.save(model_path)
        logger.info(f"Model saved to {model_path}")
        
        # Save metadata
        if metadata_path:
            metadata = {
                'input_shape': self.input_shape,
                'num_classes': self.num_classes,
                'label_encoder_classes': self.label_encoder.classes_.tolist(),
                'training_history': {
                    'loss': self.training_history.history['loss'],
                    'accuracy': self.training_history.history['accuracy'],
                    'val_loss': self.training_history.history['val_loss'],
                    'val_accuracy': self.training_history.history['val_accuracy']
                } if self.training_history else None,
                'timestamp': datetime.now().isoformat()
            }
            
            with open(metadata_path, 'w') as f:
                json.dump(metadata, f, indent=2)
            logger.info(f"Metadata saved to {metadata_path}")
    
    def load_model(self, model_path: str, metadata_path: str = None):
        """
        Load a trained model and metadata.
        
        Args:
            model_path: Path to the model file
            metadata_path: Path to metadata file (optional)
        """
        # Load model
        self.model = tf.keras.models.load_model(model_path)
        logger.info(f"Model loaded from {model_path}")
        
        # Load metadata
        if metadata_path and os.path.exists(metadata_path):
            with open(metadata_path, 'r') as f:
                metadata = json.load(f)
            
            self.input_shape = tuple(metadata['input_shape'])
            self.num_classes = metadata['num_classes']
            
            if 'label_encoder_classes' in metadata:
                self.label_encoder.classes_ = np.array(metadata['label_encoder_classes'])
            
            logger.info(f"Metadata loaded from {metadata_path}")


def main():
    """Main function for training a sign language model."""
    # Initialize trainer
    trainer = SignLanguageModelTrainer(input_shape=(189,), num_classes=36)
    
    # Create model
    model = trainer.create_model(model_type="dense")
    print(f"Model created with {model.count_params()} parameters")
    
    # Load dataset (using ASL as example)
    features, labels = trainer.load_dataset("data/asl", dataset_type="asl")
    print(f"Loaded {len(features)} samples with {len(set(labels))} classes")
    
    # Prepare data
    data = trainer.prepare_data(features, labels)
    print(f"Training samples: {len(data['X_train'])}")
    print(f"Validation samples: {len(data['X_val'])}")
    print(f"Test samples: {len(data['X_test'])}")
    
    # Train model
    print("Starting training...")
    history = trainer.train_model(data, epochs=50, batch_size=32)
    
    # Evaluate model
    print("Evaluating model...")
    metrics = trainer.evaluate_model(data)
    print(f"Test Accuracy: {metrics['test_accuracy']:.4f}")
    
    # Save model
    trainer.save_model("sign_language_model.h5", "model_metadata.json")
    print("Training completed!")


if __name__ == "__main__":
    main()
