# Agriculture Monitoring Platform - API Documentation

## Overview

The consolidated Agriculture Monitoring Platform provides a comprehensive backend API for agricultural monitoring, crop analysis, and recommendation systems. All features are integrated into a single server running on **port 3001**.

**Base URL:** `http://localhost:3001/api`

---

## 🌟 Main Features

1. **Dashboard & Real-time Monitoring** - Sensor data, trends, alerts
2. **Karnataka Crop Recommendations** - Location-specific crop suggestions
3. **Agricultural Image Analysis** - Disease detection and health assessment
4. **Hyperspectral Analysis** - Advanced spectral image processing
5. **Growth Planning** - Detailed crop cultivation plans

---

## 📊 Dashboard & Monitoring APIs

### General Health Check
```
GET /api/health
```
Returns overall system health and available features.

**Response:**
```json
{
  "status": "healthy",
  "service": "agriculture-monitoring-platform-consolidated",
  "version": "4.0-consolidated",
  "features": [
    "Dashboard with Real-time Data",
    "Karnataka Crop Recommendations",
    "Agricultural Image Analysis and Disease Detection",
    "RGB to Hyperspectral Conversion",
    "Crop Health Classification",
    "Growth Planning and Investment Analysis"
  ]
}
```

### Dashboard Summary
```
GET /api/dashboard/summary
```
Get real-time dashboard data including crop health, soil conditions, and weather.

**Response:**
```json
{
  "crop_health": {
    "status": "Good",
    "ndvi": 0.672,
    "confidence": 0.87
  },
  "soil_moisture": {
    "value": 62.5,
    "unit": "%",
    "status": "optimal"
  },
  "pest_risk": {
    "level": "low",
    "confidence": 0.78,
    "detected_pests": []
  },
  "irrigation_advice": {
    "recommendation": "Maintain",
    "status": "good",
    "reason": "Based on soil moisture and weather conditions"
  }
}
```

### Field Trends
```
GET /api/trends/<field_id>
```
Get historical sensor data trends for a specific field.

### Alerts
```
GET /api/alerts
```
Get current alerts and notifications.

---

## 🌾 Karnataka Crop Recommendation APIs

### Available Locations
```
GET /api/karnataka/locations
```
Get list of supported Karnataka locations with details.

**Supported Locations:**
- Bangalore, Mysore, Hubli, Mangalore, Belgaum, Gulbarga, Shimoga, Hassan

### Weather Data
```
GET /api/karnataka/weather/<location>
```
Get current weather conditions for a specific Karnataka location.

**Example:** `GET /api/karnataka/weather/Bangalore`

### Crop Recommendations
```
GET /api/karnataka/crop-recommendations/<location>?count=3
```
Get crop recommendations based on location, weather, and soil conditions.

**Response:**
```json
{
  "status": "success",
  "location": "Bangalore",
  "current_season": "Kharif",
  "recommended_crops": [
    {
      "crop": "Rice",
      "suitability_score": 0.847,
      "suitability_grade": "Excellent",
      "factors": ["Temperature optimal (28°C)", "Soil type suitable"],
      "crop_details": {
        "water_requirement": "High",
        "growth_duration": 120,
        "yield_per_acre": "25-30 quintals",
        "investment": "₹25,000-30,000 per acre"
      }
    }
  ]
}
```

### Comprehensive Analysis
```
GET /api/karnataka/comprehensive-analysis/<location>
```
Get detailed analysis including recommendations, growth plans, and seasonal advice.

### Crop Growth Plan
```
GET /api/crop/growth-plan/<crop_name>
```
Get detailed cultivation plan for a specific crop.

**Example:** `GET /api/crop/growth-plan/Rice`

### Crop Database
```
GET /api/crop/database
```
Get complete crop database with all supported crops and their details.

---

## 📸 Agricultural Image Analysis APIs

### Service Health Check
```
GET /api/image-analysis/health
```
Check image analysis service status and capabilities.

**Response:**
```json
{
  "status": "healthy",
  "service": "agricultural-image-analysis",
  "model_available": true,
  "supported_formats": ["jpg", "jpeg", "png", "bmp", "tiff"],
  "max_file_size": "16MB",
  "supported_crops": ["Rice", "Wheat", "Maize", "Cotton", "Tomato", "..."],
  "detectable_conditions": ["Healthy", "Bacterial_Blight", "Brown_Spot", "..."]
}
```

### Analyze Single Image
```
POST /api/image-analysis/analyze
```
Upload and analyze a single crop image for disease detection and health assessment.

**Request:**
- **Content-Type:** `multipart/form-data`
- **Fields:**
  - `image` (file): Image file to analyze
  - `crop_type` (optional): Specific crop type ("Rice", "Wheat", etc. or "General")

**Response:**
```json
{
  "status": "success",
  "crop_type": "Rice",
  "analysis_summary": {
    "primary_detection": {
      "disease": "Bacterial_Blight",
      "confidence": 0.847,
      "description": "Bacterial infection causing leaf spots and blight symptoms",
      "recommended_actions": ["Apply copper-based bactericide", "Improve drainage"]
    },
    "overall_health_score": 0.653,
    "health_status": "Good",
    "confidence": 0.847
  },
  "recommendations": {
    "immediate_actions": ["Apply copper-based bactericide", "Improve drainage"],
    "monitoring_advice": ["Continue regular monitoring", "Take photos weekly"],
    "preventive_measures": ["Maintain proper spacing", "Control moisture levels"]
  },
  "image_features": {
    "color_distribution": {
      "green_percentage": 67.8,
      "brown_percentage": 12.3
    },
    "texture_analysis": {
      "smoothness": 0.645,
      "roughness": 0.355
    }
  }
}
```

### Batch Image Analysis
```
POST /api/image-analysis/batch-analyze
```
Analyze multiple images simultaneously (max 10 images).

**Request:**
- **Content-Type:** `multipart/form-data`
- **Fields:**
  - `images` (files): Multiple image files
  - `crop_type` (optional): Crop type for all images

### Supported Crop Types
```
GET /api/image-analysis/crop-types
```
Get list of supported crops and detectable diseases.

### Disease Information
```
GET /api/image-analysis/disease-info/<disease_name>
```
Get detailed information about a specific disease.

**Example:** `GET /api/image-analysis/disease-info/Bacterial_Blight`

### Demo Endpoint
```
GET /api/image-analysis/demo
```
Get demo information and sample analysis results.

---

## 🔬 Hyperspectral Analysis APIs

### Service Health Check
```
GET /api/hyperspectral/health
```
Check hyperspectral analysis capabilities.

### Supported Locations
```
GET /api/hyperspectral/locations
```
Get list of supported Indian locations for hyperspectral analysis.

### Process Hyperspectral Image
```
POST /api/hyperspectral/process-image
```
Convert RGB image to hyperspectral and analyze crop health.

**Request:**
- **Content-Type:** `multipart/form-data`
- **Fields:**
  - `image` (file): RGB image to convert and analyze

**Response:**
```json
{
  "status": "success",
  "conversion_method": "RGB to 424-band hyperspectral simulation",
  "health_analysis": {
    "overall_health_score": 0.847,
    "dominant_health_status": "Excellent",
    "confidence": 0.823
  },
  "vegetation_indices": {
    "ndvi": {"mean": 0.672, "std": 0.089},
    "savi": {"mean": 0.534, "std": 0.076},
    "evi": {"mean": 0.445, "std": 0.062}
  },
  "hyperspectral_bands": 424,
  "wavelength_range": [381.45, 2500.12]
}
```

### Location Predictions
```
GET /api/hyperspectral/predictions
```
Get health predictions for all supported locations.

### Specific Location Analysis
```
GET /api/hyperspectral/predict-location/<location>
```
Get health prediction for a specific location.

---

## 🚀 Getting Started

### 1. Start the Server
```bash
cd /path/to/agri-monitoring-platform
python consolidated_server.py
```

### 2. Test the API
```bash
# Test with the provided test script
python test_image_analysis.py

# Or test individual endpoints
curl http://localhost:3001/api/health
curl http://localhost:3001/api/image-analysis/health
curl http://localhost:3001/api/karnataka/locations
```

### 3. Upload and Analyze Images
```bash
# Using curl to analyze an image
curl -X POST \
  -F "image=@/path/to/crop_image.jpg" \
  -F "crop_type=Rice" \
  http://localhost:3001/api/image-analysis/analyze
```

---

## 📋 Supported Features Summary

### Crop Types Supported
- Rice, Wheat, Maize, Cotton, Sugarcane
- Tomato, Potato, Onion, Groundnut, Ragi
- Soybean, Coconut, and General analysis

### Detectable Conditions
- **Healthy** - Normal crop condition
- **Bacterial_Blight** - Bacterial infection
- **Brown_Spot** - Fungal disease
- **Leaf_Blast** - Fungal leaf disease
- **Tungro** - Viral disease
- **Pest_Damage** - Insect damage
- **Nutrient_Deficiency** - Nutritional issues
- **Water_Stress** - Irrigation problems

### Karnataka Locations
- Bangalore, Mysore, Hubli, Mangalore
- Belgaum, Gulbarga, Shimoga, Hassan

### Analysis Capabilities
- Disease detection and classification
- Health score calculation
- Treatment recommendations
- Batch processing (up to 10 images)
- Feature extraction (color, texture, shape)
- Hyperspectral conversion (424 bands)
- Vegetation indices (NDVI, SAVI, EVI, GNDVI)

---

## 🛠️ Error Handling

All endpoints return consistent error responses:

```json
{
  "status": "error",
  "message": "Descriptive error message",
  "timestamp": "2024-01-01T12:00:00"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (missing parameters, invalid file)
- `404` - Not Found (invalid location/crop/disease)
- `500` - Internal Server Error

---

## 💡 Usage Examples

### Frontend Integration
```javascript
// Analyze crop image
const formData = new FormData();
formData.append('image', imageFile);
formData.append('crop_type', 'Rice');

fetch('http://localhost:3001/api/image-analysis/analyze', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => {
  console.log('Analysis result:', data);
});

// Get crop recommendations
fetch('http://localhost:3001/api/karnataka/crop-recommendations/Bangalore')
.then(response => response.json())
.then(data => {
  console.log('Recommendations:', data.recommended_crops);
});
```

### Python Integration
```python
import requests

# Analyze image
with open('crop_image.jpg', 'rb') as f:
    files = {'image': f}
    data = {'crop_type': 'Rice'}
    response = requests.post(
        'http://localhost:3001/api/image-analysis/analyze',
        files=files,
        data=data
    )
    result = response.json()
    print(f"Detection: {result['analysis_summary']['primary_detection']['disease']}")

# Get weather data
response = requests.get('http://localhost:3001/api/karnataka/weather/Bangalore')
weather = response.json()
print(f"Temperature: {weather['weather']['temperature']}°C")
```

---

## 🔧 Development Notes

- The server runs in **simulation mode** for demonstration purposes
- Real ML models can be integrated by replacing the simulation functions
- Database is SQLite (`agriculture_consolidated.db`)
- Maximum file upload size: 16MB
- All timestamps are in ISO format
- CORS is enabled for `http://localhost:3000` (frontend)

---

## 📞 Support

For issues or questions about the API:
1. Check server logs for detailed error information
2. Use the test script to validate functionality
3. Review this documentation for proper usage patterns
4. Ensure all dependencies are installed correctly

The platform is designed to be production-ready with proper error handling, logging, and comprehensive feature coverage for agricultural monitoring and analysis.
