#!/usr/bin/env python3
"""
Agriculture Monitoring Platform - Server Startup
Starts the Flask backend server with all routes and services
"""

import sys
import os
import logging
from pathlib import Path

# Add the current directory to Python path
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

try:
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Import and create the app
    from backend.app import create_app
    
    print("🌱 Starting Agriculture Monitoring Platform...")
    print("📊 Initializing hyperspectral deep learning services...")
    
    # Create Flask application
    app, socketio = create_app('development')
    
    # Print available routes
    print("\n📡 Available API endpoints:")
    for rule in app.url_map.iter_rules():
        methods = ','.join(rule.methods - {'HEAD', 'OPTIONS'})
        print(f"  {methods:8} {rule.rule}")
    
    # Use port 3001 to match frontend configuration
    port = 3001
    print(f"\n🚀 Server starting on http://localhost:{port}")
    print("🔬 Hyperspectral routes available at /api/hyperspectral/*")
    print(f"💡 Health check: http://localhost:{port}/api/health")
    print(f"🧠 MATLAB service status: http://localhost:{port}/api/hyperspectral/health")
    
    # Start the server
    socketio.run(
        app,
        host='0.0.0.0',
        port=port,
        debug=True,
        allow_unsafe_werkzeug=True
    )
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("📝 Make sure all dependencies are installed:")
    print("   pip install flask flask-cors flask-socketio python-dotenv")
except Exception as e:
    print(f"❌ Error starting server: {e}")
    import traceback
    traceback.print_exc()
