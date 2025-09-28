"""
MATLAB Hyperspectral Processing Service
This module integrates the MATLAB deep learning hyperspectral analysis 
with the Flask backend for real-time crop health assessment.
"""

import os
import json
import subprocess
import tempfile
from pathlib import Path
from typing import Dict, Any, Optional, Tuple
import logging
from datetime import datetime

try:
    import matlab.engine
    MATLAB_ENGINE_AVAILABLE = True
except ImportError:
    MATLAB_ENGINE_AVAILABLE = False
    logging.warning("MATLAB Engine for Python not available. Using simulation mode.")

class MATLABHyperspectralService:
    """Service for processing images using MATLAB hyperspectral deep learning model."""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.matlab_engine = None
        self.matlab_path = self._get_matlab_path()
        self.simulation_mode = not MATLAB_ENGINE_AVAILABLE
        
        # Initialize MATLAB engine if available
        if not self.simulation_mode:
            try:
                self._initialize_matlab_engine()
            except Exception as e:
                self.logger.error(f"Failed to initialize MATLAB engine: {e}")
                self.simulation_mode = True
    
    def _get_matlab_path(self) -> str:
        """Get the path to MATLAB processing scripts."""
        # Try multiple possible locations for MATLAB scripts
        possible_paths = [
            Path(__file__).parent.parent / "matlab-processing",  # backend/../matlab-processing
            Path(__file__).parent.parent.parent / "matlab-processing",  # backend/../../matlab-processing
            Path.cwd() / "matlab-processing",  # Current directory
        ]
        
        for matlab_path in possible_paths:
            if matlab_path.exists():
                return str(matlab_path)
        
        # If none exist, return the most likely path and let it be created later
        return str(possible_paths[1])  # Project root / matlab-processing
    
    def _initialize_matlab_engine(self):
        """Initialize MATLAB engine and add paths."""
        self.logger.info("Initializing MATLAB engine...")
        self.matlab_engine = matlab.engine.start_matlab()
        
        # Add MATLAB processing paths
        self.matlab_engine.addpath(self.matlab_path, nargout=0)
        self.matlab_engine.addpath(os.path.join(self.matlab_path, "deep_learning"), nargout=0)
        self.matlab_engine.addpath(os.path.join(self.matlab_path, "hyperspectral"), nargout=0)
        
        self.logger.info("MATLAB engine initialized successfully")
    
    def train_model(self) -> Dict[str, Any]:
        """
        Train the hyperspectral deep learning model.
        
        Returns:
            Dict containing training results
        """
        self.logger.info("Starting hyperspectral model training...")
        
        if self.simulation_mode:
            return self._simulate_training_results()
        
        try:
            # Call MATLAB training function
            results = self.matlab_engine.advanced_hyperspectral_dl_model(
                'mode', 'train', nargout=1
            )
            
            # Convert MATLAB struct to Python dict
            python_results = self._matlab_struct_to_dict(results)
            
            self.logger.info(f"Training completed with status: {python_results.get('status')}")
            return python_results
            
        except Exception as e:
            # If MATLAB function not found, fall back to simulation
            if "Undefined function" in str(e) or "Unrecognized function" in str(e):
                self.logger.warning(f"MATLAB function not found, falling back to simulation: {e}")
                self.simulation_mode = True
                return self._simulate_training_results()
            
            self.logger.error(f"Error during model training: {e}")
            return {
                'status': 'error',
                'message': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def process_rgb_image(self, image_path: str) -> Dict[str, Any]:
        """
        Convert RGB image to hyperspectral analysis and provide crop health assessment.
        
        Args:
            image_path: Path to the input RGB image
            
        Returns:
            Dict containing analysis results
        """
        self.logger.info(f"Processing RGB image: {image_path}")
        
        if not os.path.exists(image_path):
            return {
                'status': 'error',
                'message': f'Image file not found: {image_path}',
                'timestamp': datetime.now().isoformat()
            }
        
        if self.simulation_mode:
            return self._simulate_image_processing_results(image_path)
        
        try:
            # Call MATLAB image processing function
            results = self.matlab_engine.advanced_hyperspectral_dl_model(
                'mode', 'convert_image',
                'input_image', image_path,
                nargout=1
            )
            
            # Convert MATLAB struct to Python dict
            python_results = self._matlab_struct_to_dict(results)
            
            self.logger.info(f"Image processing completed with status: {python_results.get('status')}")
            return python_results
            
        except Exception as e:
            # If MATLAB function not found, fall back to simulation
            if "Undefined function" in str(e) or "Unrecognized function" in str(e):
                self.logger.warning(f"MATLAB function not found, falling back to simulation: {e}")
                self.simulation_mode = True
                return self._simulate_image_processing_results(image_path)
            
            self.logger.error(f"Error during image processing: {e}")
            return {
                'status': 'error',
                'message': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def predict_location_health(self, location: str) -> Dict[str, Any]:
        """
        Predict crop health for a specific Indian agricultural location.
        
        Args:
            location: Indian location name (e.g., 'Anand', 'Kota')
            
        Returns:
            Dict containing prediction results
        """
        self.logger.info(f"Predicting crop health for location: {location}")
        
        if self.simulation_mode:
            return self._simulate_location_prediction(location)
        
        try:
            # Call MATLAB prediction function
            results = self.matlab_engine.advanced_hyperspectral_dl_model(
                'mode', 'predict',
                'location', location,
                nargout=1
            )
            
            # Convert MATLAB struct to Python dict
            python_results = self._matlab_struct_to_dict(results)
            
            self.logger.info(f"Location prediction completed with status: {python_results.get('status')}")
            return python_results
            
        except Exception as e:
            # If MATLAB function not found, fall back to simulation
            if "Undefined function" in str(e) or "Unrecognized function" in str(e):
                self.logger.warning(f"MATLAB function not found, falling back to simulation: {e}")
                self.simulation_mode = True
                return self._simulate_location_prediction(location)
            
            self.logger.error(f"Error during location prediction: {e}")
            return {
                'status': 'error',
                'message': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def get_supported_locations(self) -> Dict[str, Any]:
        """Get list of supported Indian agricultural locations."""
        locations = {
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
        
        return {
            'status': 'success',
            'locations': locations,
            'count': len(locations)
        }
    
    def process_batch_images(self, image_paths: list) -> Dict[str, Any]:
        """
        Process multiple images in batch.
        
        Args:
            image_paths: List of image file paths
            
        Returns:
            Dict containing batch processing results
        """
        self.logger.info(f"Processing batch of {len(image_paths)} images")
        
        results = {
            'status': 'success',
            'batch_size': len(image_paths),
            'results': [],
            'summary': {
                'successful': 0,
                'failed': 0,
                'total_processing_time': 0
            },
            'timestamp': datetime.now().isoformat()
        }
        
        start_time = datetime.now()
        
        for i, image_path in enumerate(image_paths):
            self.logger.info(f"Processing image {i+1}/{len(image_paths)}: {image_path}")
            
            image_result = self.process_rgb_image(image_path)
            results['results'].append(image_result)
            
            if image_result.get('status') == 'success':
                results['summary']['successful'] += 1
            else:
                results['summary']['failed'] += 1
        
        end_time = datetime.now()
        results['summary']['total_processing_time'] = (end_time - start_time).total_seconds()
        results['summary']['average_time_per_image'] = results['summary']['total_processing_time'] / len(image_paths)
        
        if results['summary']['failed'] > 0:
            results['status'] = 'partial_success'
        
        self.logger.info(f"Batch processing completed: {results['summary']}")
        return results
    
    def _matlab_struct_to_dict(self, matlab_struct) -> Dict[str, Any]:
        """Convert MATLAB struct to Python dictionary."""
        if matlab_struct is None:
            return {}
        
        try:
            # This is a simplified conversion - in practice, you might need
            # more sophisticated handling depending on your MATLAB output structure
            if hasattr(matlab_struct, '_data'):
                # Handle MATLAB struct
                result = {}
                for key in matlab_struct._fieldnames:
                    value = getattr(matlab_struct, key)
                    if hasattr(value, '_data'):
                        result[key] = self._matlab_struct_to_dict(value)
                    else:
                        result[key] = value
                return result
            else:
                return matlab_struct
        except Exception as e:
            self.logger.warning(f"Error converting MATLAB struct: {e}")
            return {'raw_data': str(matlab_struct)}
    
    def _simulate_training_results(self) -> Dict[str, Any]:
        """Simulate model training results when MATLAB is not available."""
        import random
        
        return {
            'status': 'success',
            'model_path': f'{self.matlab_path}/trained_models/simulated_model.mat',
            'accuracy': 0.85 + 0.1 * random.random(),
            'num_samples': 5000,
            'num_bands': 424,
            'wavelength_range': [381.45, 2500.12],
            'data_source': 'synthetic',
            'locations': ['Anand', 'Jhagdia', 'Kota', 'Maddur', 'Talala'],
            'health_classes': ['Excellent', 'Good', 'Fair', 'Poor'],
            'training_completed': datetime.now().isoformat(),
            'model_architecture': 'Simulated Advanced CNN with 5 conv blocks + 3 FC layers',
            'simulation_mode': True
        }
    
    def _simulate_image_processing_results(self, image_path: str) -> Dict[str, Any]:
        """Simulate image processing results when MATLAB is not available."""
        import random
        import numpy as np
        
        # Simulate health analysis
        overall_health = 0.3 + 0.6 * random.random()
        
        health_classes = ['Excellent', 'Good', 'Fair', 'Poor']
        class_probs = np.random.dirichlet([4, 3, 2, 1])  # Bias toward better health
        dominant_idx = np.argmax(class_probs)
        
        # Simulate vegetation indices
        base_ndvi = 0.2 + 0.6 * overall_health
        ndvi_noise = 0.1 * random.random()
        
        return {
            'status': 'success',
            'input_image': image_path,
            'conversion_method': 'Simulated CNN-based RGB to Hyperspectral',
            'health_analysis': {
                'overall_health_score': overall_health,
                'dominant_health_status': health_classes[dominant_idx],
                'confidence': class_probs[dominant_idx],
                'pixels_analyzed': random.randint(500, 2000),
                'excellent_percent': class_probs[0] * 100,
                'good_percent': class_probs[1] * 100,
                'fair_percent': class_probs[2] * 100,
                'poor_percent': class_probs[3] * 100
            },
            'vegetation_indices': {
                'ndvi': {
                    'mean': base_ndvi + ndvi_noise,
                    'std': 0.05 + 0.1 * random.random(),
                    'min': max(0, base_ndvi - 0.2),
                    'max': min(1, base_ndvi + 0.2)
                },
                'savi': {
                    'mean': (base_ndvi + ndvi_noise) * 0.9,
                    'std': 0.04 + 0.08 * random.random()
                },
                'evi': {
                    'mean': (base_ndvi + ndvi_noise) * 0.8,
                    'std': 0.03 + 0.06 * random.random()
                },
                'gndvi': {
                    'mean': (base_ndvi + ndvi_noise) * 0.85,
                    'std': 0.04 + 0.07 * random.random()
                },
                'vegetation_coverage': 60 + 30 * overall_health,
                'healthy_vegetation_percent': 40 + 50 * overall_health
            },
            'hyperspectral_bands': 424,
            'wavelength_range': [381.45, 2500.12],
            'analysis_timestamp': datetime.now().isoformat(),
            'recommendations': self._generate_health_recommendations(overall_health, base_ndvi + ndvi_noise),
            'simulation_mode': True
        }
    
    def _simulate_location_prediction(self, location: str) -> Dict[str, Any]:
        """Simulate location-specific crop health prediction."""
        import random
        
        location_info = self.get_supported_locations()['locations'].get(location, {})
        
        # Climate-based health simulation
        climate = location_info.get('climate', 'Unknown')
        if climate == 'Tropical':
            base_health = 0.7 + 0.2 * random.random()
        elif climate == 'Humid':
            base_health = 0.65 + 0.25 * random.random()
        elif climate == 'Coastal':
            base_health = 0.6 + 0.3 * random.random()
        elif climate == 'Semi-arid':
            base_health = 0.55 + 0.3 * random.random()
        elif climate == 'Arid':
            base_health = 0.4 + 0.4 * random.random()
        else:
            base_health = 0.5 + 0.3 * random.random()
        
        health_classes = ['Excellent', 'Good', 'Fair', 'Poor']
        class_dist = [25, 35, 30, 10]  # Default distribution
        
        # Adjust distribution based on health score
        if base_health > 0.8:
            class_dist = [60, 30, 8, 2]
            dominant_class = 'Excellent'
        elif base_health > 0.6:
            class_dist = [30, 50, 15, 5]
            dominant_class = 'Good'
        elif base_health > 0.4:
            class_dist = [10, 30, 45, 15]
            dominant_class = 'Fair'
        else:
            class_dist = [5, 15, 35, 45]
            dominant_class = 'Poor'
        
        return {
            'status': 'success',
            'location': location,
            'coordinates': location_info.get('coordinates', [0, 0]),
            'health_metrics': {
                'overall_health_score': base_health,
                'dominant_class': dominant_class,
                'average_ndvi': 0.2 + 0.6 * base_health,
                'samples_analyzed': 100,
                'class_distribution': dict(zip(health_classes, class_dist))
            },
            'recommendations': self._generate_location_recommendations(location, climate, base_health),
            'analysis_timestamp': datetime.now().isoformat(),
            'simulation_mode': True
        }
    
    def _generate_health_recommendations(self, health_score: float, ndvi: float) -> list:
        """Generate health-based recommendations."""
        recommendations = []
        
        if health_score > 0.8:
            recommendations.extend([
                'Excellent crop health detected - continue current management practices',
                'Monitor for any early signs of pest or disease pressure'
            ])
        elif health_score > 0.6:
            recommendations.extend([
                'Good crop health - consider optimizing nutrition for better growth',
                'Monitor water stress indicators regularly'
            ])
        elif health_score > 0.4:
            recommendations.extend([
                'Fair crop health - investigate potential stress factors',
                'Consider soil testing and nutrient management',
                'Check irrigation scheduling and water availability'
            ])
        else:
            recommendations.extend([
                'Poor crop health detected - immediate action required',
                'Conduct thorough field inspection for pests and diseases',
                'Review irrigation, nutrition, and soil management practices'
            ])
        
        # NDVI-based recommendations
        if ndvi < 0.3:
            recommendations.append('Low vegetation vigor detected - consider fertilization')
        elif ndvi > 0.8:
            recommendations.append('High vegetation vigor - monitor for optimal harvest timing')
        
        # General recommendations
        recommendations.extend([
            'Continue regular monitoring using hyperspectral analysis',
            'Implement precision agriculture practices based on spatial variability'
        ])
        
        return recommendations
    
    def _generate_location_recommendations(self, location: str, climate: str, health_score: float) -> list:
        """Generate location-specific recommendations."""
        recommendations = []
        
        # Climate-specific recommendations
        if climate == 'Arid':
            recommendations.extend([
                'Implement water-efficient irrigation systems for arid climate',
                'Consider drought-resistant crop varieties'
            ])
        elif climate == 'Humid':
            recommendations.extend([
                'Monitor for fungal diseases in humid conditions',
                'Ensure adequate drainage to prevent waterlogging'
            ])
        elif climate == 'Tropical':
            recommendations.extend([
                'Optimize for high rainfall tropical conditions',
                'Monitor for pest pressure in warm climate'
            ])
        elif climate == 'Semi-arid':
            recommendations.extend([
                'Balance irrigation for semi-arid conditions',
                'Monitor soil moisture levels closely'
            ])
        elif climate == 'Coastal':
            recommendations.extend([
                'Account for salt spray effects in coastal areas',
                'Consider salt-tolerant varieties if needed'
            ])
        
        # Health-based recommendations
        if health_score > 0.8:
            recommendations.append(f'Excellent health in {location} - maintain current practices')
        elif health_score > 0.6:
            recommendations.append(f'Good health in {location} - minor optimizations suggested')
        else:
            recommendations.append(f'Health concerns in {location} - investigate stress factors')
        
        return recommendations
    
    def cleanup(self):
        """Clean up MATLAB engine resources."""
        if self.matlab_engine:
            try:
                self.matlab_engine.quit()
                self.logger.info("MATLAB engine cleanup completed")
            except Exception as e:
                self.logger.error(f"Error during MATLAB engine cleanup: {e}")

# Global service instance
matlab_service = MATLABHyperspectralService()

def get_matlab_service() -> MATLABHyperspectralService:
    """Get the global MATLAB hyperspectral service instance."""
    return matlab_service
