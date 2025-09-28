#!/usr/bin/env python3
"""
Simplified Flask server for hyperspectral image analysis
Focus on the core functionality without complex dependencies
"""

import sys
import os
import logging
from pathlib import Path
from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime

# Add the current directory to Python path
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_simple_app():
    """Create a simplified Flask app with just hyperspectral functionality"""
    app = Flask(__name__)
    
    # Enable CORS for frontend communication
    CORS(app, origins=["http://localhost:3000", "http://localhost:3001"])
    
    # Import hyperspectral service
    try:
        from backend.services.matlab_hyperspectral_service import get_matlab_service
        matlab_service = get_matlab_service()
        logger.info("✅ MATLAB hyperspectral service initialized successfully")
    except Exception as e:
        logger.error(f"❌ Failed to initialize MATLAB service: {e}")
        matlab_service = None
    
    @app.route('/api/health', methods=['GET'])
    def general_health():
        """General health check"""
        return jsonify({
            'status': 'healthy',
            'service': 'agriculture-monitoring-platform',
            'timestamp': datetime.now().isoformat()
        })
    
    @app.route('/api/hyperspectral/health', methods=['GET'])
    def hyperspectral_health():
        """Hyperspectral service health check"""
        try:
            if not matlab_service:
                return jsonify({
                    'service': 'hyperspectral_processing',
                    'status': 'unhealthy',
                    'error': 'Service not initialized',
                    'timestamp': datetime.now().isoformat()
                }), 500
            
            service_status = {
                'service': 'hyperspectral_processing',
                'status': 'healthy',
                'matlab_engine_available': not matlab_service.simulation_mode,
                'simulation_mode': matlab_service.simulation_mode,
                'matlab_path': matlab_service.matlab_path,
                'supported_locations': list(matlab_service.get_supported_locations()['locations'].keys()),
                'timestamp': datetime.now().isoformat()
            }
            
            return jsonify(service_status), 200
            
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
            if not matlab_service:
                return jsonify({'status': 'error', 'message': 'Service not available'}), 500
                
            locations_data = matlab_service.get_supported_locations()
            return jsonify(locations_data), 200
            
        except Exception as e:
            logger.error(f"Error getting locations: {e}")
            return jsonify({
                'status': 'error',
                'message': str(e),
                'timestamp': datetime.now().isoformat()
            }), 500
    
    @app.route('/api/hyperspectral/predict-location/<location>', methods=['GET'])
    def predict_location(location):
        """Predict crop health for a specific location"""
        try:
            if not matlab_service:
                return jsonify({'status': 'error', 'message': 'Service not available'}), 500
            
            # For now, return simulation data to avoid MATLAB struct conversion issues
            locations_info = matlab_service.get_supported_locations()['locations']
            
            if location not in locations_info:
                return jsonify({
                    'status': 'error',
                    'message': f'Location "{location}" not supported',
                    'supported_locations': list(locations_info.keys())
                }), 400
            
            # Return simplified simulation data
            import random
            health_score = 0.5 + 0.4 * random.random()
            
            result = {
                'status': 'success',
                'location': location,
                'coordinates': locations_info[location]['coordinates'],
                'state': locations_info[location]['state'],
                'climate': locations_info[location]['climate'],
                'health_metrics': {
                    'overall_health_score': health_score,
                    'dominant_class': 'Good' if health_score > 0.7 else 'Fair' if health_score > 0.5 else 'Poor',
                    'average_ndvi': 0.3 + 0.5 * health_score,
                    'samples_analyzed': 100
                },
                'recommendations': [
                    f'Monitor crop conditions in {location}',
                    f'Consider {locations_info[location]["climate"].lower()} climate adaptations',
                    'Continue regular analysis for optimal results'
                ],
                'analysis_timestamp': datetime.now().isoformat(),
                'simulation_mode': True
            }
            
            return jsonify(result), 200
            
        except Exception as e:
            logger.error(f"Error predicting location health: {e}")
            return jsonify({
                'status': 'error',
                'message': str(e),
                'timestamp': datetime.now().isoformat()
            }), 500
    
    @app.route('/api/hyperspectral/process-image', methods=['POST'])
    def process_image():
        """Process RGB image (simplified for testing)"""
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
            
            # For testing, return simulation results without actually processing
            import random
            health_score = 0.4 + 0.5 * random.random()
            
            result = {
                'status': 'success',
                'results': {
                    'status': 'success',
                    'input_image': file.filename,
                    'conversion_method': 'Simulated CNN-based RGB to Hyperspectral',
                    'health_analysis': {
                        'overall_health_score': health_score,
                        'dominant_health_status': 'Good' if health_score > 0.7 else 'Fair',
                        'confidence': 0.8 + 0.15 * random.random(),
                        'pixels_analyzed': random.randint(800, 2000),
                        'excellent_percent': max(0, (health_score - 0.7) * 150),
                        'good_percent': 40 + 20 * random.random(),
                        'fair_percent': 30 + 15 * random.random(),
                        'poor_percent': max(0, 20 - health_score * 30)
                    },
                    'vegetation_indices': {
                        'ndvi': {
                            'mean': 0.2 + 0.6 * health_score,
                            'std': 0.05 + 0.1 * random.random(),
                            'min': 0.1,
                            'max': 0.9
                        },
                        'savi': {
                            'mean': 0.18 + 0.54 * health_score,
                            'std': 0.04 + 0.08 * random.random(),
                            'min': 0.08,
                            'max': 0.81
                        },
                        'evi': {
                            'mean': 0.15 + 0.48 * health_score,
                            'std': 0.03 + 0.06 * random.random(),
                            'min': 0.07,
                            'max': 0.72
                        },
                        'gndvi': {
                            'mean': 0.17 + 0.51 * health_score,
                            'std': 0.04 + 0.07 * random.random(),
                            'min': 0.09,
                            'max': 0.76
                        },
                        'vegetation_coverage': 60 + 30 * health_score
                    },
                    'hyperspectral_bands': 424,
                    'wavelength_range': [381.45, 2500.12],
                    'analysis_timestamp': datetime.now().isoformat(),
                    'recommendations': [
                        'Monitor crop development based on analysis results',
                        'Consider irrigation adjustments if needed',
                        'Continue regular hyperspectral monitoring'
                    ],
                    'original_filename': file.filename,
                    'file_size_mb': 0.5  # Simulated
                }
            }
            
            return jsonify(result), 200
            
        except Exception as e:
            logger.error(f"Error processing image: {e}")
            return jsonify({
                'status': 'error',
                'message': str(e),
                'timestamp': datetime.now().isoformat()
            }), 500
    
    return app

def main():
    """Start the simplified server"""
    print("🌱 Starting Simplified Hyperspectral Server...")
    print("🔬 Focus on core hyperspectral functionality")
    
    app = create_simple_app()
    
    # Print available routes
    print("\n📡 Available endpoints:")
    for rule in app.url_map.iter_rules():
        methods = ','.join(rule.methods - {'HEAD', 'OPTIONS'})
        print(f"  {methods:8} {rule.rule}")
    
    port = 3001
    print(f"\n🚀 Server starting on http://localhost:{port}")
    print(f"🧠 Health check: http://localhost:{port}/api/hyperspectral/health")
    print(f"📍 Locations: http://localhost:{port}/api/hyperspectral/locations")
    
    try:
        app.run(host='0.0.0.0', port=port, debug=True)
    except Exception as e:
        print(f"❌ Error starting server: {e}")

if __name__ == "__main__":
    main()
