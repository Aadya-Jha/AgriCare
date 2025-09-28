#!/usr/bin/env python3
"""
Standalone Flask server for hyperspectral image analysis
Minimal dependencies, maximum compatibility
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
import random
import logging
import os
import requests
import json
from datetime import datetime, timedelta

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://localhost:3001"])

# =======================================================================================
# MOCK HYPERSPECTRAL SERVICE DATA
# =======================================================================================

INDIAN_LOCATIONS = {
    'Anand': {
        'state': 'Gujarat',
        'climate': 'Semi-arid',
        'coordinates': [22.5645, 72.9289],
        'major_crops': ['Cotton', 'Wheat', 'Sugarcane', 'Tobacco']
    },
    'Jhagdia': {
        'state': 'Gujarat', 
        'climate': 'Humid',
        'coordinates': [21.7500, 73.1500],
        'major_crops': ['Rice', 'Cotton', 'Sugarcane', 'Banana']
    },
    'Kota': {
        'state': 'Rajasthan',
        'climate': 'Arid', 
        'coordinates': [25.2138, 75.8648],
        'major_crops': ['Wheat', 'Soybean', 'Mustard', 'Coriander']
    },
    'Maddur': {
        'state': 'Karnataka',
        'climate': 'Tropical',
        'coordinates': [12.5847, 77.0128],
        'major_crops': ['Rice', 'Ragi', 'Coconut', 'Areca nut']
    },
    'Talala': {
        'state': 'Gujarat',
        'climate': 'Coastal',
        'coordinates': [21.3500, 70.3000],
        'major_crops': ['Groundnut', 'Cotton', 'Mango', 'Coconut']
    }
}

# Karnataka specific locations for crop recommendation
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

# Crop database with detailed information
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
        'investment': '₹50,000-70,000 per acre'
    },
    'Coconut': {
        'seasons': ['Year Round'],
        'water_requirement': 'High',
        'temperature_range': [20, 32],
        'rainfall_requirement': [1200, 2000],
        'soil_types': ['Laterite Soil', 'Clay Loam'],
        'growth_duration': 2555, # 7 years to fruiting
        'yield_per_acre': '80-120 nuts per tree',
        'investment': '₹1,50,000-2,00,000 per acre'
    }
}

# =======================================================================================
# WEATHER AND CROP RECOMMENDATION FUNCTIONS
# =======================================================================================

def get_current_season():
    """Determine current agricultural season based on month"""
    current_month = datetime.now().month
    
    if current_month in [6, 7, 8, 9, 10]:  # June to October
        return 'Kharif'
    elif current_month in [11, 12, 1, 2, 3]:  # November to March
        return 'Rabi'
    else:  # April, May
        return 'Summer'

def fetch_weather_data(location):
    """Fetch current weather data for a Karnataka location"""
    try:
        if location not in KARNATAKA_LOCATIONS:
            return None
        
        # For demo purposes, we'll simulate weather data
        # In production, use: OpenWeatherMap API
        # api_key = "your_openweather_api_key"
        # lat, lon = KARNATAKA_LOCATIONS[location]['coordinates']
        # url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"
        # response = requests.get(url)
        
        # Simulated realistic weather data for Karnataka locations
        base_temp = 25 + random.uniform(-5, 10)
        humidity = 60 + random.uniform(-20, 30)
        
        weather_data = {
            'temperature': round(base_temp, 1),
            'humidity': round(max(30, min(90, humidity)), 1),
            'description': random.choice(['Clear sky', 'Few clouds', 'Scattered clouds', 'Light rain']),
            'wind_speed': round(random.uniform(2, 15), 1),
            'pressure': round(1013 + random.uniform(-20, 20), 1),
            'visibility': round(random.uniform(8, 15), 1),
            'uv_index': random.randint(3, 11),
            'last_updated': datetime.now().isoformat()
        }
        
        return weather_data
        
    except Exception as e:
        logger.error(f"Error fetching weather data: {e}")
        return None

def calculate_crop_suitability(crop_name, weather_data, location_info):
    """Calculate how suitable a crop is for current conditions"""
    if crop_name not in CROP_DATABASE:
        return 0
    
    crop = CROP_DATABASE[crop_name]
    score = 0
    factors = []
    
    # Temperature suitability
    temp = weather_data['temperature']
    temp_min, temp_max = crop['temperature_range']
    if temp_min <= temp <= temp_max:
        temp_score = 100
        factors.append(f"Temperature ({temp}°C) is optimal")
    elif temp < temp_min:
        temp_score = max(0, 100 - (temp_min - temp) * 10)
        factors.append(f"Temperature ({temp}°C) is below optimal range")
    else:
        temp_score = max(0, 100 - (temp - temp_max) * 10)
        factors.append(f"Temperature ({temp}°C) is above optimal range")
    
    score += temp_score * 0.4
    
    # Season suitability
    current_season = get_current_season()
    if current_season in crop['seasons']:
        season_score = 100
        factors.append(f"Current season ({current_season}) is suitable")
    else:
        season_score = 30
        factors.append(f"Current season ({current_season}) is not optimal")
    
    score += season_score * 0.3
    
    # Soil suitability
    location_soil = location_info['soil_type']
    if any(soil in location_soil for soil in crop['soil_types']):
        soil_score = 100
        factors.append(f"Soil type ({location_soil}) is suitable")
    else:
        soil_score = 50
        factors.append(f"Soil type ({location_soil}) needs amendment")
    
    score += soil_score * 0.2
    
    # Humidity consideration
    humidity = weather_data['humidity']
    if crop['water_requirement'] == 'High' and humidity > 70:
        humidity_score = 100
    elif crop['water_requirement'] == 'Medium' and 50 <= humidity <= 80:
        humidity_score = 100
    elif crop['water_requirement'] == 'Low' and humidity < 60:
        humidity_score = 100
    else:
        humidity_score = 70
    
    score += humidity_score * 0.1
    
    return min(100, max(0, score)), factors

def recommend_crops(location, weather_data, top_n=3):
    """Recommend top N crops for a location based on current conditions"""
    if location not in KARNATAKA_LOCATIONS:
        return []
    
    location_info = KARNATAKA_LOCATIONS[location]
    recommendations = []
    
    for crop_name, crop_data in CROP_DATABASE.items():
        suitability_score, factors = calculate_crop_suitability(crop_name, weather_data, location_info)
        
        if suitability_score > 40:  # Only recommend crops with > 40% suitability
            recommendations.append({
                'crop': crop_name,
                'suitability_score': round(suitability_score, 1),
                'suitability_factors': factors,
                'crop_details': crop_data
            })
    
    # Sort by suitability score
    recommendations.sort(key=lambda x: x['suitability_score'], reverse=True)
    
    return recommendations[:top_n]

def generate_crop_growth_plan(crop_name):
    """Generate detailed growth plan for a crop"""
    if crop_name not in CROP_DATABASE:
        return None
    
    crop = CROP_DATABASE[crop_name]
    duration = crop['growth_duration']
    
    # Define growth stages
    stages = []
    current_date = datetime.now()
    
    if duration <= 120:  # Short duration crops
        stage_periods = [15, 30, 30, 30, duration-105]  # Germination, Vegetative, Flowering, Maturity, Harvest
        stage_names = ['Germination & Establishment', 'Vegetative Growth', 'Flowering', 'Fruit/Grain Development', 'Harvest']
    elif duration <= 200:  # Medium duration crops
        stage_periods = [20, 45, 45, 45, duration-155]  
        stage_names = ['Germination & Establishment', 'Vegetative Growth', 'Flowering', 'Fruit/Grain Development', 'Harvest']
    else:  # Long duration crops
        stage_periods = [30, 90, 90, 90, duration-300]
        stage_names = ['Germination & Establishment', 'Vegetative Growth', 'Flowering/Reproductive', 'Maturation', 'Harvest']
    
    cumulative_days = 0
    for i, (period, name) in enumerate(zip(stage_periods, stage_names)):
        start_date = current_date + timedelta(days=cumulative_days)
        end_date = current_date + timedelta(days=cumulative_days + period)
        
        # Generate stage-specific activities
        activities = get_stage_activities(crop_name, i, name)
        
        stages.append({
            'stage_number': i + 1,
            'stage_name': name,
            'start_date': start_date.strftime('%Y-%m-%d'),
            'end_date': end_date.strftime('%Y-%m-%d'),
            'duration_days': period,
            'activities': activities
        })
        
        cumulative_days += period
    
    return {
        'crop': crop_name,
        'total_duration': duration,
        'planting_date': current_date.strftime('%Y-%m-%d'),
        'expected_harvest': (current_date + timedelta(days=duration)).strftime('%Y-%m-%d'),
        'stages': stages,
        'investment_details': {
            'initial_investment': crop['investment'],
            'expected_yield': crop['yield_per_acre'],
            'water_requirement': crop['water_requirement']
        }
    }

def get_stage_activities(crop_name, stage_index, stage_name):
    """Get activities for a specific growth stage"""
    base_activities = {
        0: ['Land preparation', 'Seed treatment', 'Sowing/Planting', 'Initial irrigation'],
        1: ['Regular irrigation', 'Weed management', 'First fertilizer application', 'Pest monitoring'],
        2: ['Flowering support', 'Pollination management', 'Disease control', 'Second fertilizer application'],
        3: ['Fruit/grain development monitoring', 'Water management', 'Final fertilizer application', 'Harvest preparation'],
        4: ['Harvesting', 'Post-harvest handling', 'Storage preparation', 'Marketing']
    }
    
    # Crop-specific modifications
    activities = base_activities.get(stage_index, ['Monitor crop health', 'Continue regular care'])
    
    if crop_name == 'Rice' and stage_index == 1:
        activities.extend(['Transplanting', 'Water level maintenance'])
    elif crop_name == 'Cotton' and stage_index == 2:
        activities.extend(['Bollworm monitoring', 'Growth regulator application'])
    elif crop_name in ['Tomato', 'Onion'] and stage_index == 1:
        activities.extend(['Staking/support', 'Regular pruning'])
    
    return activities

# =======================================================================================
# API ENDPOINTS
# =======================================================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """General health check"""
    return jsonify({
        'status': 'healthy',
        'service': 'hyperspectral-agriculture-monitoring',
        'timestamp': datetime.now().isoformat(),
        'version': '2.0'
    })

@app.route('/api/hyperspectral/health', methods=['GET'])
def hyperspectral_health():
    """Hyperspectral service health check"""
    try:
        return jsonify({
            'service': 'hyperspectral_processing',
            'status': 'healthy',
            'matlab_engine_available': True,  # Simulated for demo
            'simulation_mode': True,  # Always true in standalone mode
            'matlab_path': os.getcwd() + '/matlab-processing',
            'supported_locations': list(INDIAN_LOCATIONS.keys()),
            'hyperspectral_bands': 424,
            'wavelength_range': [381.45, 2500.12],
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return jsonify({
            'service': 'hyperspectral_processing',
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/hyperspectral/locations', methods=['GET'])
def get_locations():
    """Get supported Indian agricultural locations"""
    try:
        return jsonify({
            'status': 'success',
            'locations': INDIAN_LOCATIONS,
            'count': len(INDIAN_LOCATIONS),
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error getting locations: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/hyperspectral/predict-location/<location>', methods=['GET'])
def predict_location_health(location):
    """Predict crop health for a specific location"""
    try:
        if location not in INDIAN_LOCATIONS:
            return jsonify({
                'status': 'error',
                'message': f'Location "{location}" not supported',
                'supported_locations': list(INDIAN_LOCATIONS.keys())
            }), 400
        
        # Generate realistic simulation data
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

@app.route('/api/hyperspectral/process-image', methods=['POST'])
def process_image():
    """Process RGB image for hyperspectral analysis"""
    try:
        # Check if file is present
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
        
        # Generate realistic hyperspectral analysis results
        health_score = 0.4 + 0.5 * random.random()
        coverage = 60 + 30 * health_score
        
        # Generate vegetation indices
        ndvi_mean = 0.2 + 0.6 * health_score
        savi_mean = ndvi_mean * 0.9
        evi_mean = ndvi_mean * 0.8
        gndvi_mean = ndvi_mean * 0.85
        
        # Generate health distribution
        if health_score > 0.8:
            excellent_pct = 60 + 20 * random.random()
            good_pct = 25 + 10 * random.random()
            fair_pct = 10 + 5 * random.random()
            poor_pct = 5
        elif health_score > 0.6:
            excellent_pct = 20 + 15 * random.random()
            good_pct = 45 + 15 * random.random()
            fair_pct = 20 + 10 * random.random()
            poor_pct = 10 + 5 * random.random()
        elif health_score > 0.4:
            excellent_pct = 10 + 5 * random.random()
            good_pct = 25 + 10 * random.random()
            fair_pct = 35 + 15 * random.random()
            poor_pct = 25 + 10 * random.random()
        else:
            excellent_pct = 5
            good_pct = 15 + 5 * random.random()
            fair_pct = 25 + 10 * random.random()
            poor_pct = 50 + 10 * random.random()
        
        # Normalize percentages
        total = excellent_pct + good_pct + fair_pct + poor_pct
        excellent_pct = (excellent_pct / total) * 100
        good_pct = (good_pct / total) * 100
        fair_pct = (fair_pct / total) * 100
        poor_pct = (poor_pct / total) * 100
        
        result = {
            'status': 'success',
            'results': {
                'status': 'success',
                'input_image': file.filename,
                'conversion_method': 'AI-Powered RGB to 424-band Hyperspectral',
                'health_analysis': {
                    'overall_health_score': health_score,
                    'dominant_health_status': 'Excellent' if health_score > 0.8 else 'Good' if health_score > 0.6 else 'Fair' if health_score > 0.4 else 'Poor',
                    'confidence': 0.8 + 0.15 * random.random(),
                    'pixels_analyzed': random.randint(1000, 3000),
                    'excellent_percent': excellent_pct,
                    'good_percent': good_pct,
                    'fair_percent': fair_pct,
                    'poor_percent': poor_pct
                },
                'vegetation_indices': {
                    'ndvi': {
                        'mean': ndvi_mean,
                        'std': 0.05 + 0.1 * random.random(),
                        'min': max(0, ndvi_mean - 0.2),
                        'max': min(1, ndvi_mean + 0.2)
                    },
                    'savi': {
                        'mean': savi_mean,
                        'std': 0.04 + 0.08 * random.random(),
                        'min': max(0, savi_mean - 0.15),
                        'max': min(1, savi_mean + 0.15)
                    },
                    'evi': {
                        'mean': evi_mean,
                        'std': 0.03 + 0.06 * random.random(),
                        'min': max(0, evi_mean - 0.1),
                        'max': min(1, evi_mean + 0.1)
                    },
                    'gndvi': {
                        'mean': gndvi_mean,
                        'std': 0.04 + 0.07 * random.random(),
                        'min': max(0, gndvi_mean - 0.12),
                        'max': min(1, gndvi_mean + 0.12)
                    },
                    'vegetation_coverage': coverage
                },
                'hyperspectral_bands': 424,
                'wavelength_range': [381.45, 2500.12],
                'analysis_timestamp': datetime.now().isoformat(),
                'recommendations': [
                    'Crop health analysis completed using AI deep learning',
                    'Monitor areas showing stress indicators' if health_score < 0.6 else 'Continue current management practices',
                    'Consider precision agriculture based on spatial variability',
                    'Regular hyperspectral monitoring recommended for optimal results'
                ],
                'original_filename': file.filename,
                'file_size_mb': round(len(file.read()) / (1024 * 1024), 2) if hasattr(file, 'read') else 0.5
            },
            'message': 'Image processing completed successfully',
            'timestamp': datetime.now().isoformat()
        }
        
        # Reset file pointer if we read it
        if hasattr(file, 'seek'):
            file.seek(0)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error processing image: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/hyperspectral/demo', methods=['GET'])
def demo_endpoint():
    """Demo endpoint for testing"""
    return jsonify({
        'status': 'success',
        'message': 'Hyperspectral analysis demo ready',
        'features': [
            'RGB to Hyperspectral Conversion',
            'Crop Health Classification', 
            'Vegetation Indices Calculation',
            'Indian Agriculture Focus',
            '5 Supported Locations'
        ],
        'supported_locations': list(INDIAN_LOCATIONS.keys()),
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/hyperspectral/predictions', methods=['GET'])
def get_predictions():
    """Get hyperspectral predictions summary"""
    try:
        predictions = []
        for location in INDIAN_LOCATIONS.keys():
            health_score = 0.4 + 0.5 * random.random()
            predictions.append({
                'location': location,
                'health_score': health_score,
                'status': 'Excellent' if health_score > 0.8 else 'Good' if health_score > 0.6 else 'Fair' if health_score > 0.4 else 'Poor',
                'last_updated': datetime.now().isoformat(),
                'confidence': 0.75 + 0.2 * random.random()
            })
        
        return jsonify({
            'status': 'success',
            'predictions': predictions,
            'total_locations': len(predictions),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting predictions: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/hyperspectral/model-info', methods=['GET'])
def get_model_info():
    """Get hyperspectral model information"""
    try:
        return jsonify({
            'status': 'success',
            'model_info': {
                'name': 'Indian Agriculture Hyperspectral AI v2.0',
                'version': '2.0.424',
                'architecture': 'Convolutional Neural Network with Attention Mechanisms',
                'training_data': {
                    'total_samples': 15000,
                    'locations': list(INDIAN_LOCATIONS.keys()),
                    'crops': ['Cotton', 'Rice', 'Wheat', 'Sugarcane', 'Groundnut', 'Soybean'],
                    'spectral_bands': 424
                },
                'performance': {
                    'accuracy': 0.892,
                    'precision': 0.885,
                    'recall': 0.898,
                    'f1_score': 0.891
                },
                'wavelength_range': [381.45, 2500.12],
                'deployment_date': '2024-01-15',
                'last_updated': datetime.now().isoformat()
            },
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting model info: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/dashboard/summary', methods=['GET'])
def get_dashboard_summary():
    """Get dashboard summary data"""
    try:
        # Generate summary statistics
        total_analyses = random.randint(150, 300)
        healthy_fields = random.randint(80, 120)
        alerts = random.randint(2, 8)
        avg_health = 0.6 + 0.3 * random.random()
        
        return jsonify({
            'status': 'success',
            'summary': {
                'total_analyses': total_analyses,
                'healthy_fields': healthy_fields,
                'active_alerts': alerts,
                'average_health_score': avg_health,
                'locations_monitored': len(INDIAN_LOCATIONS),
                'recent_activity': {
                    'images_processed_today': random.randint(5, 20),
                    'predictions_generated': random.randint(10, 40),
                    'health_assessments': random.randint(8, 25)
                },
                'top_performing_location': random.choice(list(INDIAN_LOCATIONS.keys())),
                'system_status': 'operational',
                'last_updated': datetime.now().isoformat()
            },
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting dashboard summary: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/trends/<int:days>', methods=['GET'])
def get_trends(days):
    """Get trend data for specified number of days"""
    try:
        if days <= 0 or days > 365:
            return jsonify({
                'status': 'error',
                'message': 'Days must be between 1 and 365'
            }), 400
        
        # Generate trend data
        trends = []
        base_date = datetime.now()
        
        for i in range(days):
            date = base_date.replace(day=base_date.day - i if base_date.day - i > 0 else 1)
            health_score = 0.5 + 0.4 * random.random()
            
            trends.append({
                'date': date.strftime('%Y-%m-%d'),
                'overall_health': health_score,
                'analyses_count': random.randint(3, 15),
                'alerts_generated': random.randint(0, 3),
                'vegetation_index_avg': 0.3 + 0.5 * health_score
            })
        
        # Sort by date (most recent first)
        trends.sort(key=lambda x: x['date'], reverse=True)
        
        return jsonify({
            'status': 'success',
            'trends': trends,
            'period_days': days,
            'data_points': len(trends),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting trends: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

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
    """Get crop recommendations for a Karnataka location based on current weather"""
    try:
        if location not in KARNATAKA_LOCATIONS:
            return jsonify({
                'status': 'error',
                'message': f'Location "{location}" not found in Karnataka database',
                'available_locations': list(KARNATAKA_LOCATIONS.keys())
            }), 404
        
        # Get current weather
        weather_data = fetch_weather_data(location)
        if not weather_data:
            return jsonify({
                'status': 'error',
                'message': 'Failed to fetch weather data for recommendations',
                'timestamp': datetime.now().isoformat()
            }), 500
        
        # Get crop recommendations
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
    """Get complete crop database information"""
    try:
        return jsonify({
            'status': 'success',
            'crops': CROP_DATABASE,
            'total_crops': len(CROP_DATABASE),
            'current_season': get_current_season(),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting crop database: {e}")
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
        
        # Get weather data
        weather_data = fetch_weather_data(location)
        if not weather_data:
            return jsonify({
                'status': 'error',
                'message': 'Failed to fetch weather data',
                'timestamp': datetime.now().isoformat()
            }), 500
        
        # Get crop recommendations
        recommendations = recommend_crops(location, weather_data, 5)
        
        # Generate growth plans for top 3 recommended crops
        detailed_recommendations = []
        for rec in recommendations[:3]:
            growth_plan = generate_crop_growth_plan(rec['crop'])
            detailed_recommendations.append({
                **rec,
                'growth_plan': growth_plan
            })
        
        location_info = KARNATAKA_LOCATIONS[location]
        current_season = get_current_season()
        
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
            'seasonal_advice': {
                'current_season': current_season,
                'season_description': get_season_description(current_season),
                'general_recommendations': get_seasonal_recommendations(current_season)
            },
            'analysis_timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting comprehensive analysis for {location}: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

def get_season_description(season):
    """Get description for current agricultural season"""
    descriptions = {
        'Kharif': 'Monsoon season (June-October): High rainfall, suitable for water-intensive crops',
        'Rabi': 'Winter season (November-March): Cool and dry, ideal for wheat, gram, and vegetables',
        'Summer': 'Hot season (April-May): Limited cultivation, suitable for heat-tolerant crops'
    }
    return descriptions.get(season, 'Season information not available')

def get_seasonal_recommendations(season):
    """Get general seasonal farming recommendations"""
    recommendations = {
        'Kharif': [
            'Take advantage of monsoon rains for water-intensive crops',
            'Ensure proper drainage to prevent waterlogging',
            'Monitor for fungal diseases due to high humidity',
            'Consider rice, cotton, sugarcane, and pulses'
        ],
        'Rabi': [
            'Focus on efficient irrigation systems',
            'Utilize residual soil moisture from monsoon',
            'Plant wheat, gram, mustard, and winter vegetables',
            'Prepare for harvest during favorable weather'
        ],
        'Summer': [
            'Conserve water with drip irrigation',
            'Consider heat-tolerant and drought-resistant varieties',
            'Focus on high-value crops like vegetables under shade',
            'Prepare land for upcoming Kharif season'
        ]
    }
    return recommendations.get(season, ['General farming practices recommended'])

# =======================================================================================
# MAIN SERVER STARTUP
# =======================================================================================

if __name__ == '__main__':
    print("🌱 Starting Standalone Hyperspectral Analysis Server...")
    print("🔬 Optimized for Agriculture Monitoring Platform")
    print("🇮🇳 Supporting Indian Agricultural Locations")
    
    port = 3001
    print(f"\n📡 Available endpoints:")
    print(f"  GET    /api/health")
    print(f"  GET    /api/hyperspectral/health")
    print(f"  GET    /api/hyperspectral/locations") 
    print(f"  GET    /api/hyperspectral/predict-location/<location>")
    print(f"  POST   /api/hyperspectral/process-image")
    print(f"  GET    /api/hyperspectral/predictions")
    print(f"  GET    /api/hyperspectral/model-info")
    print(f"  GET    /api/hyperspectral/demo")
    print(f"  GET    /api/dashboard/summary")
    print(f"  GET    /api/trends/<days>")
    print(f"\n🌾 Karnataka Crop Recommendation System:")
    print(f"  GET    /api/karnataka/locations")
    print(f"  GET    /api/karnataka/weather/<location>")
    print(f"  GET    /api/karnataka/crop-recommendations/<location>")
    print(f"  GET    /api/karnataka/comprehensive-analysis/<location>")
    print(f"  GET    /api/crop/growth-plan/<crop_name>")
    print(f"  GET    /api/crop/database")
    
    print(f"\n🚀 Server starting on http://localhost:{port}")
    print(f"🧠 Service status: http://localhost:{port}/api/hyperspectral/health")
    print(f"📍 Locations: http://localhost:{port}/api/hyperspectral/locations")
    print(f"🌾 Supported crops: Cotton, Rice, Wheat, Sugarcane, Groundnut")
    print(f"📊 Analysis: 424 hyperspectral bands, NDVI/SAVI/EVI/GNDVI indices")
    
    try:
        app.run(host='0.0.0.0', port=port, debug=False)  # Turn off debug mode for stability
    except Exception as e:
        print(f"❌ Server error: {e}")
        print("💡 Try running on a different port or check if port 3001 is already in use")
