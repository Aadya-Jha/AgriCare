"""
Agriculture Monitoring Platform
Flask Application Entry Point
"""

import sys
import os

# Add the parent directory to sys.path to allow imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app import create_app

# Create Flask application instance with SocketIO
app, socketio = create_app(os.getenv('FLASK_ENV', 'development'))

if __name__ == '__main__':
    # Run the development server with SocketIO support
    debug_mode = os.getenv('FLASK_ENV', 'development') == 'development'
    socketio.run(
        app,
        host='0.0.0.0',
        port=int(os.getenv('PORT', 5000)),
        debug=debug_mode
    )
