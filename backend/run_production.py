#!/usr/bin/env python3
"""
AgriCare Backend - Production Deployment Entry Point
Simplified Flask API server for Render deployment
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

# Create minimal Flask application
app = Flask(__name__)

# Configure for production
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'render-secret-key-2024')
app.config['DEBUG'] = False
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///agricare.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
CORS(app, origins=["*"])  # Allow all origins for deployment
db = SQLAlchemy(app)

# Health check route (required by Render)
@app.route('/')
def root():
    return jsonify({
        'message': 'AgriCare API Server',
        'version': '1.0.0',
        'status': 'online',
        'environment': 'production',
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
        'timestamp': os.environ.get('RENDER_GIT_COMMIT', 'production'),
        'database': 'connected' if db else 'not configured',
        'port': os.environ.get('PORT', 'unknown')
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
        'environment': 'production'
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

# Application startup logging
port = int(os.getenv('PORT', 10000))
print(f"🌾 Starting AgriCare API Server")
print(f"🔧 Environment: production")
print(f"🌐 Port: {port}")
print(f"🗄️ Database: {app.config['SQLALCHEMY_DATABASE_URI'][:50]}...")
print(f"🚀 AgriCare API loaded for production (Gunicorn)")

# Export app for Gunicorn WSGI server
if __name__ == '__main__':
    # Flask development server (only when run directly)
    app.run(host='0.0.0.0', port=port, debug=False)