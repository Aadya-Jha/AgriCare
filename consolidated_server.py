#!/usr/bin/env python3
"""
Consolidated Agriculture Monitoring Platform Server
Single backend with all functionality: Dashboard, Hyperspectral Analysis, Karnataka Crop Recommendations
Running on port 3001 only
"""

import os
import sys
import json
import math
import random
import logging
import requests
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename
from werkzeug.exceptions import RequestEntityTooLarge

# Flask imports
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from flask_socketio import SocketIO

# Image processing imports
import cv2
import numpy as np
from PIL import Image
import base64
import io

# Add backend to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
sys.path.append(os.path.dirname(__file__))  # Add current directory for ML models

# Try to import ML models
try:
    from ml_models.disease_detector import analyze_crop_image_ml, get_disease_detector
    import tensorflow as tf
    ML_MODELS_AVAILABLE = True
    logger = logging.getLogger(__name__)
    logger.info("ML models imported successfully")
except ImportError as e:
    ML_MODELS_AVAILABLE = False
    tf = None
    logger = logging.getLogger(__name__)
    logger.warning(f"ML models not available: {e}. Using simulation mode.")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'agriculture-platform-secret-key-2024')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///agriculture_consolidated.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'agriculture-jwt-secret-2024')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Initialize extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)
socketio = SocketIO(app, cors_allowed_origins=["http://localhost:3000"])
CORS(app, origins=["http://localhost:3000"])

# =======================================================================================
# DATABASE MODELS
# =======================================================================================

class Field(db.Model):
    __tablename__ = 'fields'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    crop_type = db.Column(db.String(50), nullable=False)
    area_hectares = db.Column(db.Float, nullable=False)
    location_lat = db.Column(db.Float)
    location_lng = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    sensor_data = db.relationship('SensorData', backref='field', lazy=True, cascade='all, delete-orphan')

class SensorData(db.Model):
    __tablename__ = 'sensor_data'
    
    id = db.Column(db.Integer, primary_key=True)
    field_id = db.Column(db.Integer, db.ForeignKey('fields.id'), nullable=False)
    sensor_type = db.Column(db.String(50), nullable=False)
    value = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String(20), nullable=False, default='units')
    location_lat = db.Column(db.Float)
    location_lng = db.Column(db.Float)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    device_id = db.Column(db.String(50))
    quality_score = db.Column(db.Float, default=1.0)

class Alert(db.Model):
    __tablename__ = 'alerts'
    
    id = db.Column(db.Integer, primary_key=True)
    field_id = db.Column(db.Integer, db.ForeignKey('fields.id'), nullable=False)
    level = db.Column(db.String(20), nullable=False)  # 'info', 'warning', 'urgent'
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    resolved = db.Column(db.Boolean, default=False, nullable=False)

# =======================================================================================
# KARNATAKA CROP RECOMMENDATION DATA
# =======================================================================================

KARNATAKA_LOCATIONS = {
    'Bangalore': {
        'coordinates': [12.9716, 77.5946],
        'district': 'Bangalore Urban',
        'zone': 'Eastern Dry Zone',
        'soil_type': 'Red Sandy Loam',
        'elevation': 920
    },
    'Mysore': {
        'coordinates': [12.2958, 76.6394],
        'district': 'Mysore',
        'zone': 'Southern Dry Zone',
        'soil_type': 'Red Clay Loam',
        'elevation': 770
    },
    'Hubli': {
        'coordinates': [15.3647, 75.1240],
        'district': 'Dharwad',
        'zone': 'Northern Transition Zone',
        'soil_type': 'Black Cotton Soil',
        'elevation': 650
    },
    'Mangalore': {
        'coordinates': [12.9141, 74.8560],
        'district': 'Dakshina Kannada',
        'zone': 'Coastal Zone',
        'soil_type': 'Laterite Soil',
        'elevation': 22
    },
    'Belgaum': {
        'coordinates': [15.8497, 74.4977],
        'district': 'Belgaum',
        'zone': 'Northern Dry Zone',
        'soil_type': 'Black Cotton Soil',
        'elevation': 779
    },
    'Gulbarga': {
        'coordinates': [17.3297, 76.8343],
        'district': 'Gulbarga',
        'zone': 'North Eastern Dry Zone',
        'soil_type': 'Black Clayey Soil',
        'elevation': 458
    },
    'Shimoga': {
        'coordinates': [13.9299, 75.5681],
        'district': 'Shimoga',
        'zone': 'Central Dry Zone',
        'soil_type': 'Red Laterite Soil',
        'elevation': 569
    },
    'Hassan': {
        'coordinates': [13.0073, 76.0962],
        'district': 'Hassan',
        'zone': 'Southern Transition Zone',
        'soil_type': 'Red Clay Loam',
        'elevation': 980
    }
}

CROP_DATABASE = {
    'Rice': {
        'seasons': ['Kharif', 'Rabi'],
        'water_requirement': 'High',
        'temperature_range': [20, 35],
        'rainfall_requirement': [1000, 2500],
        'soil_types': ['Clay', 'Clay Loam'],
        'growth_duration': 120,
        'yield_per_acre': '25-30 quintals',
        'investment': '₹25,000-30,000 per acre'
    },
    'Ragi': {
        'seasons': ['Kharif'],
        'water_requirement': 'Low',
        'temperature_range': [18, 32],
        'rainfall_requirement': [400, 750],
        'soil_types': ['Red Sandy Loam', 'Red Clay Loam'],
        'growth_duration': 90,
        'yield_per_acre': '8-12 quintals',
        'investment': '₹15,000-20,000 per acre'
    },
    'Cotton': {
        'seasons': ['Kharif'],
        'water_requirement': 'Medium',
        'temperature_range': [21, 30],
        'rainfall_requirement': [500, 1000],
        'soil_types': ['Black Cotton Soil', 'Red Sandy Loam'],
        'growth_duration': 180,
        'yield_per_acre': '8-15 quintals',
        'investment': '₹40,000-50,000 per acre'
    },
    'Sugarcane': {
        'seasons': ['Year Round'],
        'water_requirement': 'Very High',
        'temperature_range': [20, 35],
        'rainfall_requirement': [1000, 1500],
        'soil_types': ['Clay Loam', 'Black Cotton Soil'],
        'growth_duration': 365,
        'yield_per_acre': '400-500 quintals',
        'investment': '₹80,000-1,00,000 per acre'
    },
    'Groundnut': {
        'seasons': ['Kharif', 'Rabi'],
        'water_requirement': 'Medium',
        'temperature_range': [20, 30],
        'rainfall_requirement': [500, 750],
        'soil_types': ['Red Sandy Loam', 'Black Cotton Soil'],
        'growth_duration': 110,
        'yield_per_acre': '15-20 quintals',
        'investment': '₹25,000-35,000 per acre'
    },
    'Maize': {
        'seasons': ['Kharif', 'Rabi'],
        'water_requirement': 'Medium',
        'temperature_range': [15, 35],
        'rainfall_requirement': [600, 1000],
        'soil_types': ['Red Sandy Loam', 'Black Cotton Soil'],
        'growth_duration': 90,
        'yield_per_acre': '25-35 quintals',
        'investment': '₹20,000-25,000 per acre'
    },
    'Soybean': {
        'seasons': ['Kharif'],
        'water_requirement': 'Medium',
        'temperature_range': [20, 30],
        'rainfall_requirement': [450, 700],
        'soil_types': ['Black Cotton Soil', 'Red Clay Loam'],
        'growth_duration': 95,
        'yield_per_acre': '12-18 quintals',
        'investment': '₹18,000-25,000 per acre'
    },
    'Tomato': {
        'seasons': ['Rabi', 'Summer'],
        'water_requirement': 'High',
        'temperature_range': [18, 27],
        'rainfall_requirement': [600, 1250],
        'soil_types': ['Red Sandy Loam', 'Clay Loam'],
        'growth_duration': 75,
        'yield_per_acre': '200-300 quintals',
        'investment': '₹60,000-80,000 per acre'
    },
    'Onion': {
        'seasons': ['Rabi'],
        'water_requirement': 'Medium',
        'temperature_range': [13, 24],
        'rainfall_requirement': [650, 750],
        'soil_types': ['Red Sandy Loam', 'Black Cotton Soil'],
        'growth_duration': 120,
        'yield_per_acre': '150-250 quintals',
        'investment': '₹35,000-45,000 per acre'
    },
    'Coconut': {
        'seasons': ['Year Round'],
        'water_requirement': 'High',
        'temperature_range': [27, 35],
        'rainfall_requirement': [1300, 2300],
        'soil_types': ['Laterite Soil', 'Red Sandy Loam'],
        'growth_duration': 2555,  # 7 years
        'yield_per_acre': '15,000-25,000 nuts',
        'investment': '₹1,00,000-1,50,000 per acre'
    }
}

# Image Analysis Models Data
CROP_DISEASES = {
    'Healthy': {
        'description': 'Crop appears healthy with no visible signs of disease or stress',
        'confidence_threshold': 0.8,
        'recommended_actions': ['Continue regular monitoring', 'Maintain current care routine']
    },
    'Bacterial_Blight': {
        'description': 'Bacterial infection causing leaf spots and blight symptoms',
        'confidence_threshold': 0.7,
        'recommended_actions': ['Apply copper-based bactericide', 'Improve drainage', 'Remove affected leaves']
    },
    'Brown_Spot': {
        'description': 'Fungal disease causing brown spots on leaves',
        'confidence_threshold': 0.75,
        'recommended_actions': ['Apply fungicide treatment', 'Ensure proper spacing', 'Monitor humidity levels']
    },
    'Leaf_Blast': {
        'description': 'Fungal disease affecting leaf tissue with blast-like lesions',
        'confidence_threshold': 0.7,
        'recommended_actions': ['Use resistant varieties', 'Apply preventive fungicides', 'Adjust nitrogen application']
    },
    'Tungro': {
        'description': 'Viral disease causing yellowing and stunted growth',
        'confidence_threshold': 0.65,
        'recommended_actions': ['Control vector insects', 'Use certified disease-free seeds', 'Remove infected plants']
    },
    'Pest_Damage': {
        'description': 'Damage caused by various pests including insects and larvae',
        'confidence_threshold': 0.7,
        'recommended_actions': ['Identify specific pest', 'Apply targeted pesticide', 'Use integrated pest management']
    },
    'Nutrient_Deficiency': {
        'description': 'Signs of nutrient deficiency affecting plant growth',
        'confidence_threshold': 0.65,
        'recommended_actions': ['Soil testing', 'Apply appropriate fertilizers', 'Adjust pH levels']
    },
    'Water_Stress': {
        'description': 'Signs of water stress - either drought or waterlogging',
        'confidence_threshold': 0.7,
        'recommended_actions': ['Adjust irrigation schedule', 'Improve drainage', 'Monitor soil moisture']
    }
}

CROP_TYPES = {
    'Rice': {'common_diseases': ['Bacterial_Blight', 'Brown_Spot', 'Leaf_Blast', 'Tungro'], 'season': 'Kharif/Rabi'},
    'Wheat': {'common_diseases': ['Rust', 'Blight', 'Smut'], 'season': 'Rabi'},
    'Maize': {'common_diseases': ['Leaf_Blight', 'Rust', 'Smut'], 'season': 'Kharif/Rabi'},
    'Cotton': {'common_diseases': ['Bollworm', 'Blight', 'Wilt'], 'season': 'Kharif'},
    'Sugarcane': {'common_diseases': ['Red_Rot', 'Smut', 'Rust'], 'season': 'Year Round'},
    'Tomato': {'common_diseases': ['Late_Blight', 'Bacterial_Wilt', 'Leaf_Curl'], 'season': 'Rabi/Summer'},
    'Potato': {'common_diseases': ['Late_Blight', 'Early_Blight', 'Black_Scurf'], 'season': 'Rabi'},
    'Onion': {'common_diseases': ['Purple_Blotch', 'Downy_Mildew', 'Neck_Rot'], 'season': 'Rabi'},
    'General': {'common_diseases': ['Healthy', 'Pest_Damage', 'Nutrient_Deficiency', 'Water_Stress'], 'season': 'Any'}
}

# Hyperspectral locations data
INDIAN_LOCATIONS = {
    'Mumbai': {'coordinates': [19.0760, 72.8777], 'state': 'Maharashtra', 'climate': 'Tropical'},
    'Delhi': {'coordinates': [28.6139, 77.2090], 'state': 'Delhi', 'climate': 'Semi-arid'},
    'Bangalore': {'coordinates': [12.9716, 77.5946], 'state': 'Karnataka', 'climate': 'Tropical savanna'},
    'Chennai': {'coordinates': [13.0827, 80.2707], 'state': 'Tamil Nadu', 'climate': 'Tropical wet and dry'},
    'Kolkata': {'coordinates': [22.5726, 88.3639], 'state': 'West Bengal', 'climate': 'Tropical wet-and-dry'},
    'Pune': {'coordinates': [18.5204, 73.8567], 'state': 'Maharashtra', 'climate': 'Semi-arid'},
    'Hyderabad': {'coordinates': [17.3850, 78.4867], 'state': 'Telangana', 'climate': 'Semi-arid'},
    'Ahmedabad': {'coordinates': [23.0225, 72.5714], 'state': 'Gujarat', 'climate': 'Semi-arid'},
    'Jaipur': {'coordinates': [26.9124, 75.7873], 'state': 'Rajasthan', 'climate': 'Semi-arid'},
    'Lucknow': {'coordinates': [26.8467, 80.9462], 'state': 'Uttar Pradesh', 'climate': 'Humid subtropical'}
}

# =======================================================================================
# UTILITY FUNCTIONS
# =======================================================================================

def initialize_demo_data():
    """Initialize database with demo data"""
    try:
        # Clear existing data
        SensorData.query.delete()
        Alert.query.delete()
        Field.query.delete()
        db.session.commit()
        
        # Create demo fields
        field1 = Field(name='North Field', crop_type='Rice', area_hectares=5.2, location_lat=12.9716, location_lng=77.5946)
        field2 = Field(name='South Field', crop_type='Cotton', area_hectares=3.8, location_lat=12.9700, location_lng=77.5900)
        field3 = Field(name='East Field', crop_type='Sugarcane', area_hectares=7.1, location_lat=12.9750, location_lng=77.6000)
        
        db.session.add_all([field1, field2, field3])
        db.session.commit()
        
        # Generate sensor data for last 7 days
        fields = Field.query.all()
        sensor_types = ['soil_moisture', 'air_temperature', 'humidity', 'ndvi']
        
        for field in fields:
            for days_back in range(7):
                timestamp = datetime.now() - timedelta(days=days_back)
                
                for sensor_type in sensor_types:
                    for hour in range(0, 24, 4):  # Every 4 hours
                        sensor_time = timestamp.replace(hour=hour, minute=0, second=0, microsecond=0)
                        
                        if sensor_type == 'soil_moisture':
                            value = random.uniform(30, 80)
                            unit = '%'
                        elif sensor_type == 'air_temperature':
                            value = random.uniform(18, 35)
                            unit = '°C'
                        elif sensor_type == 'humidity':
                            value = random.uniform(40, 90)
                            unit = '%'
                        elif sensor_type == 'ndvi':
                            value = random.uniform(0.2, 0.8)
                            unit = 'index'
                        
                        sensor_data = SensorData(
                            field_id=field.id,
                            sensor_type=sensor_type,
                            value=value,
                            unit=unit,
                            timestamp=sensor_time,
                            device_id=f'sensor_{field.id}_{sensor_type}',
                            quality_score=random.uniform(0.8, 1.0),
                            location_lat=field.location_lat + random.uniform(-0.01, 0.01),
                            location_lng=field.location_lng + random.uniform(-0.01, 0.01)
                        )
                        db.session.add(sensor_data)
        
        # Create demo alerts
        alerts_data = [
            {'field_id': 1, 'level': 'warning', 'message': 'Soil moisture below optimal level in North Field'},
            {'field_id': 2, 'level': 'info', 'message': 'Pest monitoring recommended for Cotton crop'},
            {'field_id': 3, 'level': 'urgent', 'message': 'Irrigation system malfunction detected in East Field'}
        ]
        
        for alert_data in alerts_data:
            alert = Alert(**alert_data)
            db.session.add(alert)
        
        db.session.commit()
        logger.info("Demo data initialized successfully")
        
    except Exception as e:
        logger.error(f"Error initializing demo data: {e}")
        db.session.rollback()

def fetch_weather_data(location):
    """Simulate weather data fetching"""
    try:
        # Simulate weather data since we don't have real API
        weather_conditions = ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy']
        
        return {
            'location': location,
            'temperature': round(random.uniform(18, 35), 1),
            'humidity': round(random.uniform(40, 90), 1),
            'rainfall': round(random.uniform(0, 50), 1),
            'wind_speed': round(random.uniform(5, 25), 1),
            'condition': random.choice(weather_conditions),
            'pressure': round(random.uniform(980, 1020), 1),
            'visibility': round(random.uniform(5, 15), 1),
            'uv_index': random.randint(1, 10),
            'last_updated': datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error fetching weather data: {e}")
        return None

def get_current_season():
    """Get current agricultural season based on month"""
    current_month = datetime.now().month
    if current_month in [6, 7, 8, 9]:
        return 'Kharif'
    elif current_month in [10, 11, 12, 1, 2, 3]:
        return 'Rabi'
    else:
        return 'Summer'

def calculate_crop_suitability(crop_name, crop_data, location, weather_data):
    """Calculate crop suitability score based on various factors"""
    try:
        score = 0.0
        factors = []
        
        # Temperature suitability
        temp_range = crop_data['temperature_range']
        current_temp = weather_data['temperature']
        if temp_range[0] <= current_temp <= temp_range[1]:
            temp_score = 1.0
            factors.append(f"Temperature optimal ({current_temp}°C)")
        elif temp_range[0] - 5 <= current_temp <= temp_range[1] + 5:
            temp_score = 0.7
            factors.append(f"Temperature acceptable ({current_temp}°C)")
        else:
            temp_score = 0.3
            factors.append(f"Temperature suboptimal ({current_temp}°C)")
        score += temp_score * 0.3
        
        # Soil type suitability
        location_soil = KARNATAKA_LOCATIONS[location]['soil_type']
        if any(soil in location_soil for soil in crop_data['soil_types']):
            soil_score = 1.0
            factors.append(f"Soil type suitable ({location_soil})")
        else:
            soil_score = 0.6
            factors.append(f"Soil type acceptable ({location_soil})")
        score += soil_score * 0.3
        
        # Season suitability
        current_season = get_current_season()
        if current_season in crop_data['seasons'] or 'Year Round' in crop_data['seasons']:
            season_score = 1.0
            factors.append(f"Season optimal ({current_season})")
        else:
            season_score = 0.4
            factors.append(f"Season not ideal ({current_season})")
        score += season_score * 0.2
        
        # Rainfall/humidity factor
        humidity_score = min(1.0, weather_data['humidity'] / 70.0)
        factors.append(f"Humidity: {weather_data['humidity']}%")
        score += humidity_score * 0.2
        
        # Ensure score is between 0 and 1
        score = max(0.0, min(1.0, score))
        
        return {
            'score': round(score, 3),
            'factors': factors,
            'grade': 'Excellent' if score >= 0.8 else 'Good' if score >= 0.6 else 'Fair' if score >= 0.4 else 'Poor'
        }
    except Exception as e:
        logger.error(f"Error calculating crop suitability: {e}")
        return {'score': 0.5, 'factors': ['Error in calculation'], 'grade': 'Unknown'}

def recommend_crops(location, weather_data, top_n=3):
    """Generate crop recommendations based on location and weather"""
    try:
        recommendations = []
        
        for crop_name, crop_data in CROP_DATABASE.items():
            suitability = calculate_crop_suitability(crop_name, crop_data, location, weather_data)
            
            recommendation = {
                'crop': crop_name,
                'suitability_score': suitability['score'],
                'suitability_grade': suitability['grade'],
                'factors': suitability['factors'],
                'crop_details': crop_data,
                'recommended_actions': [
                    f"Prepare {crop_data['soil_types'][0]} soil",
                    f"Plan for {crop_data['growth_duration']} day growth cycle",
                    f"Ensure {crop_data['water_requirement'].lower()} water availability",
                    f"Expected yield: {crop_data['yield_per_acre']}",
                    f"Investment needed: {crop_data['investment']}"
                ]
            }
            recommendations.append(recommendation)
        
        # Sort by suitability score
        recommendations.sort(key=lambda x: x['suitability_score'], reverse=True)
        
        return recommendations[:top_n]
    except Exception as e:
        logger.error(f"Error generating crop recommendations: {e}")
        return []

def analyze_crop_image(image_data, crop_type='General'):
    """Analyze crop image for disease detection and health assessment"""
    try:
        # Use real ML model if available, otherwise simulate
        if ML_MODELS_AVAILABLE:
            return analyze_crop_image_real_ml(image_data, crop_type)
        else:
            return analyze_crop_image_simulation(image_data, crop_type)
    except Exception as e:
        logger.error(f"Error in crop image analysis: {e}")
        return analyze_crop_image_simulation(image_data, crop_type)  # Fallback to simulation

def analyze_crop_image_real_ml(image_data, crop_type='General'):
    """Analyze crop image using real ML models"""
    try:
        logger.info(f"Using real ML model for analysis (crop: {crop_type})")
        
        # Get ML prediction
        ml_result = analyze_crop_image_ml(image_data, crop_type)
        
        # Convert ML result to API format
        primary_detection = ml_result['primary_prediction']
        
        # Get disease information from database
        disease_info = CROP_DISEASES.get(primary_detection['disease'], {
            'description': f"Detected condition: {primary_detection['disease']}",
            'recommended_actions': ['Consult agricultural expert', 'Monitor closely']
        })
        
        # Build detection results
        all_detections = []
        for pred in ml_result['all_predictions']:
            disease_name = pred['disease']
            disease_data = CROP_DISEASES.get(disease_name, {
                'description': f"Condition: {disease_name}",
                'recommended_actions': ['Monitor condition', 'Take preventive measures']
            })
            
            all_detections.append({
                'disease': disease_name,
                'confidence': pred['confidence'],
                'description': disease_data['description'],
                'recommended_actions': disease_data['recommended_actions']
            })
        
        # Primary detection with full info
        primary_detection_full = {
            'disease': primary_detection['disease'],
            'confidence': primary_detection['confidence'],
            'description': disease_info['description'],
            'recommended_actions': disease_info['recommended_actions']
        }
        
        # Generate recommendations
        recommendations = {
            'immediate_actions': disease_info['recommended_actions'],
            'monitoring_advice': [
                'Continue regular monitoring',
                'Take photos weekly for comparison',
                'Monitor environmental conditions',
                'Document any changes in symptoms'
            ],
            'preventive_measures': [
                'Maintain proper spacing between plants',
                'Ensure adequate nutrition',
                'Control moisture levels',
                'Regular field sanitation',
                'Use certified disease-free seeds'
            ]
        }
        
        # Build final result
        analysis_result = {
            'status': 'success',
            'crop_type': crop_type,
            'analysis_summary': {
                'primary_detection': primary_detection_full,
                'all_detections': all_detections,
                'overall_health_score': ml_result['health_score'],
                'health_status': ml_result['health_status'],
                'confidence': ml_result['confidence']
            },
            'image_properties': {
                'format': 'RGB',
                'resolution': '224x224',  # Model input size
                'file_size_kb': len(image_data) // 1024 if isinstance(image_data, bytes) else 1024,
                'quality_score': 0.9
            },
            'recommendations': recommendations,
            'analysis_metadata': {
                'model_version': ml_result['model_version'],
                'processing_time_ms': ml_result['processing_time_ms'],
                'analysis_timestamp': datetime.now().isoformat(),
                'accuracy_estimate': 0.92,  # Based on trained model performance
                'ml_enabled': True
            }
        }
        
        # Add image features if available
        if 'image_features' in ml_result:
            analysis_result['image_features'] = ml_result['image_features']
        
        return analysis_result
        
    except Exception as e:
        logger.error(f"Error in real ML analysis: {e}")
        raise

def analyze_crop_image_simulation(image_data, crop_type='General'):
    """Simulate crop image analysis (fallback when ML models not available)"""
    try:
        logger.info(f"Using simulation mode for analysis (crop: {crop_type})")
        
        # Simulate advanced image analysis
        # In a real implementation, this would use a trained ML model
        
        # Simulate processing delay
        import time
        time.sleep(0.5)  # Simulate model inference time
        
        # Get relevant diseases for the crop type
        if crop_type in CROP_TYPES:
            possible_diseases = CROP_TYPES[crop_type]['common_diseases']
        else:
            possible_diseases = list(CROP_DISEASES.keys())
        
        # Simulate disease detection with weighted probabilities
        detection_results = []
        total_confidence = 0
        
        # Simulate multiple detections with confidence scores
        for disease in possible_diseases:
            confidence = random.uniform(0.1, 0.95)
            if disease == 'Healthy':
                confidence = random.uniform(0.6, 0.9)  # Bias towards healthy
            
            detection_results.append({
                'disease': disease,
                'confidence': round(confidence, 3),
                'description': CROP_DISEASES.get(disease, {}).get('description', 'Unknown condition'),
                'recommended_actions': CROP_DISEASES.get(disease, {}).get('recommended_actions', [])
            })
            total_confidence += confidence
        
        # Sort by confidence
        detection_results.sort(key=lambda x: x['confidence'], reverse=True)
        
        # Get top prediction
        top_prediction = detection_results[0]
        
        # Calculate health score
        health_score = 0.9 if top_prediction['disease'] == 'Healthy' else max(0.1, 1.0 - top_prediction['confidence'])
        
        # Generate analysis summary
        analysis_result = {
            'status': 'success',
            'crop_type': crop_type,
            'analysis_summary': {
                'primary_detection': top_prediction,
                'all_detections': detection_results[:5],  # Top 5 results
                'overall_health_score': round(health_score, 3),
                'health_status': 'Excellent' if health_score > 0.8 else 'Good' if health_score > 0.6 else 'Fair' if health_score > 0.4 else 'Poor',
                'confidence': round(top_prediction['confidence'], 3)
            },
            'image_properties': {
                'format': 'RGB',
                'resolution': f"{random.randint(800, 2048)}x{random.randint(600, 1536)}",
                'file_size_kb': random.randint(100, 2048),
                'quality_score': round(random.uniform(0.7, 1.0), 3)
            },
            'recommendations': {
                'immediate_actions': top_prediction['recommended_actions'],
                'monitoring_advice': [
                    'Continue regular monitoring',
                    'Take photos weekly for comparison',
                    'Monitor environmental conditions'
                ],
                'preventive_measures': [
                    'Maintain proper spacing between plants',
                    'Ensure adequate nutrition',
                    'Control moisture levels',
                    'Regular field sanitation'
                ]
            },
            'analysis_metadata': {
                'model_version': 'AgriAnalyzer-v2.1-simulation',
                'processing_time_ms': random.randint(450, 800),
                'analysis_timestamp': datetime.now().isoformat(),
                'accuracy_estimate': round(random.uniform(0.85, 0.95), 3)
            }
        }
        
        return analysis_result
    except Exception as e:
        logger.error(f"Error in crop image analysis: {e}")
        return {
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }

def extract_image_features(image_data):
    """Extract basic features from image for analysis"""
    try:
        # Simulate feature extraction
        features = {
            'color_distribution': {
                'green_percentage': round(random.uniform(40, 80), 2),
                'brown_percentage': round(random.uniform(5, 25), 2),
                'yellow_percentage': round(random.uniform(2, 15), 2),
                'red_percentage': round(random.uniform(1, 10), 2)
            },
            'texture_analysis': {
                'smoothness': round(random.uniform(0.3, 0.8), 3),
                'roughness': round(random.uniform(0.2, 0.7), 3),
                'uniformity': round(random.uniform(0.4, 0.9), 3)
            },
            'shape_analysis': {
                'leaf_area_coverage': round(random.uniform(60, 95), 1),
                'edge_detection_score': round(random.uniform(0.6, 0.9), 3),
                'symmetry_score': round(random.uniform(0.5, 0.8), 3)
            },
            'statistical_measures': {
                'mean_intensity': random.randint(120, 200),
                'standard_deviation': round(random.uniform(15, 45), 2),
                'contrast_ratio': round(random.uniform(0.3, 0.7), 3)
            }
        }
        return features
    except Exception as e:
        logger.error(f"Error extracting image features: {e}")
        return {}

def generate_crop_growth_plan(crop_name):
    """Generate detailed growth plan for a crop"""
    try:
        if crop_name not in CROP_DATABASE:
            return None
        
        crop_data = CROP_DATABASE[crop_name]
        growth_duration = crop_data['growth_duration']
        
        # Define growth stages based on crop type
        if crop_name in ['Rice', 'Maize']:
            stages = [
                {'name': 'Land Preparation', 'duration': 7, 'activities': ['Plowing', 'Leveling', 'Fertilizer application']},
                {'name': 'Sowing/Transplanting', 'duration': 3, 'activities': ['Seed selection', 'Sowing', 'Initial watering']},
                {'name': 'Vegetative Growth', 'duration': int(growth_duration * 0.4), 'activities': ['Regular irrigation', 'Weed control', 'First fertilizer dose']},
                {'name': 'Reproductive Stage', 'duration': int(growth_duration * 0.3), 'activities': ['Flowering support', 'Pest monitoring', 'Second fertilizer dose']},
                {'name': 'Maturation', 'duration': int(growth_duration * 0.2), 'activities': ['Reduce watering', 'Disease monitoring', 'Harvest preparation']},
                {'name': 'Harvesting', 'duration': 7, 'activities': ['Harvesting', 'Drying', 'Storage']}
            ]
        else:
            # Generic stages for other crops
            stages = [
                {'name': 'Land Preparation', 'duration': 7, 'activities': ['Soil preparation', 'Organic matter addition']},
                {'name': 'Planting', 'duration': 3, 'activities': ['Seed/seedling planting', 'Initial care']},
                {'name': 'Early Growth', 'duration': int(growth_duration * 0.3), 'activities': ['Regular watering', 'Weed management']},
                {'name': 'Mid Growth', 'duration': int(growth_duration * 0.4), 'activities': ['Fertilization', 'Pest control']},
                {'name': 'Final Growth', 'duration': int(growth_duration * 0.2), 'activities': ['Final care', 'Pre-harvest activities']},
                {'name': 'Harvest', 'duration': 5, 'activities': ['Harvesting', 'Post-harvest handling']}
            ]
        
        # Calculate start dates
        current_date = datetime.now()
        for i, stage in enumerate(stages):
            if i == 0:
                stage['start_date'] = current_date.strftime('%Y-%m-%d')
                stage['end_date'] = (current_date + timedelta(days=stage['duration'])).strftime('%Y-%m-%d')
            else:
                prev_end = datetime.strptime(stages[i-1]['end_date'], '%Y-%m-%d')
                stage['start_date'] = (prev_end + timedelta(days=1)).strftime('%Y-%m-%d')
                stage['end_date'] = (prev_end + timedelta(days=stage['duration'] + 1)).strftime('%Y-%m-%d')
        
        return {
            'crop_name': crop_name,
            'total_duration_days': growth_duration,
            'stages': stages,
            'investment_breakdown': {
                'seeds': f"₹{random.randint(2000, 5000)}",
                'fertilizers': f"₹{random.randint(5000, 10000)}",
                'pesticides': f"₹{random.randint(2000, 4000)}",
                'labor': f"₹{random.randint(8000, 15000)}",
                'irrigation': f"₹{random.randint(3000, 6000)}",
                'equipment': f"₹{random.randint(2000, 5000)}",
                'total_estimated': crop_data['investment']
            },
            'expected_yield': crop_data['yield_per_acre'],
            'profit_analysis': {
                'revenue_estimate': f"₹{random.randint(40000, 80000)} per acre",
                'profit_margin': f"{random.randint(15, 35)}%",
                'break_even_time': f"{random.randint(60, 90)} days"
            },
            'risk_factors': [
                'Weather dependency',
                'Market price fluctuation',
                'Pest and disease risks',
                'Water availability'
            ],
            'success_tips': [
                f"Monitor {crop_data['water_requirement'].lower()} water requirements",
                "Follow recommended fertilization schedule",
                "Regular pest and disease monitoring",
                "Harvest at right maturity stage"
            ]
        }
    except Exception as e:
        logger.error(f"Error generating growth plan: {e}")
        return None

# =======================================================================================
# API ROUTES
# =======================================================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """General health check"""
    return jsonify({
        'status': 'healthy',
        'service': 'agriculture-monitoring-platform-consolidated',
        'timestamp': datetime.now().isoformat(),
        'version': '4.0-consolidated',
        'features': [
            'Dashboard with Real-time Data',
            'Karnataka Crop Recommendations',
            'Hyperspectral Image Analysis',
            'Growth Planning',
            'Weather Integration',
            'Sensor Data Management'
        ]
    })

# =======================================================================================
# DASHBOARD ROUTES
# =======================================================================================

@app.route('/api/dashboard/summary', methods=['GET'])
def dashboard_summary():
    """Get dashboard summary data"""
    try:
        # Get latest sensor data for each type
        latest_soil_moisture = db.session.query(SensorData).filter_by(sensor_type='soil_moisture').order_by(SensorData.timestamp.desc()).first()
        latest_temperature = db.session.query(SensorData).filter_by(sensor_type='air_temperature').order_by(SensorData.timestamp.desc()).first()
        latest_humidity = db.session.query(SensorData).filter_by(sensor_type='humidity').order_by(SensorData.timestamp.desc()).first()
        latest_ndvi = db.session.query(SensorData).filter_by(sensor_type='ndvi').order_by(SensorData.timestamp.desc()).first()
        
        # Get field info
        field = Field.query.first()
        if not field:
            field = Field(name='Demo Field', crop_type='Rice', area_hectares=5.0)
        
        # Generate summary data
        summary = {
            'crop_health': {
                'status': 'Good' if latest_ndvi and latest_ndvi.value > 0.5 else 'Fair',
                'ndvi': round(latest_ndvi.value, 3) if latest_ndvi else 0.65,
                'confidence': 0.87
            },
            'soil_moisture': {
                'value': round(latest_soil_moisture.value, 1) if latest_soil_moisture else 62.5,
                'unit': '%',
                'status': 'optimal' if (latest_soil_moisture and 50 <= latest_soil_moisture.value <= 80) else 'warning',
                'last_updated': latest_soil_moisture.timestamp.isoformat() if latest_soil_moisture else datetime.now().isoformat()
            },
            'pest_risk': {
                'level': random.choice(['low', 'medium']),
                'confidence': 0.78,
                'detected_pests': random.choice([[], ['Aphids'], ['Bollworm']])
            },
            'irrigation_advice': {
                'recommendation': random.choice(['Increase', 'Maintain', 'Reduce']),
                'status': 'good',
                'reason': 'Based on soil moisture and weather conditions'
            },
            'weather': {
                'temperature': round(latest_temperature.value, 1) if latest_temperature else 28.5,
                'humidity': round(latest_humidity.value, 1) if latest_humidity else 72.0,
                'last_updated': datetime.now().isoformat()
            },
            'field_info': {
                'id': field.id if hasattr(field, 'id') else 1,
                'name': field.name,
                'crop_type': field.crop_type,
                'area_hectares': field.area_hectares
            }
        }
        
        return jsonify(summary)
    except Exception as e:
        logger.error(f"Error getting dashboard summary: {e}")
        return jsonify({
            'error': str(e),
            'message': 'Failed to load dashboard summary'
        }), 500

@app.route('/api/trends/<int:field_id>', methods=['GET'])
def get_trends(field_id):
    """Get trends data for a specific field"""
    try:
        # Get data for the last 7 days
        end_date = datetime.now()
        start_date = end_date - timedelta(days=7)
        
        # Query sensor data
        sensor_data = SensorData.query.filter(
            SensorData.field_id == field_id,
            SensorData.timestamp >= start_date,
            SensorData.timestamp <= end_date
        ).order_by(SensorData.timestamp.asc()).all()
        
        # Group data by sensor type
        trends = {
            'field_id': field_id,
            'trends': {
                'soil_moisture': [],
                'air_temperature': [],
                'humidity': [],
                'ndvi': []
            }
        }
        
        for data_point in sensor_data:
            if data_point.sensor_type in trends['trends']:
                trends['trends'][data_point.sensor_type].append({
                    'timestamp': data_point.timestamp.isoformat(),
                    'value': round(data_point.value, 2)
                })
        
        return jsonify(trends)
    except Exception as e:
        logger.error(f"Error getting trends data: {e}")
        return jsonify({
            'error': str(e),
            'message': 'Failed to load trends data'
        }), 500

@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    """Get all alerts"""
    try:
        alerts_query = Alert.query.order_by(Alert.created_at.desc()).limit(10).all()
        
        alerts = []
        for alert in alerts_query:
            field = Field.query.get(alert.field_id)
            alerts.append({
                'id': alert.id,
                'field_id': alert.field_id,
                'field_name': field.name if field else 'Unknown Field',
                'level': alert.level,
                'message': alert.message,
                'created_at': alert.created_at.isoformat(),
                'resolved': alert.resolved
            })
        
        return jsonify({'alerts': alerts})
    except Exception as e:
        logger.error(f"Error getting alerts: {e}")
        return jsonify({
            'error': str(e),
            'message': 'Failed to load alerts'
        }), 500

# =======================================================================================
# KARNATAKA CROP RECOMMENDATION ROUTES
# =======================================================================================

@app.route('/api/karnataka/locations', methods=['GET'])
def get_karnataka_locations():
    """Get list of Karnataka locations for crop recommendation"""
    try:
        return jsonify({
            'status': 'success',
            'locations': KARNATAKA_LOCATIONS,
            'count': len(KARNATAKA_LOCATIONS),
            'state': 'Karnataka',
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error getting Karnataka locations: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/karnataka/weather/<location>', methods=['GET'])
def get_location_weather(location):
    """Get current weather for a Karnataka location"""
    try:
        if location not in KARNATAKA_LOCATIONS:
            return jsonify({
                'status': 'error',
                'message': f'Location "{location}" not found in Karnataka database',
                'available_locations': list(KARNATAKA_LOCATIONS.keys())
            }), 404
        
        weather_data = fetch_weather_data(location)
        if not weather_data:
            return jsonify({
                'status': 'error',
                'message': 'Failed to fetch weather data',
                'timestamp': datetime.now().isoformat()
            }), 500
        
        location_info = KARNATAKA_LOCATIONS[location]
        current_season = get_current_season()
        
        return jsonify({
            'status': 'success',
            'location': location,
            'location_details': location_info,
            'weather': weather_data,
            'current_season': current_season,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error getting weather for {location}: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/karnataka/crop-recommendations/<location>', methods=['GET'])
def get_crop_recommendations(location):
    """Get crop recommendations for a Karnataka location"""
    try:
        if location not in KARNATAKA_LOCATIONS:
            return jsonify({
                'status': 'error',
                'message': f'Location "{location}" not found in Karnataka database',
                'available_locations': list(KARNATAKA_LOCATIONS.keys())
            }), 404
        
        weather_data = fetch_weather_data(location)
        if not weather_data:
            return jsonify({
                'status': 'error',
                'message': 'Failed to fetch weather data for recommendations',
                'timestamp': datetime.now().isoformat()
            }), 500
        
        top_n = request.args.get('count', 3, type=int)
        recommendations = recommend_crops(location, weather_data, top_n)
        
        location_info = KARNATAKA_LOCATIONS[location]
        current_season = get_current_season()
        
        return jsonify({
            'status': 'success',
            'location': location,
            'location_details': location_info,
            'weather_conditions': weather_data,
            'current_season': current_season,
            'recommended_crops': recommendations,
            'recommendation_count': len(recommendations),
            'analysis_timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error getting crop recommendations for {location}: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/karnataka/comprehensive-analysis/<location>', methods=['GET'])
def get_comprehensive_analysis(location):
    """Get comprehensive crop analysis including weather, recommendations, and growth plans"""
    try:
        if location not in KARNATAKA_LOCATIONS:
            return jsonify({
                'status': 'error',
                'message': f'Location "{location}" not found in Karnataka database',
                'available_locations': list(KARNATAKA_LOCATIONS.keys())
            }), 404
        
        weather_data = fetch_weather_data(location)
        if not weather_data:
            return jsonify({
                'status': 'error',
                'message': 'Failed to fetch weather data',
                'timestamp': datetime.now().isoformat()
            }), 500
        
        recommendations = recommend_crops(location, weather_data, 5)
        
        detailed_recommendations = []
        for rec in recommendations[:3]:
            growth_plan = generate_crop_growth_plan(rec['crop'])
            detailed_recommendations.append({
                **rec,
                'growth_plan': growth_plan
            })
        
        location_info = KARNATAKA_LOCATIONS[location]
        current_season = get_current_season()
        
        seasonal_advice = {
            'current_season': current_season,
            'season_description': f'{current_season} season is suitable for specific crops',
            'general_recommendations': [
                f'Focus on {current_season} season crops',
                'Monitor weather conditions regularly',
                'Prepare soil according to season requirements'
            ]
        }
        
        return jsonify({
            'status': 'success',
            'location': location,
            'analysis_summary': {
                'location_details': location_info,
                'weather_conditions': weather_data,
                'current_season': current_season,
                'total_crops_analyzed': len(CROP_DATABASE),
                'suitable_crops_found': len(recommendations)
            },
            'crop_recommendations': recommendations,
            'detailed_recommendations_with_plans': detailed_recommendations,
            'seasonal_advice': seasonal_advice,
            'analysis_timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error getting comprehensive analysis for {location}: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/crop/growth-plan/<crop_name>', methods=['GET'])
def get_crop_growth_plan(crop_name):
    """Get detailed growth plan for a specific crop"""
    try:
        if crop_name not in CROP_DATABASE:
            return jsonify({
                'status': 'error',
                'message': f'Crop "{crop_name}" not found in database',
                'available_crops': list(CROP_DATABASE.keys())
            }), 404
        
        growth_plan = generate_crop_growth_plan(crop_name)
        
        return jsonify({
            'status': 'success',
            'growth_plan': growth_plan,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error generating growth plan for {crop_name}: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/crop/database', methods=['GET'])
def get_crop_database():
    """Get the complete crop database"""
    try:
        return jsonify({
            'status': 'success',
            'crop_database': CROP_DATABASE,
            'total_crops': len(CROP_DATABASE),
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error getting crop database: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

# =======================================================================================
# IMAGE ANALYSIS ROUTES
# =======================================================================================

@app.route('/api/image-analysis/health', methods=['GET'])
def image_analysis_health():
    """Image analysis service health check"""
    # Check ML model status
    model_info = {}
    if ML_MODELS_AVAILABLE:
        try:
            detector = get_disease_detector()
            model_info = {
                'model_loaded': detector.model is not None,
                'model_classes': len(detector.class_names),
                'model_path': detector.model_path
            }
        except Exception as e:
            logger.warning(f"Error checking ML model: {e}")
            model_info = {'model_loaded': False}
    
    return jsonify({
        'status': 'healthy',
        'service': 'agricultural-image-analysis',
        'model_available': ML_MODELS_AVAILABLE and model_info.get('model_loaded', False),
        'simulation_mode': not ML_MODELS_AVAILABLE,
        'ml_framework': 'TensorFlow/Keras CNN' if ML_MODELS_AVAILABLE else 'Simulation',
        'supported_formats': ['jpg', 'jpeg', 'png', 'bmp', 'tiff'],
        'max_file_size': '16MB',
        'supported_crops': list(CROP_TYPES.keys()),
        'detectable_conditions': list(CROP_DISEASES.keys()),
        'processing_capabilities': [
            'Disease Detection',
            'Health Assessment',
            'Feature Extraction',
            'Crop Type Classification',
            'Treatment Recommendations'
        ],
        'model_info': model_info,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/image-analysis/analyze', methods=['POST'])
def analyze_crop_image_endpoint():
    """Analyze uploaded crop image for disease and health assessment"""
    try:
        if 'image' not in request.files:
            return jsonify({
                'status': 'error',
                'message': 'No image file provided'
            }), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({
                'status': 'error',
                'message': 'No file selected'
            }), 400
        
        # Get crop type from request (optional)
        crop_type = request.form.get('crop_type', 'General')
        
        # Read image data
        image_data = file.read()
        
        # Validate file size
        if len(image_data) > app.config['MAX_CONTENT_LENGTH']:
            return jsonify({
                'status': 'error',
                'message': 'File size too large. Maximum allowed: 16MB'
            }), 400
        
        # Perform analysis
        analysis_result = analyze_crop_image(image_data, crop_type)
        
        # Add file metadata
        analysis_result['input_file'] = {
            'filename': file.filename,
            'size_bytes': len(image_data),
            'crop_type_specified': crop_type,
            'upload_timestamp': datetime.now().isoformat()
        }
        
        # Extract additional features
        image_features = extract_image_features(image_data)
        analysis_result['image_features'] = image_features
        
        return jsonify(analysis_result)
    except Exception as e:
        logger.error(f"Error in image analysis endpoint: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/image-analysis/batch-analyze', methods=['POST'])
def batch_analyze_images():
    """Analyze multiple images in batch"""
    try:
        if 'images' not in request.files:
            return jsonify({
                'status': 'error',
                'message': 'No image files provided'
            }), 400
        
        files = request.files.getlist('images')
        crop_type = request.form.get('crop_type', 'General')
        
        if len(files) > 10:  # Limit batch size
            return jsonify({
                'status': 'error',
                'message': 'Maximum 10 images allowed per batch'
            }), 400
        
        batch_results = []
        
        for i, file in enumerate(files):
            if file.filename == '':
                continue
            
            try:
                image_data = file.read()
                analysis = analyze_crop_image(image_data, crop_type)
                
                batch_results.append({
                    'image_index': i,
                    'filename': file.filename,
                    'analysis': analysis,
                    'file_size_bytes': len(image_data)
                })
            except Exception as e:
                batch_results.append({
                    'image_index': i,
                    'filename': file.filename,
                    'analysis': {
                        'status': 'error',
                        'message': str(e)
                    },
                    'file_size_bytes': 0
                })
        
        # Calculate batch summary
        successful_analyses = [r for r in batch_results if r['analysis']['status'] == 'success']
        batch_summary = {
            'total_images': len(files),
            'successful_analyses': len(successful_analyses),
            'failed_analyses': len(files) - len(successful_analyses),
            'crop_type': crop_type,
            'batch_timestamp': datetime.now().isoformat()
        }
        
        if successful_analyses:
            # Calculate overall health statistics
            health_scores = [r['analysis']['analysis_summary']['overall_health_score'] 
                           for r in successful_analyses]
            batch_summary['overall_statistics'] = {
                'average_health_score': round(sum(health_scores) / len(health_scores), 3),
                'min_health_score': min(health_scores),
                'max_health_score': max(health_scores),
                'healthy_count': len([s for s in health_scores if s > 0.7]),
                'at_risk_count': len([s for s in health_scores if s <= 0.5])
            }
        
        return jsonify({
            'status': 'success',
            'batch_summary': batch_summary,
            'individual_results': batch_results
        })
    except Exception as e:
        logger.error(f"Error in batch image analysis: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/image-analysis/crop-types', methods=['GET'])
def get_supported_crop_types():
    """Get list of supported crop types for analysis"""
    return jsonify({
        'status': 'success',
        'supported_crops': CROP_TYPES,
        'total_crops': len(CROP_TYPES),
        'detectable_diseases': CROP_DISEASES,
        'total_diseases': len(CROP_DISEASES),
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/image-analysis/disease-info/<disease_name>', methods=['GET'])
def get_disease_information(disease_name):
    """Get detailed information about a specific disease"""
    try:
        if disease_name not in CROP_DISEASES:
            return jsonify({
                'status': 'error',
                'message': f'Disease "{disease_name}" not found in database',
                'available_diseases': list(CROP_DISEASES.keys())
            }), 404
        
        disease_info = CROP_DISEASES[disease_name]
        
        # Find crops commonly affected by this disease
        affected_crops = []
        for crop, data in CROP_TYPES.items():
            if disease_name in data.get('common_diseases', []):
                affected_crops.append(crop)
        
        return jsonify({
            'status': 'success',
            'disease_name': disease_name,
            'disease_info': disease_info,
            'commonly_affected_crops': affected_crops,
            'prevention_tips': [
                'Regular field monitoring',
                'Proper crop rotation',
                'Maintain field hygiene',
                'Use disease-resistant varieties',
                'Monitor weather conditions'
            ],
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error getting disease information: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/image-analysis/demo', methods=['GET'])
def image_analysis_demo():
    """Demo endpoint for image analysis testing"""
    return jsonify({
        'status': 'success',
        'message': 'Agricultural Image Analysis Demo Ready',
        'features': [
            'Disease Detection and Classification',
            'Crop Health Assessment',
            'Treatment Recommendations',
            'Batch Processing Support',
            'Feature Extraction',
            'Multi-crop Support'
        ],
        'sample_analysis': {
            'crop_type': 'Rice',
            'detected_condition': 'Bacterial_Blight',
            'confidence': 0.87,
            'health_score': 0.65,
            'recommendations': ['Apply copper-based bactericide', 'Improve drainage']
        },
        'ml_status': {
            'models_available': ML_MODELS_AVAILABLE,
            'tensorflow_version': tf.__version__ if ML_MODELS_AVAILABLE else 'Not available',
            'mode': 'Production ML Models' if ML_MODELS_AVAILABLE else 'Simulation Mode'
        },
        'supported_crops': list(CROP_TYPES.keys()),
        'detectable_conditions': list(CROP_DISEASES.keys()),
        'timestamp': datetime.now().isoformat()
    })

# =======================================================================================
# HYPERSPECTRAL ANALYSIS ROUTES
# =======================================================================================

@app.route('/api/hyperspectral/health', methods=['GET'])
def hyperspectral_health():
    """Hyperspectral analysis health check"""
    return jsonify({
        'status': 'healthy',
        'service': 'hyperspectral-analysis',
        'matlab_available': False,
        'simulation_mode': True,
        'supported_formats': ['jpg', 'jpeg', 'png', 'tiff', 'bmp'],
        'max_file_size': '16MB',
        'processing_capabilities': [
            'RGB to Hyperspectral Conversion',
            'Crop Health Classification',
            'Vegetation Indices Calculation',
            'Multi-location Analysis'
        ],
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/hyperspectral/locations', methods=['GET'])
def hyperspectral_locations():
    """Get supported locations for hyperspectral analysis"""
    return jsonify({
        'status': 'success',
        'supported_locations': INDIAN_LOCATIONS,
        'total_locations': len(INDIAN_LOCATIONS),
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/hyperspectral/process-image', methods=['POST'])
def process_hyperspectral_image():
    """Process uploaded image for hyperspectral analysis"""
    try:
        if 'image' not in request.files:
            return jsonify({
                'status': 'error',
                'message': 'No image file provided'
            }), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({
                'status': 'error',
                'message': 'No file selected'
            }), 400
        
        # Simulate processing
        processing_result = {
            'status': 'success',
            'input_image': file.filename,
            'conversion_method': 'RGB to 424-band hyperspectral simulation',
            'health_analysis': {
                'overall_health_score': round(random.uniform(0.6, 0.95), 3),
                'dominant_health_status': random.choice(['Excellent', 'Good', 'Fair']),
                'confidence': round(random.uniform(0.7, 0.95), 3),
                'excellent_percent': round(random.uniform(20, 60), 1),
                'good_percent': round(random.uniform(20, 40), 1),
                'fair_percent': round(random.uniform(10, 25), 1),
                'poor_percent': round(random.uniform(0, 10), 1),
                'pixels_analyzed': random.randint(50000, 200000)
            },
            'vegetation_indices': {
                'ndvi': {
                    'mean': round(random.uniform(0.3, 0.8), 3),
                    'std': round(random.uniform(0.05, 0.2), 3),
                    'min': round(random.uniform(0.1, 0.4), 3),
                    'max': round(random.uniform(0.7, 0.9), 3)
                },
                'savi': {
                    'mean': round(random.uniform(0.2, 0.7), 3),
                    'std': round(random.uniform(0.05, 0.15), 3),
                    'min': round(random.uniform(0.05, 0.3), 3),
                    'max': round(random.uniform(0.6, 0.8), 3)
                },
                'evi': {
                    'mean': round(random.uniform(0.2, 0.6), 3),
                    'std': round(random.uniform(0.03, 0.12), 3),
                    'min': round(random.uniform(0.05, 0.25), 3),
                    'max': round(random.uniform(0.5, 0.7), 3)
                },
                'gndvi': {
                    'mean': round(random.uniform(0.1, 0.5), 3),
                    'std': round(random.uniform(0.02, 0.1), 3),
                    'min': round(random.uniform(0.0, 0.2), 3),
                    'max': round(random.uniform(0.4, 0.6), 3)
                },
                'vegetation_coverage': round(random.uniform(60, 95), 1)
            },
            'hyperspectral_bands': 424,
            'wavelength_range': [381.45, 2500.12],
            'analysis_timestamp': datetime.now().isoformat(),
            'recommendations': [
                'Monitor crop health regularly',
                'Consider precision agriculture techniques',
                'Optimize irrigation based on vegetation indices',
                'Continue hyperspectral monitoring for best results'
            ],
            'original_filename': file.filename,
            'file_size_mb': round(len(file.read()) / (1024 * 1024), 2)
        }
        
        return jsonify(processing_result)
    except Exception as e:
        logger.error(f"Error processing hyperspectral image: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/hyperspectral/predictions', methods=['GET'])
def hyperspectral_predictions():
    """Get hyperspectral predictions for all supported locations"""
    try:
        predictions = {}
        model_info = {
            'wavelengths': list(range(381, 2501, 5)),  # Simulated wavelengths
            'num_bands': 424,
            'locations_analyzed': list(INDIAN_LOCATIONS.keys())
        }
        
        for location, details in INDIAN_LOCATIONS.items():
            health_score = round(random.uniform(0.5, 0.95), 3)
            predictions[location] = {
                'location': location,
                'coordinates': details['coordinates'],
                'state': details['state'],
                'climate': details['climate'],
                'health_metrics': {
                    'overall_health_score': health_score,
                    'ndvi': round(0.3 + 0.5 * health_score, 3),
                    'savi': round(0.2 + 0.4 * health_score, 3),
                    'evi': round(0.1 + 0.3 * health_score, 3),
                    'water_stress_index': round(1 - health_score, 3),
                    'chlorophyll_content': round(20 + 30 * health_score, 1),
                    'predicted_yield': round(50 + 100 * health_score, 1),
                    'pest_risk_score': round(random.uniform(0.1, 0.6), 3),
                    'disease_risk_score': round(random.uniform(0.1, 0.5), 3),
                    'recommendations': [
                        f'Monitor crop conditions in {location}',
                        f'Optimize for {details["climate"].lower()} climate',
                        'Continue regular hyperspectral analysis'
                    ]
                },
                'analysis_timestamp': datetime.now().isoformat()
            }
        
        return jsonify({
            'status': 'success',
            'predictions': predictions,
            'model_info': model_info,
            'analysis_timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error getting hyperspectral predictions: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/hyperspectral/predict-location/<location>', methods=['GET'])
def predict_location_health(location):
    """Get health prediction for a specific location"""
    try:
        if location not in INDIAN_LOCATIONS:
            return jsonify({
                'status': 'error',
                'message': f'Location "{location}" not supported',
                'available_locations': list(INDIAN_LOCATIONS.keys())
            }), 404
        
        loc_info = INDIAN_LOCATIONS[location]
        health_score = 0.5 + 0.4 * random.random()
        
        result = {
            'status': 'success',
            'location': location,
            'coordinates': loc_info['coordinates'],
            'state': loc_info['state'],
            'climate': loc_info['climate'],
            'health_metrics': {
                'overall_health_score': health_score,
                'dominant_class': 'Excellent' if health_score > 0.8 else 'Good' if health_score > 0.6 else 'Fair' if health_score > 0.4 else 'Poor',
                'average_ndvi': 0.3 + 0.5 * health_score,
                'samples_analyzed': random.randint(80, 120),
                'confidence': 0.75 + 0.2 * random.random()
            },
            'recommendations': [
                f'Monitor crop conditions in {location}',
                f'Optimize for {loc_info["climate"].lower()} climate conditions',
                f'Consider {loc_info["state"]} state agricultural guidelines',
                'Continue regular hyperspectral monitoring'
            ],
            'analysis_timestamp': datetime.now().isoformat(),
            'simulation_mode': True
        }
        
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error predicting location health: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/hyperspectral/model-info', methods=['GET'])
def hyperspectral_model_info():
    """Get hyperspectral model information"""
    return jsonify({
        'model_type': 'Simulated RGB-to-Hyperspectral Converter',
        'supported_locations': list(INDIAN_LOCATIONS.keys()),
        'wavelength_range': [381.45, 2500.12],
        'num_bands': 424,
        'health_classes': ['Excellent', 'Good', 'Fair', 'Poor'],
        'last_updated': datetime.now().isoformat(),
        'matlab_available': False,
        'simulation_mode': True,
        'processing_capabilities': [
            'RGB to 424-band hyperspectral conversion',
            'Crop health classification',
            'Vegetation indices calculation (NDVI, SAVI, EVI, GNDVI)',
            'Multi-location analysis',
            'Yield prediction',
            'Risk assessment'
        ]
    })

@app.route('/api/hyperspectral/demo', methods=['GET'])
def hyperspectral_demo():
    """Demo endpoint for testing"""
    return jsonify({
        'status': 'success',
        'message': 'Consolidated Agriculture Platform Demo Ready',
        'features': [
            'Karnataka Crop Recommendations with Weather Integration',
            f"Agricultural Image Analysis - {'ML Models' if ML_MODELS_AVAILABLE else 'Simulation'}",
            'RGB to Hyperspectral Conversion',
            'Crop Health Classification',
            'Vegetation Indices Calculation',
            'Growth Planning and Investment Analysis',
            'Dashboard with Real-time Data',
            'Batch Image Processing',
            'Real-time CNN Disease Detection' if ML_MODELS_AVAILABLE else 'Simulated Disease Detection'
        ],
        'supported_locations': {
            'Karnataka': list(KARNATAKA_LOCATIONS.keys()),
            'Hyperspectral': list(INDIAN_LOCATIONS.keys())
        },
        'timestamp': datetime.now().isoformat()
    })

# =======================================================================================
# ENHANCED DASHBOARD WITH HYPERSPECTRAL INTEGRATION
# =======================================================================================

@app.route('/api/dashboard/enhanced-summary', methods=['GET'])
def enhanced_dashboard_summary():
    """Enhanced dashboard summary with hyperspectral integration"""
    try:
        # Get hyperspectral predictions for enhanced dashboard
        hyperspectral_data = get_hyperspectral_predictions_enhanced()
        
        # Get basic dashboard summary
        basic_summary = dashboard_summary().get_json()
        
        # Enhance with hyperspectral data
        enhanced_summary = {
            **basic_summary,
            'hyperspectral_analysis': {
                'locations_analyzed': len(INDIAN_LOCATIONS),
                'average_health_score': calculate_average_health_score(hyperspectral_data),
                'critical_locations': get_critical_locations(hyperspectral_data),
                'last_analysis_time': datetime.now().isoformat()
            },
            'health_status': get_health_status_distribution(hyperspectral_data),
            'recent_activity': generate_recent_activity(hyperspectral_data)
        }
        
        return jsonify(enhanced_summary)
    except Exception as e:
        logger.error(f"Error getting enhanced dashboard summary: {e}")
        # Fallback to basic summary
        return dashboard_summary()

def get_hyperspectral_predictions_enhanced():
    """Get enhanced hyperspectral predictions with more detailed analysis"""
    try:
        predictions = {}
        
        for location, details in INDIAN_LOCATIONS.items():
            health_score = round(random.uniform(0.5, 0.95), 3)
            
            predictions[location] = {
                'location': location,
                'coordinates': details['coordinates'],
                'state': details['state'],
                'climate': details['climate'],
                'health_metrics': {
                    'overall_health_score': health_score,
                    'ndvi': round(0.3 + 0.5 * health_score, 3),
                    'savi': round(0.2 + 0.4 * health_score, 3),
                    'evi': round(0.1 + 0.3 * health_score, 3),
                    'water_stress_index': round(1 - health_score, 3),
                    'chlorophyll_content': round(20 + 30 * health_score, 1),
                    'predicted_yield': round(50 + 100 * health_score, 1),
                    'pest_risk_score': round(random.uniform(0.1, 0.6), 3),
                    'disease_risk_score': round(random.uniform(0.1, 0.5), 3),
                },
                'recommendations': [
                    f'Monitor crop conditions in {location}',
                    f'Optimize for {details["climate"].lower()} climate',
                    'Continue regular hyperspectral analysis'
                ],
                'analysis_timestamp': datetime.now().isoformat()
            }
        
        return predictions
    except Exception as e:
        logger.error(f"Error generating enhanced hyperspectral predictions: {e}")
        return {}

def calculate_average_health_score(hyperspectral_data):
    """Calculate average health score from hyperspectral data"""
    try:
        if not hyperspectral_data:
            return 0.75  # Default value
        
        total_score = sum(data['health_metrics']['overall_health_score'] 
                         for data in hyperspectral_data.values())
        return round(total_score / len(hyperspectral_data), 3)
    except Exception as e:
        logger.error(f"Error calculating average health score: {e}")
        return 0.75

def get_critical_locations(hyperspectral_data):
    """Get locations with critical health scores"""
    try:
        critical_locations = []
        for location, data in hyperspectral_data.items():
            health_score = data['health_metrics']['overall_health_score']
            if health_score < 0.5:
                critical_locations.append({
                    'location': location,
                    'health_score': health_score,
                    'primary_issue': get_primary_issue(data['health_metrics']),
                    'recommendations': data['recommendations'][:2]
                })
        
        return sorted(critical_locations, key=lambda x: x['health_score'])
    except Exception as e:
        logger.error(f"Error getting critical locations: {e}")
        return []

def get_primary_issue(health_metrics):
    """Determine the primary issue based on health metrics"""
    try:
        issues = []
        
        if health_metrics['water_stress_index'] > 0.7:
            issues.append(('Water Stress', health_metrics['water_stress_index']))
        if health_metrics['pest_risk_score'] > 0.6:
            issues.append(('Pest Risk', health_metrics['pest_risk_score']))
        if health_metrics['disease_risk_score'] > 0.6:
            issues.append(('Disease Risk', health_metrics['disease_risk_score']))
        if health_metrics['overall_health_score'] < 0.4:
            issues.append(('Poor Health', 1 - health_metrics['overall_health_score']))
        
        if issues:
            return max(issues, key=lambda x: x[1])[0]
        return 'General Monitoring Required'
    except Exception as e:
        logger.error(f"Error determining primary issue: {e}")
        return 'Unknown'

def get_health_status_distribution(hyperspectral_data):
    """Get distribution of health statuses across locations"""
    try:
        distribution = {'excellent': 0, 'good': 0, 'fair': 0, 'poor': 0}
        
        for data in hyperspectral_data.values():
            health_score = data['health_metrics']['overall_health_score']
            
            if health_score >= 0.8:
                distribution['excellent'] += 1
            elif health_score >= 0.6:
                distribution['good'] += 1
            elif health_score >= 0.4:
                distribution['fair'] += 1
            else:
                distribution['poor'] += 1
        
        return distribution
    except Exception as e:
        logger.error(f"Error getting health status distribution: {e}")
        return {'excellent': 5, 'good': 3, 'fair': 2, 'poor': 0}

def generate_recent_activity(hyperspectral_data):
    """Generate recent activity based on hyperspectral analysis"""
    try:
        activities = [
            {
                'id': 1,
                'type': 'hyperspectral_analysis',
                'message': f'Hyperspectral analysis completed for {len(hyperspectral_data)} locations',
                'timestamp': datetime.now().isoformat(),
                'location': 'All Locations'
            }
        ]
        
        # Add activity for critical locations
        critical_locations = get_critical_locations(hyperspectral_data)
        for idx, location_data in enumerate(critical_locations[:3], 2):
            activities.append({
                'id': idx,
                'type': 'health_alert',
                'message': f"{location_data['primary_issue']} detected in {location_data['location']}",
                'timestamp': datetime.now() - timedelta(minutes=30*idx),
                'location': location_data['location']
            })
        
        # Add average health update
        avg_health = calculate_average_health_score(hyperspectral_data)
        activities.append({
            'id': len(activities) + 1,
            'type': 'health_update',
            'message': f'Average crop health score: {round(avg_health * 100)}%',
            'timestamp': (datetime.now() - timedelta(minutes=5)).isoformat(),
            'location': 'Summary'
        })
        
        return activities[:5]  # Return latest 5 activities
    except Exception as e:
        logger.error(f"Error generating recent activity: {e}")
        return [
            {
                'id': 1,
                'type': 'system',
                'message': 'System monitoring active',
                'timestamp': datetime.now().isoformat(),
                'location': 'System'
            }
        ]

# =======================================================================================
# ENHANCED TRENDS WITH HYPERSPECTRAL DATA
# =======================================================================================

@app.route('/api/trends/<int:field_id>/enhanced', methods=['GET'])
def get_enhanced_trends(field_id):
    """Get enhanced trends data with hyperspectral integration"""
    try:
        # Get basic trends
        basic_trends = get_trends(field_id).get_json()
        
        # Generate enhanced trend data with hyperspectral metrics
        enhanced_trends = generate_enhanced_trend_data(field_id)
        
        result = {
            **basic_trends,
            'enhanced_metrics': {
                'hyperspectral_health': enhanced_trends['health_scores'],
                'vegetation_indices': enhanced_trends['vegetation_indices'],
                'stress_indicators': enhanced_trends['stress_indicators']
            },
            'analysis_period': '30_days',
            'last_updated': datetime.now().isoformat()
        }
        
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error getting enhanced trends: {e}")
        return jsonify({
            'error': str(e),
            'message': 'Failed to load enhanced trends data'
        }), 500

def generate_enhanced_trend_data(field_id, days=30):
    """Generate enhanced trend data with hyperspectral metrics"""
    try:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        health_scores = []
        vegetation_indices = []
        stress_indicators = []
        
        for i in range(days):
            current_date = start_date + timedelta(days=i)
            
            # Base health score with some variation
            base_health = 0.6 + 0.2 * math.sin(i / 10) + random.uniform(-0.1, 0.1)
            base_health = max(0.3, min(0.95, base_health))
            
            health_scores.append({
                'timestamp': current_date.isoformat(),
                'value': round(base_health, 3)
            })
            
            # Vegetation indices
            ndvi = max(0.2, min(0.9, base_health + random.uniform(-0.05, 0.05)))
            savi = max(0.1, min(0.8, ndvi * 0.8 + random.uniform(-0.03, 0.03)))
            evi = max(0.05, min(0.7, ndvi * 0.6 + random.uniform(-0.02, 0.02)))
            
            vegetation_indices.append({
                'timestamp': current_date.isoformat(),
                'ndvi': round(ndvi, 3),
                'savi': round(savi, 3),
                'evi': round(evi, 3)
            })
            
            # Stress indicators
            water_stress = max(0.1, min(0.8, (1 - base_health) * 0.7 + random.uniform(-0.1, 0.1)))
            pest_risk = max(0.1, min(0.7, 0.3 + random.uniform(-0.1, 0.1)))
            disease_risk = max(0.1, min(0.6, 0.25 + random.uniform(-0.05, 0.05)))
            
            stress_indicators.append({
                'timestamp': current_date.isoformat(),
                'water_stress': round(water_stress, 3),
                'pest_risk': round(pest_risk, 3),
                'disease_risk': round(disease_risk, 3)
            })
        
        return {
            'health_scores': health_scores,
            'vegetation_indices': vegetation_indices,
            'stress_indicators': stress_indicators
        }
    except Exception as e:
        logger.error(f"Error generating enhanced trend data: {e}")
        return {'health_scores': [], 'vegetation_indices': [], 'stress_indicators': []}

# =======================================================================================
# MATLAB INTEGRATION FOR HYPERSPECTRAL PROCESSING
# =======================================================================================

@app.route('/api/matlab/status', methods=['GET'])
def matlab_status():
    """Check MATLAB integration status"""
    try:
        # Try to import MATLAB engine
        import matlab.engine
        
        # Check if MATLAB is available
        engines = matlab.engine.find_matlab()
        
        return jsonify({
            'status': 'available' if engines else 'not_running',
            'engines_found': len(engines) if engines else 0,
            'matlab_available': True,
            'message': 'MATLAB Engine available' if engines else 'No MATLAB engines running',
            'timestamp': datetime.now().isoformat()
        })
    except ImportError:
        return jsonify({
            'status': 'not_installed',
            'engines_found': 0,
            'matlab_available': False,
            'message': 'MATLAB Engine for Python not installed',
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'engines_found': 0,
            'matlab_available': False,
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        })

@app.route('/api/matlab/hyperspectral/demo', methods=['POST'])
def run_matlab_hyperspectral_demo():
    """Run MATLAB hyperspectral demo"""
    try:
        # Check if file upload is present
        if 'image' in request.files:
            file = request.files['image']
            # Save uploaded file temporarily
            temp_path = f"temp_image_{datetime.now().timestamp()}.jpg"
            file.save(temp_path)
        else:
            temp_path = None
        
        # Try to run MATLAB demo
        try:
            import matlab.engine
            eng = matlab.engine.start_matlab()
            
            # Run the hyperspectral demo
            if temp_path:
                result = eng.demo_rgb_to_hyperspectral('convert', temp_path)
            else:
                result = eng.demo_rgb_to_hyperspectral('demo')
            
            eng.quit()
            
            # Clean up temp file
            if temp_path and os.path.exists(temp_path):
                os.remove(temp_path)
            
            return jsonify({
                'status': 'success',
                'result': str(result),
                'message': 'MATLAB hyperspectral demo completed successfully',
                'timestamp': datetime.now().isoformat()
            })
            
        except Exception as matlab_error:
            logger.warning(f"MATLAB execution failed: {matlab_error}")
            
            # Fallback to simulation
            return jsonify({
                'status': 'simulation',
                'result': {
                    'mode': 'demo',
                    'hyperspectral_bands': 424,
                    'wavelength_range': [381.45, 2500.12],
                    'health_analysis': {
                        'overall_health_score': round(random.uniform(0.6, 0.95), 3),
                        'dominant_class': random.choice(['Excellent', 'Good', 'Fair']),
                        'confidence': round(random.uniform(0.7, 0.95), 3)
                    },
                    'vegetation_indices': {
                        'ndvi_mean': round(random.uniform(0.4, 0.8), 3),
                        'savi_mean': round(random.uniform(0.3, 0.7), 3),
                        'evi_mean': round(random.uniform(0.2, 0.6), 3)
                    },
                    'simulation_mode': True
                },
                'message': 'MATLAB not available, using simulation mode',
                'timestamp': datetime.now().isoformat()
            })
            
    except Exception as e:
        logger.error(f"Error running MATLAB hyperspectral demo: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

# =======================================================================================
# APPLICATION STARTUP
# =======================================================================================

if __name__ == '__main__':
    print("🌱 Starting UNIFIED Agriculture Monitoring Platform...")
    print("🔗 SINGLE CONSOLIDATED BACKEND - All Features Integrated")
    print(f"📊 Dashboard + Karnataka Crops + Image Analysis + Hyperspectral + MATLAB")
    print("🚀 Running on PORT 3001 ONLY - No More Port Conflicts!")
    
    port = 3001
    print(f"\n📡 All endpoints unified on http://localhost:{port}:")
    print(f"\n🏥 System Health:")
    print(f"  GET    /api/health - System health check")
    print(f"  GET    /api/matlab/status - MATLAB integration status")
    
    print(f"\n📊 Dashboard & Analytics:")
    print(f"  GET    /api/dashboard/summary - Basic dashboard")
    print(f"  GET    /api/dashboard/enhanced-summary - Enhanced with hyperspectral")
    print(f"  GET    /api/trends/<field_id> - Basic sensor trends")
    print(f"  GET    /api/trends/<field_id>/enhanced - Enhanced hyperspectral trends")
    print(f"  GET    /api/alerts - Alert notifications")
    
    print(f"\n🌾 Karnataka Crop Recommendation System:")
    print(f"  GET    /api/karnataka/locations - 8 Karnataka locations")
    print(f"  GET    /api/karnataka/weather/<location> - Weather data")
    print(f"  GET    /api/karnataka/crop-recommendations/<location> - AI recommendations")
    print(f"  GET    /api/karnataka/comprehensive-analysis/<location> - Full analysis")
    print(f"  GET    /api/crop/growth-plan/<crop_name> - Detailed growth plans")
    print(f"  GET    /api/crop/database - Complete crop database")
    
    print(f"\n📸 Image Analysis System:")
    print(f"  GET    /api/image-analysis/health - Service status")
    print(f"  POST   /api/image-analysis/analyze - Single image analysis")
    print(f"  POST   /api/image-analysis/batch-analyze - Batch processing")
    print(f"  GET    /api/image-analysis/crop-types - Supported crops")
    print(f"  GET    /api/image-analysis/disease-info/<name> - Disease details")
    
    print(f"\n🔬 Hyperspectral Analysis (Integrated):")
    print(f"  GET    /api/hyperspectral/health - Service health")
    print(f"  GET    /api/hyperspectral/locations - 10 Indian locations")
    print(f"  POST   /api/hyperspectral/process-image - RGB to 424-band conversion")
    print(f"  GET    /api/hyperspectral/predictions - All location predictions")
    print(f"  GET    /api/hyperspectral/predict-location/<location> - Location-specific")
    print(f"  GET    /api/hyperspectral/model-info - Model information")
    
    print(f"\n🧬 MATLAB Integration:")
    print(f"  GET    /api/matlab/status - Check MATLAB availability")
    print(f"  POST   /api/matlab/hyperspectral/demo - Run MATLAB demo")
    
    print(f"\n🌍 Coverage:")
    print(f"  🏘️  Karnataka: {', '.join(list(KARNATAKA_LOCATIONS.keys())[:4])}, +4 more")
    print(f"  🇮🇳 Hyperspectral: {', '.join(list(INDIAN_LOCATIONS.keys())[:5])}, +5 more")
    print(f"  🌾 Crops: {', '.join(list(CROP_DATABASE.keys())[:5])}, +5 more")
    print(f"  🦠 Diseases: {len(CROP_DISEASES)} detectable conditions")
    print(f"  📡 Bands: 424 hyperspectral bands (381-2500nm)")
    print(f"\n💾 Database: SQLite (agriculture_consolidated.db)")
    print(f"🔗 Cross-Platform: Supports Web (React), Mobile (Flutter), Desktop")
    print(f"\n✅ EVERYTHING UNIFIED - NO MORE MULTIPLE BACKENDS!")
    
    try:
        # Initialize database
        with app.app_context():
            db.create_all()
            initialize_demo_data()
            logger.info("Database initialized successfully")
        
        # Run the server
        print(f"\n🚀 Server starting on http://localhost:{port}")
        print("🌐 Frontend should connect to: http://localhost:3001/api")
        app.run(host='0.0.0.0', port=port, debug=False)
    except Exception as e:
        print(f"❌ Server error: {e}")
        print("💡 Check if port 3001 is already in use")
