"""
Agriculture Monitoring Platform - Flask Backend
Main application factory and configuration
"""

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
socketio = SocketIO()

def create_app(config_name='development'):
    """
    Application factory pattern for Flask app creation
    """
    app = Flask(__name__)
    
    # Configuration
    if config_name == 'production':
        app.config.from_object('config.config.ProductionConfig')
    elif config_name == 'testing':
        app.config.from_object('config.config.TestingConfig')
    else:
        app.config.from_object('config.config.DevelopmentConfig')
    
    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    socketio.init_app(app, cors_allowed_origins=["http://localhost:3000", "http://localhost:3001"])
    CORS(app, origins=["http://localhost:3000", "http://localhost:3001"])  # React dev servers
    
    # Register blueprints
    from backend.routes.sensor_routes import sensor_bp
    from backend.routes.image_routes import image_bp
    from backend.routes.prediction_routes import prediction_bp
    from backend.routes.auth_routes import auth_bp
    from backend.routes.dashboard_routes import dashboard_bp
    from backend.routes.alert_routes import alert_bp
    from backend.routes.hyperspectral_routes import hyperspectral_bp
    
    app.register_blueprint(sensor_bp, url_prefix='/api/sensors')
    app.register_blueprint(image_bp, url_prefix='/api/images')
    app.register_blueprint(prediction_bp, url_prefix='/api/predictions')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(alert_bp, url_prefix='/api/alerts')
    app.register_blueprint(hyperspectral_bp)
    
    # Register WebSocket events
    from backend.routes import websocket_routes
    
    # Create tables and initialize data
    with app.app_context():
        from backend.models.agriculture_models import init_db
        init_db()
        
        # Start real-time data simulation
        from backend.routes.websocket_routes import start_real_time_simulation
        start_real_time_simulation()
    
    @app.route('/api/health')
    def health_check():
        """Health check endpoint"""
        return {'status': 'healthy', 'service': 'agriculture-monitoring-platform'}
    
    return app, socketio
