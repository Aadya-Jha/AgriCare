# 🚀 Hyperspectral Analysis - Simple Start Guide

## ✅ What You Actually Need (No Redis Required!)

The hyperspectral analysis system I created uses a **simplified architecture**:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React.js      │    │   Node.js        │    │   MATLAB        │
│   Frontend      │◄──►│   Express API    │◄──►│   (Optional)    │
│   Port 3000     │    │   Port 3001      │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

**No Redis, No PostgreSQL, No Python Flask needed!**

## 🛠️ Installation (Windows)

### Prerequisites
✅ **Node.js 16+** - [Download here](https://nodejs.org/)  
✅ **MATLAB R2023a+** - Optional (system works with simulated data)  
❌ **Redis** - NOT NEEDED  
❌ **PostgreSQL** - NOT NEEDED  
❌ **Python** - NOT NEEDED  

### Step-by-Step Setup

1. **Navigate to your project directory**:
   ```powershell
   cd C:\Users\Gayatri Gurugubelli\agri-monitoring-platform
   ```

2. **Install Backend Dependencies**:
   ```powershell
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**:
   ```powershell
   cd ..\frontend
   npm install
   ```

4. **Start Backend Server** (Terminal 1):
   ```powershell
   cd backend
   npm start
   ```
   ✅ Should show: "Agricultural Monitoring Backend Server running on port 3001"

5. **Start Frontend Server** (Terminal 2):
   ```powershell
   cd frontend
   npm start
   ```
   ✅ Should open browser at http://localhost:3000

## 🎯 Access the Dashboard

1. **Open**: http://localhost:3000
2. **Login**: 
   - Username: `admin`
   - Password: `admin123`
3. **Navigate**: Click "Hyperspectral Analysis" in top menu

## 🚨 Why the Original README Mentions Redis

The original README describes a **complete agricultural platform** with:
- Python Flask backend
- PostgreSQL database
- Redis for background tasks
- Full sensor integration

However, the **hyperspectral analysis feature** I added is self-contained and only needs:
- Node.js Express backend
- React frontend
- Optional MATLAB integration

## 🔧 If You Want to Install Redis (Optional)

Redis is only needed if you want to use the full platform features mentioned in the original README. For Windows:

### Option 1: WSL (Recommended)
```bash
# Install WSL first, then:
sudo apt update
sudo apt install redis-server
redis-server
```

### Option 2: Redis for Windows
1. Download from: https://github.com/MicrosoftArchive/redis/releases
2. Install and run: `redis-server.exe`

### Option 3: Docker
```bash
docker run -d -p 6379:6379 redis:alpine
```

## 🎯 What Each Service Does

### Your Current Hyperspectral System
- **Node.js Backend (Port 3001)**: 
  - Handles hyperspectral analysis APIs
  - Manages MATLAB integration
  - Provides simulated data fallback
  
- **React Frontend (Port 3000)**:
  - Interactive dashboard
  - Map visualization
  - Health metrics display

### Original Platform (If You Enable It)
- **Redis (Port 6379)**: 
  - Background task processing
  - Caching sensor data
  - Session management
  
- **PostgreSQL (Port 5432)**:
  - Persistent data storage
  - Historical sensor data
  - User management

- **Python Flask (Port 5000)**:
  - Machine learning models
  - Advanced analytics
  - Sensor data processing

## 🚀 Current Status

**✅ Working Now**: Hyperspectral analysis with Node.js + React  
**📋 Optional**: Full platform with Redis + PostgreSQL + Python

## 🔍 Verify Installation

Test your current setup:

```powershell
# Test backend health
Invoke-WebRequest -Uri http://localhost:3001/api/health

# Test hyperspectral endpoint
Invoke-WebRequest -Uri http://localhost:3001/api/hyperspectral/model-info
```

## 🎉 You're Ready!

Your hyperspectral analysis system is now running without needing Redis! You can:

1. View Indian agricultural locations on the map
2. Analyze crop health with AI
3. See vegetation indices (NDVI, SAVI, EVI)
4. Get AI-generated recommendations
5. Train the deep learning model

---

**Need help?** The hyperspectral system works independently of Redis. Focus on the Node.js backend and React frontend for now!
