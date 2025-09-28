#!/usr/bin/env python3
"""
Disease Detection Model for Agricultural Crops
Uses TensorFlow/Keras CNN for image classification
"""

import os
import sys
import numpy as np
import cv2
import tensorflow as tf
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout, BatchNormalization
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau
from PIL import Image
import joblib
import json
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DiseaseDetector:
    """
    CNN-based Disease Detection Model for Agricultural Crops
    """
    
    def __init__(self, model_path=None, config_path=None):
        self.model = None
        self.class_names = []
        self.image_size = (224, 224)  # Standard size for CNN
        self.model_path = model_path or 'ml_models/disease_model.h5'
        self.config_path = config_path or 'ml_models/disease_config.json'
        self.confidence_threshold = 0.7
        
        # Disease class mappings
        self.disease_classes = {
            0: 'Healthy',
            1: 'Bacterial_Blight',
            2: 'Brown_Spot', 
            3: 'Leaf_Blast',
            4: 'Tungro',
            5: 'Pest_Damage',
            6: 'Nutrient_Deficiency',
            7: 'Water_Stress'
        }
        
        # Crop-specific disease mappings
        self.crop_diseases = {
            'Rice': [0, 1, 2, 3, 4],
            'Wheat': [0, 1, 2, 5, 6, 7],
            'Maize': [0, 1, 5, 6, 7],
            'Cotton': [0, 1, 5, 6, 7],
            'Tomato': [0, 1, 2, 5, 6, 7],
            'Potato': [0, 1, 2, 5, 6, 7],
            'General': list(range(8))  # All classes
        }
        
        self.load_model()
    
    def build_model(self, num_classes=8, input_shape=(224, 224, 3)):
        """
        Build CNN architecture for disease classification
        """
        model = Sequential([
            # First convolutional block
            Conv2D(32, (3, 3), activation='relu', input_shape=input_shape),
            BatchNormalization(),
            MaxPooling2D(2, 2),
            
            # Second convolutional block
            Conv2D(64, (3, 3), activation='relu'),
            BatchNormalization(),
            MaxPooling2D(2, 2),
            
            # Third convolutional block
            Conv2D(128, (3, 3), activation='relu'),
            BatchNormalization(),
            MaxPooling2D(2, 2),
            
            # Fourth convolutional block
            Conv2D(256, (3, 3), activation='relu'),
            BatchNormalization(),
            MaxPooling2D(2, 2),
            
            # Flatten and dense layers
            Flatten(),
            Dense(512, activation='relu'),
            Dropout(0.5),
            Dense(256, activation='relu'),
            Dropout(0.3),
            Dense(num_classes, activation='softmax')
        ])
        
        # Compile model
        model.compile(
            optimizer='adam',
            loss='sparse_categorical_crossentropy',
            metrics=['accuracy']
        )
        
        return model
    
    def load_model(self):
        """
        Load pre-trained model or create new one
        """
        try:
            if os.path.exists(self.model_path):
                logger.info(f"Loading existing model from {self.model_path}")
                self.model = load_model(self.model_path)
                
                # Load configuration
                if os.path.exists(self.config_path):
                    with open(self.config_path, 'r') as f:
                        config = json.load(f)
                        self.class_names = config.get('class_names', list(self.disease_classes.values()))
                        self.confidence_threshold = config.get('confidence_threshold', 0.7)
                        
                logger.info("Model loaded successfully")
            else:
                logger.info("No existing model found, creating new model")
                self.model = self.build_model()
                self.class_names = list(self.disease_classes.values())
                self.save_config()
                
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            logger.info("Creating new model")
            self.model = self.build_model()
            self.class_names = list(self.disease_classes.values())
            self.save_config()
    
    def save_config(self):
        """
        Save model configuration
        """
        config = {
            'class_names': self.class_names,
            'confidence_threshold': self.confidence_threshold,
            'image_size': self.image_size,
            'disease_classes': self.disease_classes,
            'crop_diseases': self.crop_diseases,
            'last_updated': datetime.now().isoformat(),
            'model_version': '2.1'
        }
        
        os.makedirs(os.path.dirname(self.config_path), exist_ok=True)
        with open(self.config_path, 'w') as f:
            json.dump(config, f, indent=2)
    
    def preprocess_image(self, image_data):
        """
        Preprocess image for model prediction
        """
        try:
            # Convert bytes to numpy array
            if isinstance(image_data, bytes):
                nparr = np.frombuffer(image_data, np.uint8)
                image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            else:
                image = image_data
            
            # Convert BGR to RGB (OpenCV uses BGR)
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Resize image
            image = cv2.resize(image, self.image_size)
            
            # Normalize pixel values
            image = image.astype(np.float32) / 255.0
            
            # Add batch dimension
            image = np.expand_dims(image, axis=0)
            
            return image
            
        except Exception as e:
            logger.error(f"Error preprocessing image: {e}")
            raise
    
    def extract_features(self, image_data):
        """
        Extract image features for analysis
        """
        try:
            # Convert bytes to numpy array
            if isinstance(image_data, bytes):
                nparr = np.frombuffer(image_data, np.uint8)
                image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            else:
                image = image_data
            
            # Color distribution analysis
            b, g, r = cv2.split(image)
            
            # Convert to percentages
            total_pixels = image.shape[0] * image.shape[1]
            
            # Green channel analysis (leaves)
            green_mask = g > 100
            green_percentage = np.sum(green_mask) / total_pixels * 100
            
            # Brown analysis (diseased areas)
            brown_mask = (r > 100) & (g > 60) & (b < 80)
            brown_percentage = np.sum(brown_mask) / total_pixels * 100
            
            # Yellow analysis (chlorosis)
            yellow_mask = (r > 150) & (g > 150) & (b < 100)
            yellow_percentage = np.sum(yellow_mask) / total_pixels * 100
            
            # Red analysis (severe damage)
            red_mask = (r > 150) & (g < 100) & (b < 100)
            red_percentage = np.sum(red_mask) / total_pixels * 100
            
            # Texture analysis using Laplacian
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
            
            # Edge detection for shape analysis
            edges = cv2.Canny(gray, 100, 200)
            edge_density = np.sum(edges > 0) / total_pixels
            
            # Statistical measures
            mean_intensity = np.mean(gray)
            std_dev = np.std(gray)
            
            return {
                'color_distribution': {
                    'green_percentage': float(green_percentage),
                    'brown_percentage': float(brown_percentage),
                    'yellow_percentage': float(yellow_percentage),
                    'red_percentage': float(red_percentage)
                },
                'texture_analysis': {
                    'smoothness': float(1.0 / (1.0 + laplacian_var / 1000.0)),
                    'roughness': float(laplacian_var / 1000.0),
                    'uniformity': float(1.0 / (1.0 + std_dev / 100.0))
                },
                'shape_analysis': {
                    'leaf_area_coverage': float(green_percentage),
                    'edge_detection_score': float(edge_density),
                    'symmetry_score': 0.7  # Placeholder - would need more complex analysis
                },
                'statistical_measures': {
                    'mean_intensity': float(mean_intensity),
                    'standard_deviation': float(std_dev),
                    'contrast_ratio': float(std_dev / mean_intensity if mean_intensity > 0 else 0)
                }
            }
            
        except Exception as e:
            logger.error(f"Error extracting features: {e}")
            return {}
    
    def predict(self, image_data, crop_type='General'):
        """
        Predict disease from image
        """
        try:
            start_time = datetime.now()
            
            # Preprocess image
            processed_image = self.preprocess_image(image_data)
            
            # Get predictions
            predictions = self.model.predict(processed_image)
            prediction_probs = predictions[0]
            
            # Filter predictions by crop type
            valid_classes = self.crop_diseases.get(crop_type, list(range(len(self.disease_classes))))
            
            # Create filtered predictions
            filtered_predictions = []
            for class_idx in valid_classes:
                if class_idx < len(prediction_probs):
                    confidence = float(prediction_probs[class_idx])
                    disease_name = self.disease_classes[class_idx]
                    
                    filtered_predictions.append({
                        'disease': disease_name,
                        'confidence': confidence,
                        'class_index': class_idx
                    })
            
            # Sort by confidence
            filtered_predictions.sort(key=lambda x: x['confidence'], reverse=True)
            
            # Get primary prediction
            primary_prediction = filtered_predictions[0] if filtered_predictions else {
                'disease': 'Unknown',
                'confidence': 0.0,
                'class_index': -1
            }
            
            # Calculate health score (inverse of disease confidence, with healthy bias)
            if primary_prediction['disease'] == 'Healthy':
                health_score = primary_prediction['confidence']
            else:
                health_score = max(0.1, 1.0 - primary_prediction['confidence'])
            
            # Processing time
            processing_time = int((datetime.now() - start_time).total_seconds() * 1000)
            
            # Extract image features
            image_features = self.extract_features(image_data)
            
            # Generate result
            result = {
                'primary_prediction': primary_prediction,
                'all_predictions': filtered_predictions[:5],  # Top 5
                'health_score': health_score,
                'health_status': self.get_health_status(health_score),
                'confidence': primary_prediction['confidence'],
                'processing_time_ms': processing_time,
                'image_features': image_features,
                'crop_type': crop_type,
                'model_version': 'DiseaseDetector-v2.1-CNN'
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Error in prediction: {e}")
            raise
    
    def get_health_status(self, health_score):
        """
        Convert health score to status
        """
        if health_score >= 0.8:
            return 'Excellent'
        elif health_score >= 0.6:
            return 'Good'
        elif health_score >= 0.4:
            return 'Fair'
        else:
            return 'Poor'
    
    def train_model(self, train_data_path, validation_data_path=None, epochs=50, batch_size=32):
        """
        Train the disease detection model
        """
        try:
            logger.info("Starting model training...")
            
            # Data generators with augmentation
            train_datagen = ImageDataGenerator(
                rescale=1./255,
                rotation_range=20,
                width_shift_range=0.2,
                height_shift_range=0.2,
                shear_range=0.2,
                zoom_range=0.2,
                horizontal_flip=True,
                validation_split=0.2 if validation_data_path is None else 0.0
            )
            
            # Training data generator
            train_generator = train_datagen.flow_from_directory(
                train_data_path,
                target_size=self.image_size,
                batch_size=batch_size,
                class_mode='sparse',
                subset='training' if validation_data_path is None else None
            )
            
            # Validation data generator
            if validation_data_path:
                val_datagen = ImageDataGenerator(rescale=1./255)
                validation_generator = val_datagen.flow_from_directory(
                    validation_data_path,
                    target_size=self.image_size,
                    batch_size=batch_size,
                    class_mode='sparse'
                )
            else:
                validation_generator = train_datagen.flow_from_directory(
                    train_data_path,
                    target_size=self.image_size,
                    batch_size=batch_size,
                    class_mode='sparse',
                    subset='validation'
                )
            
            # Update class names
            self.class_names = [train_generator.class_indices[i] for i in sorted(train_generator.class_indices.keys())]
            
            # Callbacks
            callbacks = [
                ModelCheckpoint(self.model_path, save_best_only=True, monitor='val_accuracy'),
                EarlyStopping(patience=10, restore_best_weights=True),
                ReduceLROnPlateau(patience=5, factor=0.5)
            ]
            
            # Train model
            history = self.model.fit(
                train_generator,
                epochs=epochs,
                validation_data=validation_generator,
                callbacks=callbacks
            )
            
            # Save configuration
            self.save_config()
            
            logger.info("Model training completed successfully")
            return history
            
        except Exception as e:
            logger.error(f"Error training model: {e}")
            raise

# Global instance
disease_detector = None

def get_disease_detector():
    """
    Get global disease detector instance (singleton)
    """
    global disease_detector
    if disease_detector is None:
        disease_detector = DiseaseDetector()
    return disease_detector

def analyze_crop_image_ml(image_data, crop_type='General'):
    """
    Analyze crop image using ML model
    """
    detector = get_disease_detector()
    return detector.predict(image_data, crop_type)

if __name__ == "__main__":
    # Test the disease detector
    detector = DiseaseDetector()
    print("Disease Detector initialized successfully!")
    print(f"Model loaded: {detector.model is not None}")
    print(f"Classes: {detector.class_names}")
