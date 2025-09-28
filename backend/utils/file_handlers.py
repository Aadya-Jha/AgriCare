"""
File handling utilities for the agriculture monitoring platform.
Handles file uploads, validation, and storage for image processing.
"""

import os
import uuid
from pathlib import Path
from werkzeug.utils import secure_filename
from flask import current_app
import logging

logger = logging.getLogger(__name__)

# Allowed image file extensions
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'tiff', 'tif', 'bmp'}

def allowed_file(filename):
    """Check if file has an allowed extension."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_upload_directory(subfolder='uploads'):
    """Get or create the upload directory."""
    # Get upload directory from config or use default
    if current_app:
        upload_dir = current_app.config.get('UPLOAD_FOLDER', 'uploads')
    else:
        upload_dir = 'uploads'
    
    # Create full path with subfolder
    full_path = Path(upload_dir) / subfolder
    
    # Create directory if it doesn't exist
    full_path.mkdir(parents=True, exist_ok=True)
    
    return str(full_path)

def save_upload_file(file, subfolder='uploads'):
    """
    Save uploaded file to the designated directory.
    
    Args:
        file: Werkzeug FileStorage object
        subfolder: Subdirectory within uploads folder
        
    Returns:
        str: Path to saved file
        
    Raises:
        ValueError: If file is invalid
        IOError: If file cannot be saved
    """
    if not file or not file.filename:
        raise ValueError("No file provided or file has no name")
    
    if not allowed_file(file.filename):
        raise ValueError(f"File type not allowed. Supported: {', '.join(ALLOWED_EXTENSIONS)}")
    
    # Secure the filename
    original_filename = secure_filename(file.filename)
    
    # Generate unique filename to avoid conflicts
    file_extension = original_filename.rsplit('.', 1)[1].lower()
    unique_filename = f"{uuid.uuid4().hex}.{file_extension}"
    
    # Get upload directory
    upload_dir = get_upload_directory(subfolder)
    
    # Full path for saved file
    file_path = Path(upload_dir) / unique_filename
    
    try:
        # Save the file
        file.save(str(file_path))
        logger.info(f"File saved: {file_path}")
        
        return str(file_path)
        
    except Exception as e:
        logger.error(f"Error saving file: {e}")
        raise IOError(f"Failed to save file: {str(e)}")

def cleanup_temp_files(directory, max_age_hours=24):
    """
    Clean up temporary files older than specified age.
    
    Args:
        directory: Directory to clean
        max_age_hours: Maximum age of files to keep (in hours)
    """
    import time
    
    try:
        directory_path = Path(directory)
        if not directory_path.exists():
            return
        
        current_time = time.time()
        max_age_seconds = max_age_hours * 3600
        
        for file_path in directory_path.iterdir():
            if file_path.is_file():
                file_age = current_time - file_path.stat().st_mtime
                if file_age > max_age_seconds:
                    try:
                        file_path.unlink()
                        logger.info(f"Cleaned up old file: {file_path}")
                    except Exception as e:
                        logger.error(f"Error cleaning up file {file_path}: {e}")
                        
    except Exception as e:
        logger.error(f"Error during cleanup: {e}")

def get_file_info(file_path):
    """
    Get information about a file.
    
    Args:
        file_path: Path to the file
        
    Returns:
        dict: File information
    """
    try:
        file_path = Path(file_path)
        
        if not file_path.exists():
            return {'error': 'File not found'}
        
        stat = file_path.stat()
        
        return {
            'filename': file_path.name,
            'size_bytes': stat.st_size,
            'size_mb': round(stat.st_size / (1024 * 1024), 2),
            'modified_time': stat.st_mtime,
            'extension': file_path.suffix.lower(),
            'exists': True
        }
        
    except Exception as e:
        logger.error(f"Error getting file info: {e}")
        return {'error': str(e)}

def validate_image_file(file_path):
    """
    Validate that a file is a valid image.
    
    Args:
        file_path: Path to the file
        
    Returns:
        dict: Validation results
    """
    try:
        from PIL import Image
        
        file_path = Path(file_path)
        
        if not file_path.exists():
            return {'valid': False, 'error': 'File not found'}
        
        if not allowed_file(file_path.name):
            return {'valid': False, 'error': 'File type not allowed'}
        
        # Try to open and verify the image
        with Image.open(file_path) as img:
            img.verify()  # Verify it's a valid image
            
            # Reopen to get details (verify closes the file)
            with Image.open(file_path) as img:
                return {
                    'valid': True,
                    'format': img.format,
                    'mode': img.mode,
                    'size': img.size,
                    'width': img.width,
                    'height': img.height
                }
                
    except ImportError:
        # PIL not available, do basic validation
        return {
            'valid': allowed_file(file_path.name),
            'error': 'PIL not available for detailed validation' if not allowed_file(file_path.name) else None
        }
    except Exception as e:
        return {'valid': False, 'error': str(e)}
