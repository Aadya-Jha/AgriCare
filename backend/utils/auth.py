"""
Authentication utilities for the agriculture monitoring platform
"""
import functools
from flask import request, jsonify

def token_required(f):
    """
    Decorator to require authentication token for API endpoints.
    For now, implements mock authentication for development.
    """
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        # Mock authentication - in production, implement proper JWT validation
        if not token or not token.startswith('Bearer '):
            return jsonify({
                'status': 'error',
                'message': 'Authentication token required'
            }), 401
        
        # For development, accept any token that starts with 'Bearer mock_jwt_token'
        if 'mock_jwt_token' not in token:
            return jsonify({
                'status': 'error',
                'message': 'Invalid authentication token'
            }), 401
        
        return f(*args, **kwargs)
    
    return decorated
