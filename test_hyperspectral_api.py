#!/usr/bin/env python3
"""
Test script for hyperspectral API functionality
"""

import sys
import requests
import json
from pathlib import Path

# Add the current directory to Python path
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

def test_api_endpoints():
    """Test various hyperspectral API endpoints"""
    base_url = "http://localhost:3001/api"
    
    print("🧪 Testing Hyperspectral API Endpoints")
    print("=" * 50)
    
    # Test 1: General health check
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        print(f"✅ General Health Check: {response.status_code}")
        if response.status_code == 200:
            print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"❌ General Health Check failed: {e}")
    
    # Test 2: Hyperspectral service health
    try:
        response = requests.get(f"{base_url}/hyperspectral/health", timeout=10)
        print(f"✅ Hyperspectral Health Check: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   MATLAB Engine Available: {data.get('matlab_engine_available', 'Unknown')}")
            print(f"   Simulation Mode: {data.get('simulation_mode', 'Unknown')}")
            print(f"   Supported Locations: {len(data.get('supported_locations', []))}")
    except Exception as e:
        print(f"❌ Hyperspectral Health Check failed: {e}")
    
    # Test 3: Get supported locations
    try:
        response = requests.get(f"{base_url}/hyperspectral/locations", timeout=5)
        print(f"✅ Get Locations: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            locations = list(data.get('locations', {}).keys())
            print(f"   Available locations: {', '.join(locations)}")
    except Exception as e:
        print(f"❌ Get Locations failed: {e}")
    
    # Test 4: Test a simple image processing (simulation)
    print(f"\n📊 Testing Backend Service Integration:")
    try:
        # Import and test the service directly
        from backend.services.matlab_hyperspectral_service import get_matlab_service
        
        service = get_matlab_service()
        print(f"✅ Service initialized successfully")
        print(f"   Simulation mode: {service.simulation_mode}")
        print(f"   MATLAB path: {service.matlab_path}")
        
        # Test location prediction (should work in simulation mode)
        result = service.predict_location_health('Anand')
        if result.get('status') == 'success':
            print(f"✅ Location prediction works")
            print(f"   Health score: {result.get('health_metrics', {}).get('overall_health_score', 'N/A')}")
        else:
            print(f"⚠️  Location prediction returned: {result.get('status')}")
            
    except Exception as e:
        print(f"❌ Backend service test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_api_endpoints()
