"""
WebSocket Routes for Real-time Data Streaming
Handles real-time sensor data updates and live monitoring
"""

from flask_socketio import emit, join_room, leave_room
from flask import request
from backend.models.agriculture_models import Field, SensorData, CropPrediction
from backend.app import db, socketio
import json
from datetime import datetime, timedelta
import random
import threading
import time

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    print(f'Client connected: {request.sid}')
    emit('status', {'message': 'Connected to real-time monitoring'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    print(f'Client disconnected: {request.sid}')

@socketio.on('subscribe_field')
def handle_subscribe_field(data):
    """Subscribe to real-time updates for a specific field"""
    field_id = data.get('field_id')
    if field_id:
        room = f'field_{field_id}'
        join_room(room)
        print(f'Client {request.sid} subscribed to field {field_id}')
        emit('subscription_status', {
            'field_id': field_id, 
            'status': 'subscribed',
            'message': f'Subscribed to real-time updates for field {field_id}'
        })

@socketio.on('unsubscribe_field')
def handle_unsubscribe_field(data):
    """Unsubscribe from real-time updates for a specific field"""
    field_id = data.get('field_id')
    if field_id:
        room = f'field_{field_id}'
        leave_room(room)
        print(f'Client {request.sid} unsubscribed from field {field_id}')
        emit('subscription_status', {
            'field_id': field_id, 
            'status': 'unsubscribed',
            'message': f'Unsubscribed from field {field_id}'
        })

@socketio.on('get_live_sensor_data')
def handle_get_live_sensor_data(data):
    """Get current live sensor data for a field"""
    field_id = data.get('field_id', 1)
    
    try:
        # Get latest sensor readings from the last hour
        cutoff_time = datetime.utcnow() - timedelta(hours=1)
        latest_readings = SensorData.query.filter(
            SensorData.field_id == field_id,
            SensorData.timestamp >= cutoff_time
        ).order_by(SensorData.timestamp.desc()).limit(50).all()
        
        # Group by sensor type
        sensor_data = {}
        for reading in latest_readings:
            sensor_type = reading.sensor_type
            if sensor_type not in sensor_data:
                sensor_data[sensor_type] = []
            sensor_data[sensor_type].append(reading.to_dict())
        
        # Get latest predictions
        recent_predictions = CropPrediction.query.filter(
            CropPrediction.field_id == field_id,
            CropPrediction.created_at >= cutoff_time
        ).order_by(CropPrediction.created_at.desc()).limit(5).all()
        
        emit('live_sensor_data', {
            'field_id': field_id,
            'timestamp': datetime.utcnow().isoformat(),
            'sensor_data': sensor_data,
            'predictions': [pred.to_dict() for pred in recent_predictions]
        })
        
    except Exception as e:
        emit('error', {'message': f'Error fetching live data: {str(e)}'})

def simulate_real_time_data():
    """Background task to simulate real-time sensor data generation"""
    if not socketio:
        return
    
    from backend.app import create_app
    app, _ = create_app()
        
    while True:
        try:
            with app.app_context():
                # Get all active fields
                fields = Field.query.all()
            
                for field in fields:
                    # Generate new sensor readings
                    current_time = datetime.utcnow()
                    
                    # Soil moisture reading
                    soil_moisture_value = round(random.uniform(15, 35), 1)
                    soil_moisture = SensorData(
                        field_id=field.id,
                        sensor_type='soil_moisture',
                        value=soil_moisture_value,
                        unit='%',
                        location_lat=40.7128 + random.uniform(-0.001, 0.001),
                        location_lng=-74.0055 + random.uniform(-0.001, 0.001),
                        device_id=f'soil_sensor_live',
                        timestamp=current_time
                    )
                    db.session.add(soil_moisture)
                    
                    # Temperature reading
                    temp_value = round(random.uniform(18, 32), 1)
                    temperature = SensorData(
                        field_id=field.id,
                        sensor_type='air_temperature',
                        value=temp_value,
                        unit='°C',
                        location_lat=40.7128 + random.uniform(-0.001, 0.001),
                        location_lng=-74.0055 + random.uniform(-0.001, 0.001),
                        device_id=f'temp_sensor_live',
                        timestamp=current_time
                    )
                    db.session.add(temperature)
                    
                    # Humidity reading
                    humidity_value = round(random.uniform(45, 85), 1)
                    humidity = SensorData(
                        field_id=field.id,
                        sensor_type='humidity',
                        value=humidity_value,
                        unit='%',
                        location_lat=40.7128 + random.uniform(-0.001, 0.001),
                        location_lng=-74.0055 + random.uniform(-0.001, 0.001),
                        device_id=f'humidity_sensor_live',
                        timestamp=current_time
                    )
                    db.session.add(humidity)
                    
                    db.session.commit()
                    
                    # Emit real-time update to subscribed clients
                    room = f'field_{field.id}'
                    socketio.emit('real_time_update', {
                        'field_id': field.id,
                        'timestamp': current_time.isoformat(),
                        'updates': [
                            {
                                'sensor_type': 'soil_moisture',
                                'value': soil_moisture_value,
                                'unit': '%',
                                'status': 'normal' if 20 <= soil_moisture_value <= 30 else 'warning'
                            },
                            {
                                'sensor_type': 'air_temperature',
                                'value': temp_value,
                                'unit': '°C',
                                'status': 'normal' if 20 <= temp_value <= 28 else 'warning'
                            },
                            {
                                'sensor_type': 'humidity',
                                'value': humidity_value,
                                'unit': '%',
                                'status': 'normal' if 50 <= humidity_value <= 80 else 'warning'
                            }
                        ]
                    }, room=room)
                    
                    # Generate alerts for critical values
                    alerts = []
                    if soil_moisture_value < 15:
                        alerts.append({
                            'type': 'critical',
                            'message': f'Critical soil moisture level: {soil_moisture_value}%',
                            'field_id': field.id,
                            'timestamp': current_time.isoformat()
                        })
                    elif soil_moisture_value < 18:
                        alerts.append({
                            'type': 'warning',
                            'message': f'Low soil moisture level: {soil_moisture_value}%',
                            'field_id': field.id,
                            'timestamp': current_time.isoformat()
                        })
                    
                    if temp_value > 30:
                        alerts.append({
                            'type': 'warning',
                            'message': f'High temperature detected: {temp_value}°C',
                            'field_id': field.id,
                            'timestamp': current_time.isoformat()
                        })
                    
                    if alerts:
                        socketio.emit('live_alerts', {
                            'field_id': field.id,
                            'alerts': alerts
                        }, room=room)
                    
                    print(f"Generated real-time data for field {field.id}")
            
            # Wait 30 seconds before next update
            time.sleep(30)
            
        except Exception as e:
            print(f"Error in real-time data simulation: {e}")
            time.sleep(30)

# Global flag to prevent multiple simulation threads
_simulation_started = False

def start_real_time_simulation():
    """Start the real-time data simulation in a background thread"""
    global _simulation_started
    if _simulation_started:
        return
    
    _simulation_started = True
    thread = threading.Thread(target=simulate_real_time_data, daemon=True)
    thread.start()
    print("Real-time sensor data simulation started")

# WebSocket event handlers for additional functionality
@socketio.on('request_field_summary')
def handle_field_summary(data):
    """Provide real-time field summary"""
    field_id = data.get('field_id', 1)
    
    try:
        field = Field.query.get(field_id)
        if not field:
            emit('error', {'message': 'Field not found'})
            return
        
        # Get latest sensor averages from last hour
        cutoff_time = datetime.utcnow() - timedelta(hours=1)
        
        avg_soil_moisture = db.session.query(db.func.avg(SensorData.value)).filter(
            SensorData.field_id == field_id,
            SensorData.sensor_type == 'soil_moisture',
            SensorData.timestamp >= cutoff_time
        ).scalar() or 0
        
        avg_temperature = db.session.query(db.func.avg(SensorData.value)).filter(
            SensorData.field_id == field_id,
            SensorData.sensor_type == 'air_temperature',
            SensorData.timestamp >= cutoff_time
        ).scalar() or 0
        
        avg_humidity = db.session.query(db.func.avg(SensorData.value)).filter(
            SensorData.field_id == field_id,
            SensorData.sensor_type == 'humidity',
            SensorData.timestamp >= cutoff_time
        ).scalar() or 0
        
        # Calculate field health score
        health_score = calculate_field_health_score(avg_soil_moisture, avg_temperature, avg_humidity)
        
        emit('field_summary', {
            'field_id': field_id,
            'field_name': field.name,
            'crop_type': field.crop_type,
            'area_hectares': field.area_hectares,
            'current_conditions': {
                'soil_moisture': round(avg_soil_moisture, 1),
                'temperature': round(avg_temperature, 1),
                'humidity': round(avg_humidity, 1)
            },
            'health_score': health_score,
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        emit('error', {'message': f'Error generating field summary: {str(e)}'})

def calculate_field_health_score(soil_moisture, temperature, humidity):
    """Calculate an overall field health score based on sensor data"""
    score = 100
    
    # Soil moisture scoring (optimal range: 20-30%)
    if soil_moisture < 15 or soil_moisture > 35:
        score -= 30
    elif soil_moisture < 18 or soil_moisture > 32:
        score -= 15
    
    # Temperature scoring (optimal range: 20-28°C)
    if temperature < 15 or temperature > 35:
        score -= 25
    elif temperature < 18 or temperature > 30:
        score -= 10
    
    # Humidity scoring (optimal range: 50-80%)
    if humidity < 40 or humidity > 90:
        score -= 20
    elif humidity < 45 or humidity > 85:
        score -= 10
    
    return max(0, min(100, score))
