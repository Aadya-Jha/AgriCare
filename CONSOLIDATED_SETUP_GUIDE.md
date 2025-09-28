# 🌱 Consolidated Agriculture Monitoring Platform

## ✅ **SOLUTION IMPLEMENTED**
Your agricultural monitoring platform has been **SUCCESSFULLY CONSOLIDATED** into a **single backend server**! No more multiple backends or port conflicts.

## 🚀 **Quick Start**

### Method 1: Use the Startup Script (Recommended)
1. **Double-click** `start-consolidated-platform.bat`
2. **Wait** for the backend and frontend to start
3. **Open** http://localhost:3000 in your browser

### Method 2: Manual Start
```bash
# Terminal 1 - Start Backend
python consolidated_server.py

# Terminal 2 - Start Frontend  
cd frontend
npm start
```

## 📊 **What's Included (Single Server - Port 3001)**

### ✅ **Dashboard Features**
- Real-time sensor data monitoring
- Agricultural trends and charts  
- Crop health predictions
- Pest risk assessment
- Irrigation recommendations
- Alert notifications

### ✅ **Karnataka Crop Recommendations**
- 8 Karnataka locations (Bangalore, Mysore, Hubli, etc.)
- Weather-based crop suitability scoring
- AI-powered recommendations
- 10-crop database (Rice, Cotton, Sugarcane, etc.)
- Detailed growth plans with timelines
- Investment analysis and yield predictions

### ✅ **Hyperspectral Image Analysis**
- RGB to 424-band hyperspectral conversion
- Crop health classification (Excellent/Good/Fair/Poor)
- Vegetation indices (NDVI, SAVI, EVI, GNDVI)
- Multi-location analysis (10 Indian cities)
- Real-time image processing
- Health predictions and recommendations

## 🌐 **URLs**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/api/health

## 🔗 **Key API Endpoints**

### Dashboard
```
GET /api/dashboard/summary  - Farm overview data
GET /api/trends/1          - Agricultural trends
GET /api/alerts           - Alert notifications  
```

### Karnataka Crop System
```
GET /api/karnataka/locations                           - Available locations
GET /api/karnataka/comprehensive-analysis/Bangalore    - Full crop analysis
GET /api/crop/growth-plan/Rice                        - Growth planning
GET /api/crop/database                                - Complete crop database
```

### Hyperspectral Analysis  
```
POST /api/hyperspectral/process-image              - Image analysis
GET  /api/hyperspectral/predictions               - All location predictions
GET  /api/hyperspectral/predict-location/Mumbai   - Location-specific
GET  /api/hyperspectral/model-info               - Model information
```

## 🛠️ **Troubleshooting**

### Port 3001 Already in Use
```bash
# Windows - Kill process using port 3001
netstat -ano | findstr :3001
taskkill /PID <process_id> /F
```

### Frontend Issues
```bash
cd frontend
npm install
npm start
```

### Database Issues  
```bash
# Delete database and restart
del agriculture_consolidated.db
python consolidated_server.py
```

### Connection Issues
- Check Windows Firewall settings for ports 3000 and 3001
- Ensure no antivirus is blocking the connections
- Try accessing http://127.0.0.1:3000 instead of localhost

## 📁 **Project Structure**
```
agri-monitoring-platform/
├── consolidated_server.py           # 🚀 SINGLE BACKEND SERVER
├── start-consolidated-platform.bat  # 🎯 ONE-CLICK STARTUP  
├── frontend/                        # React frontend
├── agriculture_consolidated.db       # SQLite database
└── README files and documentation
```

## ✨ **Key Improvements**

### ❌ **Before (Problems)**
- Multiple backend servers on different ports (3001, 3002)
- Complex backend switching logic
- Port conflicts and confusion
- Multiple startup commands required

### ✅ **After (Solution)**
- **Single consolidated backend** on port 3001
- **All features combined** in one server
- **No port conflicts** or switching needed
- **One-click startup** with batch script
- **Simplified architecture** and maintenance

## 🎯 **How to Use**

1. **Farm Overview Tab**
   - View real-time sensor data
   - Monitor crop health and soil moisture
   - Check alerts and notifications
   - Analyze agricultural trends

2. **Karnataka Crop Recommendations Tab**  
   - Select any of 8 Karnataka locations
   - Get weather-based crop recommendations
   - View detailed growth plans
   - Analyze investment and yield predictions

3. **Image Analysis** (via navigation menu)
   - Upload crop images for analysis
   - Get hyperspectral conversion results
   - View health classification and indices
   - Receive actionable recommendations

## 🔄 **Migration Notes**

- ✅ **Old backend files preserved** (for reference)
- ✅ **Frontend updated** to use single backend
- ✅ **Database consolidated** into one file
- ✅ **All API endpoints maintained** (same URLs)
- ✅ **Features enhanced** and combined

## 📞 **Support**

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify both services are running (backend on 3001, frontend on 3000)  
3. Check console logs for error messages
4. Restart using the batch script

---

**🎉 Congratulations! You now have a unified, single-backend agriculture monitoring platform!**
