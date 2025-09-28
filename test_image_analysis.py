#!/usr/bin/env python3
"""
Test script for Agricultural Image Analysis endpoints
"""
import requests
import json
import sys
from datetime import datetime

BASE_URL = "http://localhost:3001/api"

def test_image_analysis_health():
    """Test image analysis health endpoint"""
    print("🔍 Testing Image Analysis Health Endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/image-analysis/health")
        if response.status_code == 200:
            data = response.json()
            print("✅ Image Analysis Health Check: PASSED")
            print(f"   Service: {data['service']}")
            print(f"   Status: {data['status']}")
            print(f"   Supported crops: {len(data['supported_crops'])}")
            print(f"   Detectable conditions: {len(data['detectable_conditions'])}")
            return True
        else:
            print(f"❌ Image Analysis Health Check: FAILED ({response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Image Analysis Health Check: ERROR - {e}")
        return False

def test_crop_types_endpoint():
    """Test crop types endpoint"""
    print("\n🌾 Testing Crop Types Endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/image-analysis/crop-types")
        if response.status_code == 200:
            data = response.json()
            print("✅ Crop Types Endpoint: PASSED")
            print(f"   Total crops: {data['total_crops']}")
            print(f"   Total diseases: {data['total_diseases']}")
            print(f"   Sample crops: {list(data['supported_crops'].keys())[:3]}")
            return True
        else:
            print(f"❌ Crop Types Endpoint: FAILED ({response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Crop Types Endpoint: ERROR - {e}")
        return False

def test_disease_info_endpoint():
    """Test disease information endpoint"""
    print("\n🦠 Testing Disease Information Endpoint...")
    try:
        disease_name = "Bacterial_Blight"
        response = requests.get(f"{BASE_URL}/image-analysis/disease-info/{disease_name}")
        if response.status_code == 200:
            data = response.json()
            print("✅ Disease Information Endpoint: PASSED")
            print(f"   Disease: {data['disease_name']}")
            print(f"   Description: {data['disease_info']['description'][:50]}...")
            print(f"   Affected crops: {data['commonly_affected_crops']}")
            return True
        else:
            print(f"❌ Disease Information Endpoint: FAILED ({response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Disease Information Endpoint: ERROR - {e}")
        return False

def test_demo_endpoint():
    """Test demo endpoint"""
    print("\n🎯 Testing Demo Endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/image-analysis/demo")
        if response.status_code == 200:
            data = response.json()
            print("✅ Image Analysis Demo: PASSED")
            print(f"   Features: {len(data['features'])}")
            print(f"   Sample analysis crop: {data['sample_analysis']['crop_type']}")
            print(f"   Sample detection: {data['sample_analysis']['detected_condition']}")
            return True
        else:
            print(f"❌ Image Analysis Demo: FAILED ({response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Image Analysis Demo: ERROR - {e}")
        return False

def test_hyperspectral_health():
    """Test hyperspectral analysis health endpoint"""
    print("\n🔬 Testing Hyperspectral Health Endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/hyperspectral/health")
        if response.status_code == 200:
            data = response.json()
            print("✅ Hyperspectral Health Check: PASSED")
            print(f"   Service: {data['service']}")
            print(f"   Max file size: {data['max_file_size']}")
            print(f"   Hyperspectral bands: {len(data['processing_capabilities'])}")
            return True
        else:
            print(f"❌ Hyperspectral Health Check: FAILED ({response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Hyperspectral Health Check: ERROR - {e}")
        return False

def test_karnataka_locations():
    """Test Karnataka locations endpoint"""
    print("\n🗺️ Testing Karnataka Locations Endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/karnataka/locations")
        if response.status_code == 200:
            data = response.json()
            print("✅ Karnataka Locations: PASSED")
            print(f"   Available locations: {data['count']}")
            print(f"   State: {data['state']}")
            sample_locations = list(data['locations'].keys())[:3]
            print(f"   Sample locations: {sample_locations}")
            return True
        else:
            print(f"❌ Karnataka Locations: FAILED ({response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Karnataka Locations: ERROR - {e}")
        return False

def test_dashboard_summary():
    """Test dashboard summary endpoint"""
    print("\n📊 Testing Dashboard Summary Endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/dashboard/summary")
        if response.status_code == 200:
            data = response.json()
            print("✅ Dashboard Summary: PASSED")
            print(f"   Crop health status: {data['crop_health']['status']}")
            print(f"   Soil moisture: {data['soil_moisture']['value']}%")
            print(f"   Field: {data['field_info']['name']} - {data['field_info']['crop_type']}")
            return True
        else:
            print(f"❌ Dashboard Summary: FAILED ({response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Dashboard Summary: ERROR - {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 COMPREHENSIVE AGRICULTURE PLATFORM API TESTING")
    print("=" * 60)
    print(f"Testing against: {BASE_URL}")
    print(f"Test started at: {datetime.now().isoformat()}")
    print("=" * 60)
    
    tests = [
        ("Image Analysis Health", test_image_analysis_health),
        ("Crop Types", test_crop_types_endpoint),
        ("Disease Information", test_disease_info_endpoint),
        ("Image Analysis Demo", test_demo_endpoint),
        ("Hyperspectral Health", test_hyperspectral_health),
        ("Karnataka Locations", test_karnataka_locations),
        ("Dashboard Summary", test_dashboard_summary)
    ]
    
    results = []
    for test_name, test_func in tests:
        passed = test_func()
        results.append((test_name, passed))
    
    # Summary
    print("\n" + "=" * 60)
    print("🎯 TEST RESULTS SUMMARY")
    print("=" * 60)
    
    passed_tests = sum(1 for _, passed in results if passed)
    total_tests = len(results)
    
    for test_name, passed in results:
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"  {test_name:<25} {status}")
    
    print("-" * 60)
    print(f"Total Tests: {total_tests}")
    print(f"Passed: {passed_tests}")
    print(f"Failed: {total_tests - passed_tests}")
    print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
    
    if passed_tests == total_tests:
        print("\n🎉 ALL TESTS PASSED! Agriculture Platform is ready!")
        return 0
    else:
        print(f"\n⚠️  {total_tests - passed_tests} test(s) failed. Please check the server.")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
