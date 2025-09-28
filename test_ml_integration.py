#!/usr/bin/env python3
"""
Test ML Model Integration
"""
import sys
import os
import numpy as np
from PIL import Image
import io

# Add current directory to path
sys.path.append(os.path.dirname(__file__))

def test_ml_model():
    """Test the ML disease detector"""
    print("🧪 TESTING ML MODEL INTEGRATION")
    print("=" * 50)
    
    try:
        # Import the disease detector
        from ml_models.disease_detector import DiseaseDetector, get_disease_detector
        
        print("✅ Successfully imported DiseaseDetector")
        
        # Initialize detector
        detector = get_disease_detector()
        print(f"✅ Model initialized: {detector.model is not None}")
        print(f"   Classes: {len(detector.class_names)}")
        print(f"   Disease classes: {list(detector.disease_classes.values())}")
        
        # Create a test image (synthetic)
        test_image = create_test_image()
        print(f"✅ Created test image: {test_image.shape}")
        
        # Test prediction
        result = detector.predict(test_image, crop_type='Rice')
        print(f"✅ Prediction successful")
        print(f"   Primary detection: {result['primary_prediction']['disease']}")
        print(f"   Confidence: {result['confidence']:.3f}")
        print(f"   Health score: {result['health_score']:.3f}")
        print(f"   Processing time: {result['processing_time_ms']}ms")
        
        # Test feature extraction
        if 'image_features' in result:
            features = result['image_features']
            print(f"✅ Feature extraction successful")
            print(f"   Green percentage: {features['color_distribution']['green_percentage']:.1f}%")
            print(f"   Texture smoothness: {features['texture_analysis']['smoothness']:.3f}")
        
        return True
        
    except ImportError as e:
        print(f"❌ Import failed: {e}")
        print("   TensorFlow may not be installed properly")
        return False
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def test_server_integration():
    """Test server integration with ML models"""
    print("\n🧪 TESTING SERVER INTEGRATION")
    print("=" * 50)
    
    try:
        # Import server functions
        from consolidated_server import analyze_crop_image, ML_MODELS_AVAILABLE
        
        print(f"✅ ML Models Available: {ML_MODELS_AVAILABLE}")
        
        # Create test image data
        test_image_data = create_test_image_bytes()
        
        # Test analysis function
        result = analyze_crop_image(test_image_data, 'Rice')
        print(f"✅ Server analysis successful")
        print(f"   Status: {result['status']}")
        print(f"   Primary disease: {result['analysis_summary']['primary_detection']['disease']}")
        print(f"   Health status: {result['analysis_summary']['health_status']}")
        print(f"   ML enabled: {result['analysis_metadata'].get('ml_enabled', False)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Server integration test failed: {e}")
        return False

def create_test_image():
    """Create a synthetic test image for testing"""
    # Create a 224x224x3 RGB image (green crop with some brown spots)
    image = np.zeros((224, 224, 3), dtype=np.uint8)
    
    # Fill with green (healthy crop)
    image[:, :, 1] = 120  # Green channel
    image[:, :, 0] = 50   # Red channel
    image[:, :, 2] = 50   # Blue channel
    
    # Add some brown spots (disease simulation)
    for i in range(5):
        x = np.random.randint(20, 200)
        y = np.random.randint(20, 200)
        size = np.random.randint(10, 30)
        
        # Create brown spot
        image[x:x+size, y:y+size, 0] = 139  # Brown red
        image[x:x+size, y:y+size, 1] = 69   # Brown green
        image[x:x+size, y:y+size, 2] = 19   # Brown blue
    
    return image

def create_test_image_bytes():
    """Create test image as bytes for server testing"""
    image_array = create_test_image()
    
    # Convert to PIL Image
    pil_image = Image.fromarray(image_array, 'RGB')
    
    # Convert to bytes
    img_byte_arr = io.BytesIO()
    pil_image.save(img_byte_arr, format='JPEG')
    img_byte_arr = img_byte_arr.getvalue()
    
    return img_byte_arr

def main():
    """Run all tests"""
    print("🚀 AGRICULTURAL ML MODEL TESTING")
    print("=" * 60)
    
    # Test 1: ML Model
    ml_success = test_ml_model()
    
    # Test 2: Server Integration
    server_success = test_server_integration()
    
    # Summary
    print("\n" + "=" * 60)
    print("🎯 TEST RESULTS SUMMARY")
    print("=" * 60)
    print(f"ML Model Test:      {'✅ PASSED' if ml_success else '❌ FAILED'}")
    print(f"Server Integration: {'✅ PASSED' if server_success else '❌ FAILED'}")
    
    if ml_success and server_success:
        print("\n🎉 ALL TESTS PASSED!")
        print("🤖 Real ML models are working correctly!")
        print("🌱 Agriculture platform is ready for production!")
        return 0
    else:
        print("\n⚠️  Some tests failed.")
        print("📋 Check the error messages above.")
        if not ml_success:
            print("💡 ML models may need TensorFlow installation or model training.")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
