#!/usr/bin/env python3
"""
Test Script for MATLAB Hyperspectral Processing Pipeline
This script tests the complete workflow from RGB image input to 
hyperspectral analysis and crop health results.
"""

import os
import sys
import json
import logging
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent / "backend"
sys.path.append(str(backend_path))

from services.matlab_hyperspectral_service import MATLABHyperspectralService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def test_service_initialization():
    """Test MATLAB service initialization."""
    print("\n=== Testing Service Initialization ===")
    
    try:
        service = MATLABHyperspectralService()
        print(f"✓ Service initialized successfully")
        print(f"  - Simulation mode: {service.simulation_mode}")
        print(f"  - MATLAB path: {service.matlab_path}")
        return service
    except Exception as e:
        print(f"✗ Service initialization failed: {e}")
        return None

def test_supported_locations(service):
    """Test getting supported locations."""
    print("\n=== Testing Supported Locations ===")
    
    try:
        locations = service.get_supported_locations()
        print(f"✓ Retrieved {locations['count']} supported locations:")
        
        for name, info in locations['locations'].items():
            print(f"  - {name}, {info['state']} ({info['climate']} climate)")
            print(f"    Coordinates: {info['coordinates']}")
            print(f"    Major crops: {', '.join(info['major_crops'])}")
            print()
        
        return True
    except Exception as e:
        print(f"✗ Failed to get locations: {e}")
        return False

def test_location_prediction(service, location='Anand'):
    """Test location-specific crop health prediction."""
    print(f"\n=== Testing Location Prediction for {location} ===")
    
    try:
        result = service.predict_location_health(location)
        
        if result.get('status') == 'success':
            print(f"✓ Prediction successful for {location}")
            
            health = result['health_metrics']
            print(f"  - Overall health score: {health['overall_health_score']:.3f}")
            print(f"  - Dominant class: {health['dominant_class']}")
            print(f"  - Average NDVI: {health['average_ndvi']:.3f}")
            print(f"  - Samples analyzed: {health['samples_analyzed']}")
            
            print(f"  - Recommendations ({len(result['recommendations'])}):")
            for i, rec in enumerate(result['recommendations'][:3], 1):
                print(f"    {i}. {rec}")
            
            return True
        else:
            print(f"✗ Prediction failed: {result.get('message')}")
            return False
            
    except Exception as e:
        print(f"✗ Location prediction failed: {e}")
        return False

def test_all_location_predictions(service):
    """Test predictions for all supported locations."""
    print("\n=== Testing All Location Predictions ===")
    
    locations = ['Anand', 'Jhagdia', 'Kota', 'Maddur', 'Talala']
    results = {}
    
    for location in locations:
        try:
            result = service.predict_location_health(location)
            if result.get('status') == 'success':
                health_score = result['health_metrics']['overall_health_score']
                dominant_class = result['health_metrics']['dominant_class']
                results[location] = {
                    'health_score': health_score,
                    'dominant_class': dominant_class,
                    'status': 'success'
                }
                print(f"✓ {location}: {health_score:.3f} ({dominant_class})")
            else:
                results[location] = {'status': 'failed', 'message': result.get('message')}
                print(f"✗ {location}: Failed")
        except Exception as e:
            results[location] = {'status': 'error', 'message': str(e)}
            print(f"✗ {location}: Error - {e}")
    
    success_count = sum(1 for r in results.values() if r.get('status') == 'success')
    print(f"\n  Summary: {success_count}/{len(locations)} locations processed successfully")
    return results

def create_test_image():
    """Create a simple test image for processing."""
    print("\n=== Creating Test Image ===")
    
    try:
        from PIL import Image
        import numpy as np
        
        # Create a simple test image with crop-like features
        width, height = 400, 300
        
        # Create RGB array
        img_array = np.zeros((height, width, 3), dtype=np.uint8)
        
        # Add soil background (brown)
        img_array[:, :, 0] = 139  # Red
        img_array[:, :, 1] = 100  # Green
        img_array[:, :, 2] = 60   # Blue
        
        # Add some crop rows (green stripes)
        for row in range(0, width, 60):
            start_row = max(0, row - 15)
            end_row = min(width, row + 15)
            img_array[:, start_row:end_row, 0] = 50   # Less red
            img_array[:, start_row:end_row, 1] = 180  # More green
            img_array[:, start_row:end_row, 2] = 50   # Less blue
        
        # Add some variation
        noise = np.random.normal(0, 10, (height, width, 3)).astype(np.int16)
        img_array = np.clip(img_array.astype(np.int16) + noise, 0, 255).astype(np.uint8)
        
        # Create image and save
        img = Image.fromarray(img_array)
        test_image_path = "test_crop_image.jpg"
        img.save(test_image_path)
        
        print(f"✓ Test image created: {test_image_path}")
        print(f"  - Size: {width}x{height} pixels")
        return test_image_path
        
    except ImportError:
        print("✗ PIL not available. Creating a placeholder text file instead.")
        test_image_path = "test_image_placeholder.txt"
        with open(test_image_path, 'w') as f:
            f.write("This is a placeholder for a test image (PIL not available)")
        return test_image_path
        
    except Exception as e:
        print(f"✗ Failed to create test image: {e}")
        return None

def test_image_processing(service, image_path):
    """Test RGB image processing."""
    print(f"\n=== Testing Image Processing ===")
    
    if not image_path or not os.path.exists(image_path):
        print("✗ Test image not available, skipping image processing test")
        return False
    
    try:
        result = service.process_rgb_image(image_path)
        
        if result.get('status') == 'success':
            print(f"✓ Image processing successful")
            
            health = result['health_analysis']
            print(f"  - Overall health score: {health['overall_health_score']:.3f}")
            print(f"  - Dominant health status: {health['dominant_health_status']}")
            print(f"  - Confidence: {health['confidence']:.3f}")
            print(f"  - Pixels analyzed: {health['pixels_analyzed']}")
            
            veg_indices = result['vegetation_indices']
            print(f"  - NDVI: {veg_indices['ndvi']['mean']:.3f} ±{veg_indices['ndvi']['std']:.3f}")
            print(f"  - SAVI: {veg_indices['savi']['mean']:.3f}")
            print(f"  - EVI: {veg_indices['evi']['mean']:.3f}")
            print(f"  - Vegetation coverage: {veg_indices['vegetation_coverage']:.1f}%")
            
            print(f"  - Recommendations ({len(result['recommendations'])}):")
            for i, rec in enumerate(result['recommendations'][:3], 1):
                print(f"    {i}. {rec}")
            
            return True
        else:
            print(f"✗ Image processing failed: {result.get('message')}")
            return False
            
    except Exception as e:
        print(f"✗ Image processing failed: {e}")
        return False

def test_model_training(service):
    """Test model training (in simulation mode this will be fast)."""
    print("\n=== Testing Model Training ===")
    
    try:
        result = service.train_model()
        
        if result.get('status') == 'success':
            print(f"✓ Model training successful")
            print(f"  - Accuracy: {result['accuracy']:.3f}")
            print(f"  - Number of samples: {result['num_samples']}")
            print(f"  - Number of bands: {result['num_bands']}")
            print(f"  - Wavelength range: {result['wavelength_range'][0]:.1f} - {result['wavelength_range'][1]:.1f} nm")
            print(f"  - Data source: {result['data_source']}")
            print(f"  - Locations: {', '.join(result['locations'])}")
            print(f"  - Health classes: {', '.join(result['health_classes'])}")
            
            if result.get('simulation_mode'):
                print(f"  - Note: Training performed in simulation mode")
            
            return True
        else:
            print(f"✗ Model training failed: {result.get('message')}")
            return False
            
    except Exception as e:
        print(f"✗ Model training failed: {e}")
        return False

def run_comprehensive_test():
    """Run comprehensive test of the entire pipeline."""
    print("=" * 60)
    print("MATLAB HYPERSPECTRAL PROCESSING PIPELINE TEST")
    print("=" * 60)
    
    # Test results
    test_results = {
        'service_init': False,
        'locations': False,
        'location_prediction': False,
        'all_predictions': False,
        'image_processing': False,
        'model_training': False
    }
    
    # Initialize service
    service = test_service_initialization()
    if service:
        test_results['service_init'] = True
        
        # Test locations
        test_results['locations'] = test_supported_locations(service)
        
        # Test single location prediction
        test_results['location_prediction'] = test_location_prediction(service)
        
        # Test all location predictions
        all_pred_results = test_all_location_predictions(service)
        test_results['all_predictions'] = len([r for r in all_pred_results.values() if r.get('status') == 'success']) > 0
        
        # Test image processing
        test_image_path = create_test_image()
        test_results['image_processing'] = test_image_processing(service, test_image_path)
        
        # Test model training
        test_results['model_training'] = test_model_training(service)
    
    # Print summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    passed_tests = sum(test_results.values())
    total_tests = len(test_results)
    
    for test_name, result in test_results.items():
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{test_name.replace('_', ' ').title():.<30} {status}")
    
    print(f"\nOverall Result: {passed_tests}/{total_tests} tests passed")
    
    if passed_tests == total_tests:
        print("🎉 All tests passed! The hyperspectral processing pipeline is working correctly.")
    elif passed_tests > 0:
        print("⚠️  Some tests passed. The pipeline has partial functionality.")
    else:
        print("❌ All tests failed. Please check the setup.")
    
    # Cleanup
    for cleanup_file in ["test_crop_image.jpg", "test_image_placeholder.txt"]:
        if os.path.exists(cleanup_file):
            try:
                os.remove(cleanup_file)
                print(f"Cleaned up: {cleanup_file}")
            except:
                pass
    
    return test_results

if __name__ == "__main__":
    # Run the comprehensive test
    results = run_comprehensive_test()
    
    # Exit with appropriate code
    if all(results.values()):
        sys.exit(0)  # All tests passed
    else:
        sys.exit(1)  # Some tests failed
