# Hyperspectral Analysis - Quick Start Guide

## 🚀 Quick Demo

Want to see the hyperspectral analysis in action? Follow these simple steps:

### 1. Start the Backend (Terminal 1)
```bash
cd backend
npm install
npm start
```
✅ Backend running on http://localhost:3001

### 2. Start the Frontend (Terminal 2)
```bash
cd frontend
npm start
```
✅ Frontend running on http://localhost:3000

### 3. Access the Dashboard
1. Open http://localhost:3000
2. Login with: `admin` / `admin123`
3. Click **"Hyperspectral Analysis"** in the top navigation

## 🎯 What You'll See

### Dashboard Features
- **🗺️ Interactive Map**: Indian agricultural locations with health-coded markers
- **📊 Statistics**: Overall health scores, NDVI averages, yield predictions
- **🎯 Location Cards**: Quick overview of each location's health metrics  
- **📈 Charts**: Vegetation indices visualization (NDVI, SAVI, EVI)
- **🧠 AI Recommendations**: Smart suggestions based on analysis

### Key Locations
- **Anand, Gujarat**: Semi-arid climate, Cotton/Wheat/Sugarcane
- **Jhagdia, Gujarat**: Humid climate, Rice/Cotton/Sugarcane
- **Kota, Rajasthan**: Arid climate, Wheat/Soybean/Mustard
- **Maddur, Karnataka**: Tropical climate, Rice/Ragi/Coconut
- **Talala, Gujarat**: Coastal climate, Groundnut/Cotton/Mango

## 🔍 How to Use

1. **📍 Select a Location**: Click on map markers or location cards
2. **📊 View Metrics**: See detailed health scores and vegetation indices
3. **💡 Read Recommendations**: AI-generated suggestions for each location
4. **🔄 Refresh Data**: Click "Refresh Data" for updated analysis
5. **🎓 Train Model**: Click "Train Model" to simulate model training

## 📱 Key Features

### Health Assessment
- Overall health scores (0-100%)
- Vegetation indices (NDVI, SAVI, EVI)
- Water stress indicators
- Pest and disease risk assessment

### Smart Insights
- Climate-aware seasonal adjustments
- Location-specific recommendations
- Risk level classifications
- Yield prediction factors

## 🔧 Technical Stack

- **Frontend**: React + TypeScript + Tailwind CSS + Leaflet Maps + Recharts
- **Backend**: Node.js + Express + MATLAB Integration
- **AI Model**: MATLAB Deep Learning CNN for hyperspectral analysis

## 💡 Demo Notes

- **MATLAB Integration**: Falls back to realistic simulated data if MATLAB isn't available
- **Data**: Uses synthetic but scientifically accurate Indian agricultural data
- **Real-time**: Supports live updates and model retraining
- **Responsive**: Works on desktop and mobile devices

## 🎨 Screenshots Preview

### Dashboard Overview
```
┌─────────────────────────────────────────────────────────────┐
│ 🛰️ Hyperspectral Analysis                    🔄 ▶️ Train  │
├─────────────────────────────────────────────────────────────┤
│  📊 Avg Health: 72%   📈 NDVI: 0.680   🎯 Yield: 1.05x   │
│  ⚠️  High Risk: 1/5                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🗺️ [Interactive Map of India with markers]                │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  📋 Location Cards    │  📊 Health Metrics                 │
│  [Anand] [Jhagdia]    │  [Charts & Analysis]               │
│  [Kota]  [Maddur]     │  [AI Recommendations]              │
└─────────────────────────────────────────────────────────────┘
```

## 🚨 Troubleshooting

### Backend Issues
```bash
# If port 3001 is busy
npx kill-port 3001
npm start
```

### Frontend Issues
```bash
# Clear cache and restart
rm -rf node_modules package-lock.json
npm install
npm start
```

### Map Not Loading
- Check internet connection (needs map tiles)
- Ensure leaflet dependencies are installed

## 📚 Learn More

- **Full Documentation**: See `HYPERSPECTRAL_INTEGRATION.md`
- **API Endpoints**: http://localhost:3001/api/health
- **Model Details**: Check `matlab-processing/deep_learning/`

## 🎯 Next Steps

1. **Explore** all locations on the map
2. **Compare** health metrics between different regions
3. **Analyze** seasonal variations and climate impacts  
4. **Test** the model training functionality
5. **Review** AI-generated recommendations

Ready to explore Indian agriculture through hyperspectral AI? 🌾🛰️

---
*Created with ❤️ for smart agricultural monitoring*
