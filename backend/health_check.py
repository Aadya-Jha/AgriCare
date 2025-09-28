#!/usr/bin/env python3
"""
Simple health check script for Render deployment
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from run import app
    print("✅ App imported successfully")
    
    with app.test_client() as client:
        response = client.get('/api/health')
        print(f"✅ Health check response: {response.status_code}")
        print(f"✅ Response data: {response.get_json()}")
        
except Exception as e:
    print(f"❌ Health check failed: {e}")
    sys.exit(1)

print("🌾 AgriCare Backend is ready for deployment!")