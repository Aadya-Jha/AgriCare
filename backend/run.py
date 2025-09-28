#!/usr/bin/env python3
"""
AgriCare Backend - Render Deployment Entry Point
Lightweight Flask API server for agricultural monitoring
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add current directory to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

# Start with minimal Flask app for reliable deployment
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from simple_config import config

# Create minimal Flask application
app = Flask(__name__)

# Load configuration
config_name = os.getenv('FLASK_ENV', 'production')
app.config.from_object(config[config_name])
config[config_name].init_app(app)

# Initialize extensions
CORS(app, origins=["*"])
db = SQLAlchemy(app)

# Basic routes
@app.route('/')
def root():
    return jsonify({
        'message': 'AgriCare API Server',
        'version': '1.0.0',
        'status': 'online',
        'environment': config_name,
        'endpoints': {
            'health': '/api/health',
            'status': '/api/status',
            'sensors': '/api/sensors',
            'auth': '/api/auth'
        }
    })

@app.route('/api/health')
def health():
    return jsonify({
        'status': 'healthy',
        'service': 'agricare-api',
        'timestamp': os.environ.get('RENDER_GIT_COMMIT', 'local'),
        'database': 'connected' if db else 'not configured'
    })

@app.route('/api/status')
def status():
    return jsonify({
        'backend': 'online',
        'database': 'sqlite' if 'sqlite' in app.config['SQLALCHEMY_DATABASE_URI'] else 'postgresql',
        'features': {
            'basic_api': 'enabled',
            'database': 'enabled',
            'cors': 'enabled',
            'authentication': 'available',
            'file_upload': 'limited',
            'hyperspectral': 'disabled',
            'ml_models': 'disabled',
            'matlab': 'disabled'
        },
        'environment': config_name
    })

# Simple sensor data endpoint
@app.route('/api/sensors', methods=['GET', 'POST'])
def sensors():
    if request.method == 'GET':
        return jsonify({
            'sensors': [
                {'id': 1, 'type': 'temperature', 'value': 25.5, 'unit': 'C'},
                {'id': 2, 'type': 'humidity', 'value': 65.2, 'unit': '%'},
                {'id': 3, 'type': 'soil_moisture', 'value': 78.1, 'unit': '%'}
            ],
            'timestamp': '2024-09-28T10:00:00Z'
        })
    else:
        return jsonify({'message': 'Sensor data received', 'status': 'ok'})

# Basic auth endpoint
@app.route('/api/auth/login', methods=['POST'])
def login():
    return jsonify({
        'message': 'Login endpoint available',
        'token': 'demo-token-123',
        'user': {'id': 1, 'name': 'Demo User', 'role': 'farmer'}
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found', 'available_endpoints': ['/', '/api/health', '/api/status', '/api/sensors']}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error', 'message': 'Please check logs'}), 500

# Initialize database tables
with app.app_context():
    try:
        db.create_all()
        print("📊 Database tables created successfully")
    except Exception as e:
        print(f"⚠️ Database initialization warning: {e}")

if __name__ == '__main__':
    port = int(os.getenv('PORT', 10000))
    print(f"🌾 Starting AgriCare API Server on port {port}")
    print(f"🔧 Environment: {config_name}")
    print(f"🗄️ Database: {app.config['SQLALCHEMY_DATABASE_URI'][:50]}...")
    
    app.run(host='0.0.0.0', port=port, debug=(config_name == 'development'))

# Legacy compatibility (if needed)
try:
    from app import create_app
    print("✅ Full app module available as fallback")
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("📦 Starting minimal Flask server...")
    
    # Fallback: Create minimal Flask app if main app fails
    from flask import Flask, jsonify
    from flask_cors import CORS
    
    app = Flask(__name__)
    CORS(app)
    
    @app.route('/api/health')
    def health():
        return jsonify({
            'status': 'healthy',
            'service': 'agricare-api',
            'mode': 'minimal',
            'message': 'Basic API server running'
        })
    
    @app.route('/api/status')  
    def status():
        return jsonify({
            'backend': 'online',
            'features': {
                'sensors': 'available',
                'auth': 'available', 
                'dashboard': 'available',
                'hyperspectral': 'disabled',
                'ml_models': 'disabled'
            }
        })
        
    @app.route('/')
    def root():
        return jsonify({
            'message': 'AgriCare API Server',
            'version': '1.0.0',
            'endpoints': ['/api/health', '/api/status']
        })
    
    if __name__ == '__main__':
        port = int(os.getenv('PORT', 10000))
        print(f"🌾 Starting AgriCare Minimal API on port {port}")
        app.run(host='0.0.0.0', port=port, debug=False)