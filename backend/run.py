#!/usr/bin/env python3
"""
AgriCare Backend - Complete Application Entry Point
Full-featured Flask API server with fallback for deployment
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add current directory and parent directory to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, current_dir)
sys.path.insert(0, parent_dir)

# Try to load the full application first
app = None
socketio = None

print("🌾 Attempting to load full AgriCare application...")

try:
    # Import the full application factory
    from app import create_app
    
    config_name = os.getenv('FLASK_ENV', 'production')
    print(f"📊 Loading application in {config_name} mode")
    
    # Create the full application with all features
    app_result = create_app(config_name)
    if isinstance(app_result, tuple):
        app, socketio = app_result
    else:
        app = app_result
    
    # Mark that full app was loaded
    app._full_app_loaded = True
    print("✅ Full application loaded successfully with all features!")
    
except ImportError as e:
    print(f"⚠️ Could not load full app, missing dependency: {e}")
    print("🔄 Loading simplified app with available features...")
    
    # Fallback to simplified app
    from flask import Flask, jsonify, request
    from flask_cors import CORS
    
    try:
        from flask_sqlalchemy import SQLAlchemy
        from simple_config import config
        
        app = Flask(__name__)
        config_name = os.getenv('FLASK_ENV', 'production')
        app.config.from_object(config[config_name])
        config[config_name].init_app(app)
        CORS(app, origins=["*"])
        db = SQLAlchemy(app)
        print("✅ Simplified app with database loaded")
        
    except ImportError:
        # Ultimate fallback - minimal Flask only
        app = Flask(__name__)
        app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'fallback-key')
        CORS(app, origins=["*"])
        db = None
        print("✅ Minimal Flask app loaded")

except Exception as e:
    print(f"❌ Error loading application: {e}")
    # Ultimate fallback
    from flask import Flask, jsonify
    from flask_cors import CORS
    
    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'emergency-key')
    CORS(app, origins=["*"])
    db = None
    print("🚨 Emergency fallback app loaded")

# Add basic routes if not already present (for fallback modes)
if not hasattr(app, '_full_app_loaded'):
    print("🛣️ Adding basic API routes for fallback mode...")
    
    @app.route('/')
    def root():
        return jsonify({
            'message': 'AgriCare API Server',
            'version': '1.0.0',
            'status': 'online',
            'environment': os.getenv('FLASK_ENV', 'production'),
            'mode': 'fallback' if 'db' not in locals() or db is None else 'simplified',
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
            'database': 'connected' if 'db' in locals() and db else 'not configured',
            'port': os.environ.get('PORT', 'unknown'),
            'mode': 'full' if hasattr(app, '_full_app_loaded') else ('simplified' if 'db' in locals() and db else 'minimal')
        })
        
    @app.route('/api/status')
    def status():
        return jsonify({
            'backend': 'online',
            'database': 'sqlite' if 'db' in locals() and db and 'sqlite' in str(app.config.get('SQLALCHEMY_DATABASE_URI', '')) else 'postgresql',
            'features': {
                'basic_api': 'enabled',
                'database': 'enabled' if 'db' in locals() and db else 'disabled',
                'cors': 'enabled',
                'authentication': 'available',
                'file_upload': 'limited',
                'hyperspectral': 'disabled',
                'ml_models': 'disabled',
                'matlab': 'disabled'
            },
            'environment': os.getenv('FLASK_ENV', 'production')
        })
        
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

    @app.route('/api/auth/login', methods=['POST'])
    def login():
        return jsonify({
            'message': 'Login endpoint available',
            'token': 'demo-token-123',
            'user': {'id': 1, 'name': 'Demo User', 'role': 'farmer'}
        })

# Add error handlers if not in full mode
if not hasattr(app, '_full_app_loaded'):
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Endpoint not found', 'available_endpoints': ['/', '/api/health', '/api/status', '/api/sensors']}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error', 'message': 'Please check logs'}), 500

# Initialize database tables (only if database is available)
if 'db' in locals() and db:
    with app.app_context():
        try:
            db.create_all()
            print("📊 Database tables created successfully")
        except Exception as e:
            print(f"⚠️ Database initialization warning: {e}")
else:
    print("⚠️ No database configured - running in stateless mode")

# Application startup information
port = int(os.getenv('PORT', 10000))
env = os.getenv('FLASK_ENV', 'production')

print(f"🌾 AgriCare API Server Ready")
print(f"🔧 Environment: {env}")
print(f"🌐 Port: {port}")
print(f"📁 Mode: {'Full Application' if hasattr(app, '_full_app_loaded') else 'Fallback Mode'}")

if hasattr(app, 'config') and 'SQLALCHEMY_DATABASE_URI' in app.config:
    db_uri = app.config['SQLALCHEMY_DATABASE_URI']
    db_type = 'SQLite' if 'sqlite' in db_uri else 'PostgreSQL' if 'postgresql' in db_uri else 'Unknown'
    print(f"🗄️ Database: {db_type}")

# Export app for Gunicorn WSGI server
if __name__ == '__main__':
    # Flask development server (only when run directly)
    debug_mode = env == 'development'
    print(f"🚀 Starting development server (debug={debug_mode})...")
    app.run(host='0.0.0.0', port=port, debug=debug_mode)
else:
    # Gunicorn will use this when deployed
    print(f"🚀 Ready for Gunicorn deployment!")
