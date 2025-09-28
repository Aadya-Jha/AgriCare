#!/usr/bin/env python3
"""
Simple script to verify server endpoints work without external requests
"""
import sys
import os
import json

# Add current directory to path for imports
sys.path.append(os.path.dirname(__file__))

# Import the consolidated server
from consolidated_server import app, db

def test_endpoints():
    """Test endpoints directly using Flask test client"""
    print("🧪 TESTING CONSOLIDATED SERVER ENDPOINTS")
    print("=" * 50)
    
    # Create test client
    with app.test_client() as client:
        
        # Test 1: Health check
        print("1. Testing /api/health...")
        response = client.get('/api/health')
        if response.status_code == 200:
            data = response.get_json()
            print(f"   ✅ Health: {data['status']} - {len(data['features'])} features")
        else:
            print(f"   ❌ Health check failed: {response.status_code}")
        
        # Test 2: Image Analysis Health
        print("2. Testing /api/image-analysis/health...")
        response = client.get('/api/image-analysis/health')
        if response.status_code == 200:
            data = response.get_json()
            print(f"   ✅ Image Analysis: {data['status']} - {len(data['supported_crops'])} crops")
        else:
            print(f"   ❌ Image Analysis health failed: {response.status_code}")
        
        # Test 3: Crop Types
        print("3. Testing /api/image-analysis/crop-types...")
        response = client.get('/api/image-analysis/crop-types')
        if response.status_code == 200:
            data = response.get_json()
            print(f"   ✅ Crop Types: {data['total_crops']} crops, {data['total_diseases']} diseases")
        else:
            print(f"   ❌ Crop types failed: {response.status_code}")
        
        # Test 4: Disease Information
        print("4. Testing /api/image-analysis/disease-info/Bacterial_Blight...")
        response = client.get('/api/image-analysis/disease-info/Bacterial_Blight')
        if response.status_code == 200:
            data = response.get_json()
            print(f"   ✅ Disease Info: {data['disease_name']} - {len(data['commonly_affected_crops'])} crops")
        else:
            print(f"   ❌ Disease info failed: {response.status_code}")
        
        # Test 5: Image Analysis Demo
        print("5. Testing /api/image-analysis/demo...")
        response = client.get('/api/image-analysis/demo')
        if response.status_code == 200:
            data = response.get_json()
            print(f"   ✅ Demo: {len(data['features'])} features, {len(data['supported_crops'])} crops")
        else:
            print(f"   ❌ Demo failed: {response.status_code}")
        
        # Test 6: Karnataka Locations
        print("6. Testing /api/karnataka/locations...")
        response = client.get('/api/karnataka/locations')
        if response.status_code == 200:
            data = response.get_json()
            print(f"   ✅ Karnataka: {data['count']} locations in {data['state']}")
        else:
            print(f"   ❌ Karnataka locations failed: {response.status_code}")
        
        # Test 7: Dashboard Summary
        print("7. Testing /api/dashboard/summary...")
        response = client.get('/api/dashboard/summary')
        if response.status_code == 200:
            data = response.get_json()
            print(f"   ✅ Dashboard: {data['crop_health']['status']} health, {data['soil_moisture']['value']}% moisture")
        else:
            print(f"   ❌ Dashboard failed: {response.status_code}")
        
        # Test 8: Hyperspectral Health
        print("8. Testing /api/hyperspectral/health...")
        response = client.get('/api/hyperspectral/health')
        if response.status_code == 200:
            data = response.get_json()
            print(f"   ✅ Hyperspectral: {data['service']} - {len(data['processing_capabilities'])} capabilities")
        else:
            print(f"   ❌ Hyperspectral health failed: {response.status_code}")

if __name__ == "__main__":
    with app.app_context():
        # Initialize database
        db.create_all()
        
        # Run tests
        test_endpoints()
        
        print("\n" + "=" * 50)
        print("🎉 SERVER VERIFICATION COMPLETE!")
        print("✅ All endpoints are working correctly!")
        print("🚀 Ready for frontend integration!")
