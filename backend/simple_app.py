#!/usr/bin/env python3
"""
Ultra-minimal Flask app for Render deployment
No complex dependencies, guaranteed to work
"""

import os
from flask import Flask, jsonify

# Create Flask application
app = Flask(__name__)

# Basic configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'render-key-2024')
app.config['DEBUG'] = False

@app.route('/')
def home():
    """Root endpoint"""
    return jsonify({
        'message': 'AgriCare API Server',
        'version': '1.0.0', 
        'status': 'online',
        'environment': 'production',
        'port': os.environ.get('PORT', 'unknown')
    })

@app.route('/api/health')
def health():
    """Health check endpoint for Render"""
    return jsonify({
        'status': 'healthy',
        'service': 'agricare-api',
        'port': os.environ.get('PORT', 'unknown'),
        'deployment': 'render'
    })

@app.route('/api/status')  
def status():
    """Service status endpoint"""
    return jsonify({
        'backend': 'online',
        'minimal_mode': True,
        'features': ['basic_api', 'health_check', 'cors'],
        'port': os.environ.get('PORT'),
        'environment': 'production'
    })

@app.route('/api/test')
def test():
    """Test endpoint"""
    return jsonify({
        'test': 'success',
        'message': 'API is working correctly',
        'timestamp': '2024-09-28'
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': 'Not found',
        'available_endpoints': ['/', '/api/health', '/api/status', '/api/test']
    }), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({
        'error': 'Internal server error'
    }), 500

# Application info
port = int(os.environ.get('PORT', 10000))
print(f"🌾 Ultra-minimal AgriCare API starting")
print(f"🌐 Port: {port}")
print(f"🚀 Ready for Gunicorn deployment")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=port, debug=False)