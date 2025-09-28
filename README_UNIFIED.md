# 🌾 Unified Agriculture Monitoring Platform

## 🎉 **ALL-IN-ONE SOLUTION**

This unified platform combines **hyperspectral image analysis**, **Karnataka crop recommendations**, and **real-time dashboard monitoring** into a single, powerful agriculture monitoring system.

## 🚀 **Quick Start**

### **Option 1: Automated Startup (Recommended)**
```bash
# Double-click this file or run in command prompt
start-unified-platform.bat
```

### **Option 2: Manual Startup**
```bash
# Terminal 1: Start Backend
python unified_server.py

# Terminal 2: Start Frontend  
cd frontend
npm start
```

### **Access the Application**
- 🌐 **Frontend**: http://localhost:3000
- 📊 **Backend API**: http://localhost:3001
- 🧭 **Health Check**: http://localhost:3001/api/health

## ✨ **Key Features**

### 🌾 **Karnataka Crop Recommendation System**
- **Real-time weather integration** for 8 Karnataka locations
- **AI-powered suitability scoring** based on temperature, season, soil, and humidity
- **Detailed growth plans** with stage-wise activities and timelines
- **Investment analysis** with cost estimates and yield predictions
- **Seasonal farming advice** tailored to current agricultural calendar

### 🔬 **Hyperspectral Image Analysis**
- **RGB to 424-band hyperspectral conversion** using deep learning
- **Crop health classification** with confidence scores
- **Vegetation indices calculation** (NDVI, SAVI, EVI, GNDVI)
- **Real-time image processing** and analysis
- **Spatial health mapping** with pixel-level analysis

### 📊 **Real-time Dashboard**
- **Live sensor data monitoring** (soil moisture, temperature, humidity)
- **Crop health predictions** with AI-powered insights
- **Pest risk assessment** and detection
- **Irrigation recommendations** based on current conditions
- **Agricultural trends analysis** with historical data

## 🏙️ **Supported Karnataka Locations**

| Location | District | Zone | Soil Type |
|----------|----------|------|-----------|
| 🏙️ **Bangalore** | Bangalore Urban | Eastern Dry Zone | Red Sandy Loam |
| 🏛️ **Mysore** | Mysore | Southern Dry Zone | Red Clay Loam |
| 🌾 **Hubli** | Dharwad | Northern Transition Zone | Black Cotton Soil |
| 🏖️ **Mangalore** | Dakshina Kannada | Coastal Zone | Laterite Soil |
| 🏘️ **Belgaum** | Belgaum | Northern Dry Zone | Black Cotton Soil |
| 🌍 **Gulbarga** | Gulbarga | North Eastern Dry Zone | Black Clayey Soil |
| 🌲 **Shimoga** | Shimoga | Central Dry Zone | Red Laterite Soil |
| 🍃 **Hassan** | Hassan | Southern Transition Zone | Red Clay Loam |

## 🌱 **Crop Database (10 Crops)**

| Crop | Season(s) | Duration | Water Need | Soil Types |
|------|-----------|----------|------------|------------|
| **Rice** | Kharif, Rabi | 120 days | High | Clay, Clay Loam |
| **Ragi** | Kharif | 90 days | Low | Red Sandy Loam, Red Clay Loam |
| **Cotton** | Kharif | 180 days | Medium | Black Cotton Soil, Red Sandy Loam |
| **Sugarcane** | Year Round | 365 days | Very High | Clay Loam, Black Cotton Soil |
| **Groundnut** | Kharif, Rabi | 110 days | Medium | Red Sandy Loam, Black Cotton Soil |
| **Maize** | Kharif, Rabi | 90 days | Medium | Red Sandy Loam, Black Cotton Soil |
| **Soybean** | Kharif | 95 days | Medium | Black Cotton Soil, Red Clay Loam |
| **Tomato** | Rabi, Summer | 75 days | High | Red Sandy Loam, Clay Loam |
| **Onion** | Rabi | 120 days | Medium | Red Sandy Loam, Black Cotton Soil |
| **Coconut** | Year Round | 7 years | High | Laterite Soil, Clay Loam |

## 🛠️ **API Endpoints**

### **🏥 Health & Status**
```
GET  /api/health                           # Server health check
GET  /api/hyperspectral/health            # Hyperspectral service status
```

### **📊 Dashboard**
```
GET  /api/dashboard/summary               # Farm overview data
GET  /api/trends/{days}                   # Historical trends
```

### **🌾 Karnataka Crop Recommendations**
```
GET  /api/karnataka/locations                           # All Karnataka locations
GET  /api/karnataka/weather/{location}                  # Current weather
GET  /api/karnataka/crop-recommendations/{location}     # Crop suggestions
GET  /api/karnataka/comprehensive-analysis/{location}   # Complete analysis
GET  /api/crop/growth-plan/{crop_name}                  # Growth planning
GET  /api/crop/database                                 # Complete crop database
```

### **🔬 Hyperspectral Analysis**
```
GET  /api/hyperspectral/locations          # Supported locations
POST /api/hyperspectral/process-image      # Image analysis
GET  /api/hyperspectral/predictions        # Predictions summary
GET  /api/hyperspectral/model-info         # Model information
GET  /api/hyperspectral/predict-location/{location}  # Location prediction
```

## 🧪 **Example API Calls**

### **Get Dashboard Summary**
```bash
curl http://localhost:3001/api/dashboard/summary
```

### **Get Crop Recommendations for Bangalore**
```bash
curl http://localhost:3001/api/karnataka/crop-recommendations/Bangalore
```

### **Get Growth Plan for Rice**
```bash
curl http://localhost:3001/api/crop/growth-plan/Rice
```

### **Get Comprehensive Analysis for Mysore**
```bash
curl http://localhost:3001/api/karnataka/comprehensive-analysis/Mysore
```

### **Process Hyperspectral Image**
```bash
curl -X POST -F "image=@crop_image.jpg" http://localhost:3001/api/hyperspectral/process-image
```

## 🏗️ **Technical Architecture**

### **Backend (unified_server.py)**
- **Flask** web framework with SQLAlchemy ORM
- **SQLite** database for demo data storage
- **Flask-CORS** for cross-origin requests
- **Flask-SocketIO** for real-time communication
- **Simulated weather API** (easily replaceable with real APIs)

### **Frontend (React)**
- **React** with TypeScript
- **Custom components** for each feature
- **Responsive design** with CSS Grid/Flexbox
- **Real-time data fetching** with error handling

### **Database Schema**
```sql
Fields: id, name, crop_type, area_hectares, location
SensorData: id, field_id, sensor_type, value, unit, timestamp
CropPredictions: id, field_id, prediction_type, result, confidence, risk_level
```

## 🎯 **How to Use**

### **1. Dashboard Overview**
- View real-time farm data
- Monitor crop health, soil moisture, pest risk
- Get irrigation recommendations
- Analyze agricultural trends

### **2. Karnataka Crop Recommendations**
1. Click "Karnataka Crop Recommendations" tab
2. Select your location from the grid
3. View current weather conditions
4. Review AI-powered crop suggestions
5. Expand crops to see detailed growth plans
6. Get seasonal farming advice

### **3. Hyperspectral Image Analysis**
1. Navigate to "Image Analysis" tab
2. Upload RGB crop images (JPG, PNG, TIFF)
3. Get instant hyperspectral conversion
4. View vegetation indices and health metrics
5. Download analysis results

## 🧠 **AI Algorithms**

### **Crop Suitability Scoring**
```python
suitability_score = (
    temperature_compatibility * 0.4 +    # 40% weight
    seasonal_appropriateness * 0.3 +     # 30% weight  
    soil_compatibility * 0.2 +           # 20% weight
    humidity_match * 0.1                 # 10% weight
)
```

### **Agricultural Seasons**
- **Kharif** (June-October): Monsoon crops (Rice, Cotton, Sugarcane)
- **Rabi** (November-March): Winter crops (Wheat, Gram, Vegetables)  
- **Summer** (April-May): Heat-tolerant crops (limited cultivation)

### **Hyperspectral Processing**
- **424 spectral bands** from 381.45-2500.12nm wavelength
- **Deep learning conversion** from RGB to hyperspectral
- **Vegetation indices** calculated using spectral mathematics
- **Health classification** with confidence scoring

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Port 3001 Already in Use**
```bash
# Kill existing processes
taskkill /f /im python.exe

# Or find and kill specific PID
netstat -ano | findstr :3001
taskkill /f /pid {PID}
```

#### **Frontend Won't Start**
```bash
cd frontend
npm install
npm start
```

#### **Database Errors**
```bash
# Delete and recreate database
del agriculture.db
python unified_server.py
```

#### **API Connection Issues**
- Check if both servers are running
- Verify CORS settings allow localhost:3000
- Ensure firewall isn't blocking ports 3000/3001

### **Performance Tips**
- Use SSD for database storage
- Ensure adequate RAM (minimum 4GB recommended)
- Close unnecessary applications during image processing
- Use modern browsers (Chrome/Firefox recommended)

## 🔮 **Future Enhancements**

### **Short Term**
- [ ] Real OpenWeatherMap API integration
- [ ] Additional Karnataka districts
- [ ] More crop varieties (20+ crops)
- [ ] Market price integration

### **Medium Term**  
- [ ] Mobile app development
- [ ] Multi-language support (Kannada, Hindi)
- [ ] Satellite imagery integration
- [ ] IoT sensor connectivity

### **Long Term**
- [ ] Machine learning model training
- [ ] Drone integration for field mapping
- [ ] Blockchain for supply chain tracking
- [ ] AI-powered pest identification

## 💡 **Tips for Best Results**

### **For Crop Recommendations**
- Select locations closest to your actual farm
- Consider seasonal variations in your planning
- Cross-reference with local agricultural extension services
- Factor in market demand for recommended crops

### **For Hyperspectral Analysis**
- Upload high-quality images (minimum 1024x768)
- Capture images during mid-day for consistent lighting
- Ensure crops are clearly visible without shadows
- Use multiple images for comprehensive analysis

### **For Dashboard Monitoring**
- Check sensor readings regularly for anomalies
- Act on irrigation recommendations promptly
- Monitor pest risk levels during vulnerable seasons
- Use trend data for long-term planning

## 📞 **Support**

### **For Technical Issues**
1. Check the troubleshooting section above
2. Review server logs in the console
3. Verify all dependencies are installed
4. Test API endpoints individually

### **For Feature Requests**
- Document your specific requirements
- Consider the agricultural context
- Propose realistic implementation timelines

## 📝 **License**

This project is for educational and research purposes. Please comply with local regulations regarding agricultural data and recommendations.

---

## 🎊 **Success! Your Unified Agriculture Platform is Ready!**

🚀 **Start the platform**: Run `start-unified-platform.bat`  
🌐 **Access dashboard**: http://localhost:3000  
📊 **View API docs**: http://localhost:3001/api/health  
🌾 **Get crop recommendations**: Select Karnataka locations  
🔬 **Analyze images**: Upload crop photos for instant analysis  

**Happy Farming with AI-Powered Agriculture Monitoring!** 🌱✨
