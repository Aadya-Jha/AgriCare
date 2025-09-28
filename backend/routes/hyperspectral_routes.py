"""
Enhanced Hyperspectral Processing API Routes
Provides endpoints for RGB to hyperspectral conversion and crop health analysis
using the integrated MATLAB deep learning model.
"""

import os
import json
import logging
from datetime import datetime
from werkzeug.utils import secure_filename
from flask import Blueprint, request, jsonify, current_app, send_file
from werkzeug.exceptions import RequestEntityTooLarge

from backend.services.matlab_hyperspectral_service import get_matlab_service
from backend.utils.auth import token_required
from backend.utils.file_handlers import allowed_file, save_upload_file

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create blueprint
hyperspectral_bp = Blueprint('hyperspectral', __name__, url_prefix='/api/hyperspectral')

# Get MATLAB service instance
matlab_service = get_matlab_service()

@hyperspectral_bp.route('/health', methods=['GET'])
def health_check():
    """Check the health status of the hyperspectral processing service."""
    try:
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

@hyperspectral_bp.route('/locations', methods=['GET'])
def get_supported_locations():
    """Get list of supported Indian agricultural locations."""
    try:
        locations_data = matlab_service.get_supported_locations()
        return jsonify(locations_data), 200
        
    except Exception as e:
        logger.error(f"Error getting locations: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@hyperspectral_bp.route('/train', methods=['POST'])
@token_required
def train_model():
    """Train the hyperspectral deep learning model."""
    try:
        logger.info("Starting model training request")
        
        # Check if training is already in progress
        # (In production, you might want to implement a queue system)
        
        training_results = matlab_service.train_model()
        
        if training_results.get('status') == 'success':
            return jsonify({
                'status': 'success',
                'message': 'Model training completed successfully',
                'results': training_results,
                'timestamp': datetime.now().isoformat()
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'message': training_results.get('message', 'Training failed'),
                'timestamp': datetime.now().isoformat()
            }), 500
            
    except Exception as e:
        logger.error(f"Error during model training: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@hyperspectral_bp.route('/process-image', methods=['POST'])
@token_required
def process_image():
    """
    Process RGB image and convert to hyperspectral analysis.
    Expects multipart/form-data with 'image' file.
    """
    try:
        # Check if file is present in request
        if 'image' not in request.files:
            return jsonify({
                'status': 'error',
                'message': 'No image file provided',
                'timestamp': datetime.now().isoformat()
            }), 400
        
        file = request.files['image']
        
        # Check if file was selected
        if file.filename == '':
            return jsonify({
                'status': 'error',
                'message': 'No image file selected',
                'timestamp': datetime.now().isoformat()
            }), 400
        
        # Check file type
        if not allowed_file(file.filename):
            return jsonify({
                'status': 'error',
                'message': 'Invalid file type. Supported: jpg, jpeg, png, tiff',
                'timestamp': datetime.now().isoformat()
            }), 400
        
        # Save uploaded file
        try:
            saved_file_path = save_upload_file(file, 'hyperspectral_images')
            logger.info(f"Image saved to: {saved_file_path}")
            
        except Exception as e:
            logger.error(f"Error saving file: {e}")
            return jsonify({
                'status': 'error',
                'message': f'Failed to save uploaded file: {str(e)}',
                'timestamp': datetime.now().isoformat()
            }), 500
        
        # Process the image using MATLAB service
        processing_results = matlab_service.process_rgb_image(saved_file_path)
        
        # Add metadata
        processing_results['original_filename'] = file.filename
        processing_results['file_size_mb'] = round(len(file.read()) / (1024 * 1024), 2)
        file.seek(0)  # Reset file pointer
        
        if processing_results.get('status') == 'success':
            return jsonify({
                'status': 'success',
                'message': 'Image processing completed successfully',
                'results': processing_results,
                'timestamp': datetime.now().isoformat()
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'message': processing_results.get('message', 'Image processing failed'),
                'timestamp': datetime.now().isoformat()
            }), 500
            
    except RequestEntityTooLarge:
        return jsonify({
            'status': 'error',
            'message': 'File too large. Maximum size allowed is 16MB',
            'timestamp': datetime.now().isoformat()
        }), 413
        
    except Exception as e:
        logger.error(f"Error processing image: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@hyperspectral_bp.route('/predict-location/<location>', methods=['GET'])
@token_required
def predict_location_health(location):
    """Predict crop health for a specific Indian agricultural location."""
    try:
        # Validate location
        supported_locations = matlab_service.get_supported_locations()['locations']
        
        if location not in supported_locations:
            return jsonify({
                'status': 'error',
                'message': f'Location "{location}" not supported',
                'supported_locations': list(supported_locations.keys()),
                'timestamp': datetime.now().isoformat()
            }), 400
        
        # Get prediction
        prediction_results = matlab_service.predict_location_health(location)
        
        if prediction_results.get('status') == 'success':
            return jsonify({
                'status': 'success',
                'message': f'Health prediction completed for {location}',
                'results': prediction_results,
                'timestamp': datetime.now().isoformat()
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'message': prediction_results.get('message', 'Prediction failed'),
                'timestamp': datetime.now().isoformat()
            }), 500
            
    except Exception as e:
        logger.error(f"Error predicting location health: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@hyperspectral_bp.route('/predict-all-locations', methods=['GET'])
@token_required
def predict_all_locations():
    """Get crop health predictions for all supported Indian locations."""
    try:
        supported_locations = matlab_service.get_supported_locations()['locations']
        all_predictions = {}
        failed_predictions = []
        
        for location in supported_locations.keys():
            try:
                prediction_result = matlab_service.predict_location_health(location)
                if prediction_result.get('status') == 'success':
                    all_predictions[location] = prediction_result
                else:
                    failed_predictions.append({
                        'location': location,
                        'error': prediction_result.get('message', 'Unknown error')
                    })
                    
            except Exception as e:
                logger.error(f"Error predicting for {location}: {e}")
                failed_predictions.append({
                    'location': location,
                    'error': str(e)
                })
        
        response_data = {
            'status': 'success',
            'message': f'Predictions completed for {len(all_predictions)} locations',
            'predictions': all_predictions,
            'summary': {
                'successful_predictions': len(all_predictions),
                'failed_predictions': len(failed_predictions),
                'total_locations': len(supported_locations)
            },
            'timestamp': datetime.now().isoformat()
        }
        
        if failed_predictions:
            response_data['failed_predictions'] = failed_predictions
            response_data['status'] = 'partial_success'
        
        return jsonify(response_data), 200
        
    except Exception as e:
        logger.error(f"Error predicting all locations: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@hyperspectral_bp.route('/batch-process', methods=['POST'])
@token_required
def batch_process_images():
    """
    Process multiple images in batch.
    Expects multipart/form-data with multiple 'images' files.
    """
    try:
        # Check if files are present in request
        if 'images' not in request.files:
            return jsonify({
                'status': 'error',
                'message': 'No image files provided',
                'timestamp': datetime.now().isoformat()
            }), 400
        
        files = request.files.getlist('images')
        
        if not files or len(files) == 0:
            return jsonify({
                'status': 'error',
                'message': 'No image files selected',
                'timestamp': datetime.now().isoformat()
            }), 400
        
        # Validate and save all files first
        saved_file_paths = []
        file_info = []
        
        for file in files:
            if file.filename == '':
                continue
                
            if not allowed_file(file.filename):
                return jsonify({
                    'status': 'error',
                    'message': f'Invalid file type for {file.filename}. Supported: jpg, jpeg, png, tiff',
                    'timestamp': datetime.now().isoformat()
                }), 400
            
            try:
                saved_path = save_upload_file(file, 'hyperspectral_batch')
                saved_file_paths.append(saved_path)
                file_info.append({
                    'original_filename': file.filename,
                    'saved_path': saved_path,
                    'file_size_mb': round(len(file.read()) / (1024 * 1024), 2)
                })
                file.seek(0)
                
            except Exception as e:
                logger.error(f"Error saving file {file.filename}: {e}")
                return jsonify({
                    'status': 'error',
                    'message': f'Failed to save file {file.filename}: {str(e)}',
                    'timestamp': datetime.now().isoformat()
                }), 500
        
        if not saved_file_paths:\
            return jsonify({
                'status': 'error',
                'message': 'No valid images to process',
                'timestamp': datetime.now().isoformat()
            }), 400
        
        # Process batch using MATLAB service
        batch_results = matlab_service.process_batch_images(saved_file_paths)
        
        # Add file metadata to results
        for i, result in enumerate(batch_results['results']):
            if i < len(file_info):
                result.update(file_info[i])
        
        return jsonify({
            'status': batch_results.get('status', 'success'),
            'message': f'Batch processing completed for {len(saved_file_paths)} images',
            'results': batch_results,
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except RequestEntityTooLarge:
        return jsonify({
            'status': 'error',
            'message': 'Files too large. Maximum total size allowed is 64MB',
            'timestamp': datetime.now().isoformat()
        }), 413
        
    except Exception as e:
        logger.error(f"Error in batch processing: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@hyperspectral_bp.route('/analysis-summary', methods=['GET'])
@token_required
def get_analysis_summary():
    """Get summary of hyperspectral analysis capabilities and current status."""
    try:
        # Get supported locations info
        locations_info = matlab_service.get_supported_locations()
        
        summary = {
            'service_info': {
                'name': 'Hyperspectral Crop Health Analysis',
                'version': '1.0.0',
                'description': 'RGB to Hyperspectral conversion using deep learning for precision agriculture',
                'matlab_engine_available': not matlab_service.simulation_mode,
                'simulation_mode': matlab_service.simulation_mode
            },
            'capabilities': {
                'rgb_to_hyperspectral_conversion': True,
                'vegetation_indices': ['NDVI', 'SAVI', 'EVI', 'GNDVI'],
                'health_classification': ['Excellent', 'Good', 'Fair', 'Poor'],
                'spectral_bands': 424,
                'wavelength_range': '381.45 - 2500.12 nm',
                'supported_file_formats': ['jpg', 'jpeg', 'png', 'tiff'],
                'batch_processing': True,
                'location_specific_analysis': True
            },
            'supported_regions': {
                'country': 'India',
                'locations': locations_info['locations'],
                'climates': list(set([loc['climate'] for loc in locations_info['locations'].values()])),
                'states': list(set([loc['state'] for loc in locations_info['locations'].values()]))
            },
            'model_info': {
                'architecture': 'Advanced CNN with 5 conv blocks + 3 FC layers',
                'training_data': 'Indian agricultural hyperspectral dataset',
                'model_trained': os.path.exists(os.path.join(matlab_service.matlab_path, 'trained_models', 'indian_hyperspectral_cnn_latest.mat'))
            },
            'api_endpoints': {
                'health_check': '/api/hyperspectral/health',
                'locations': '/api/hyperspectral/locations',
                'train_model': '/api/hyperspectral/train',
                'process_image': '/api/hyperspectral/process-image',
                'predict_location': '/api/hyperspectral/predict-location/<location>',
                'predict_all': '/api/hyperspectral/predict-all-locations',
                'batch_process': '/api/hyperspectral/batch-process',
                'summary': '/api/hyperspectral/analysis-summary'
            },
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify(summary), 200
        
    except Exception as e:
        logger.error(f"Error generating analysis summary: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@hyperspectral_bp.route('/demo', methods=['GET'])
def run_demo():
    """
    Run a demonstration of the hyperspectral processing capabilities.
    This endpoint doesn't require authentication for demonstration purposes.
    """
    try:
        logger.info("Starting hyperspectral processing demo")
        
        # Create a simple demo image if needed
        demo_results = {
            'status': 'success',
            'demo_type': 'hyperspectral_processing',
            'description': 'Demonstration of RGB to Hyperspectral conversion for crop health analysis',
            'features_demonstrated': [
                'RGB image analysis',
                'Hyperspectral band simulation',
                'Vegetation indices calculation',
                'Crop health classification',
                'Location-specific predictions',
                'Agricultural recommendations'
            ]
        }
        
        # Get a sample location prediction
        sample_location = 'Anand'
        location_demo = matlab_service.predict_location_health(sample_location)
        demo_results['sample_location_analysis'] = location_demo
        
        # Demonstrate capabilities for all supported locations
        supported_locations = matlab_service.get_supported_locations()
        demo_results['supported_locations'] = supported_locations
        
        # Add technology highlights
        demo_results['technology_highlights'] = {
            'deep_learning_model': 'Advanced CNN for spectral analysis',
            'spectral_bands': 424,
            'vegetation_indices': ['NDVI', 'SAVI', 'EVI', 'GNDVI'],
            'health_classes': ['Excellent', 'Good', 'Fair', 'Poor'],
            'precision_agriculture_focus': True,
            'indian_agriculture_optimized': True
        }
        
        demo_results['applications'] = [
            'Precision agriculture and crop monitoring',
            'Early stress and disease detection', 
            'Yield prediction and optimization',
            'Resource management (water, fertilizer)',
            'Climate-specific agricultural recommendations'
        ]
        
        demo_results['timestamp'] = datetime.now().isoformat()
        
        return jsonify(demo_results), 200
        
    except Exception as e:
        logger.error(f"Error running demo: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

# Error handlers for the blueprint
@hyperspectral_bp.errorhandler(RequestEntityTooLarge)
def handle_file_too_large(error):
    return jsonify({
        'status': 'error',
        'message': 'File too large. Please reduce file size and try again.',
        'max_size': '16MB per file, 64MB total for batch',
        'timestamp': datetime.now().isoformat()
    }), 413

@hyperspectral_bp.errorhandler(404)
def handle_not_found(error):
    return jsonify({
        'status': 'error',
        'message': 'Endpoint not found',
        'available_endpoints': [
            '/api/hyperspectral/health',
            '/api/hyperspectral/locations',
            '/api/hyperspectral/train',
            '/api/hyperspectral/process-image',
            '/api/hyperspectral/predict-location/<location>',
            '/api/hyperspectral/predict-all-locations',
            '/api/hyperspectral/batch-process',
            '/api/hyperspectral/analysis-summary',
            '/api/hyperspectral/demo'
        ],
        'timestamp': datetime.now().isoformat()
    }), 404

@hyperspectral_bp.errorhandler(500)
def handle_internal_error(error):
    return jsonify({
        'status': 'error',
        'message': 'Internal server error',
        'timestamp': datetime.now().isoformat()
    }), 500
