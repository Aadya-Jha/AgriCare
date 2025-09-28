"""
Simplified Flask Configuration for Render Deployment
"""

import os
from datetime import timedelta

class Config:
    """Base configuration for lightweight deployment"""
    
    # Essential Flask settings
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'render-secret-key-2024'
    DEBUG = False
    
    # JWT Configuration (simplified)
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or SECRET_KEY
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    
    # Database - use SQLite for free tier (no PostgreSQL needed)
    DATABASE_URL = os.environ.get('DATABASE_URL')
    if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    
    # Default to SQLite if no DB URL provided
    SQLALCHEMY_DATABASE_URI = DATABASE_URL or 'sqlite:///agricare.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # CORS - allow Render domains
    CORS_ORIGINS = ["*"]  # Open for deployment, restrict later
    
    # File uploads (minimal)
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50MB max
    
    # Disable heavy features for deployment
    MATLAB_ENGINE_ENABLED = False
    DISABLE_HYPERSPECTRAL = True
    DISABLE_ML_MODELS = True
    
    # Basic paths
    UPLOAD_FOLDER = './uploads'
    
    @staticmethod
    def init_app(app):
        """Initialize app with minimal setup"""
        os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
        print("📁 Created upload directory")


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True


class ProductionConfig(Config):
    """Production configuration for Render"""
    DEBUG = False
    
    # Production security
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    
    @classmethod  
    def init_app(cls, app):
        Config.init_app(app)
        print("🚀 Production mode initialized")


# Configuration selector
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': ProductionConfig
}