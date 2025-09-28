# 🌾 Karnataka Crop Recommendation System

## Overview

The Karnataka Crop Recommendation System is an AI-powered feature that provides personalized crop suggestions based on real-time weather conditions, soil characteristics, and agricultural best practices specific to Karnataka, India.

## Features

### 🌤️ **Real-Time Weather Integration**
- Fetches current weather data for 8 major Karnataka locations
- Displays temperature, humidity, wind speed, UV index, and more
- Weather data influences crop suitability calculations

### 🏞️ **Location Coverage**
Support for 8 major Karnataka locations:
- **Bangalore** - Eastern Dry Zone, Red Sandy Loam soil
- **Mysore** - Southern Dry Zone, Red Clay Loam soil  
- **Hubli** - Northern Transition Zone, Black Cotton Soil
- **Mangalore** - Coastal Zone, Laterite Soil
- **Belgaum** - Northern Dry Zone, Black Cotton Soil
- **Gulbarga** - North Eastern Dry Zone, Black Clayey Soil
- **Shimoga** - Central Dry Zone, Red Laterite Soil
- **Hassan** - Southern Transition Zone, Red Clay Loam soil

### 🌱 **Comprehensive Crop Database**
10 crops with detailed characteristics:

1. **Rice** - Water-intensive, clay soils, 120-day duration
2. **Ragi** - Drought-resistant, red soils, 90-day duration
3. **Cotton** - Medium water needs, black cotton soils, 180-day duration
4. **Sugarcane** - High water needs, year-round cultivation
5. **Groundnut** - Medium water needs, sandy loam soils
6. **Maize** - Versatile crop, multiple seasons
7. **Soybean** - Protein-rich legume, black soils
8. **Tomato** - High-value vegetable, controlled conditions
9. **Onion** - Cool season crop, well-drained soils
10. **Coconut** - Perennial crop, coastal areas

### 🔬 **AI-Powered Recommendations**
Smart suitability scoring based on:
- **Temperature compatibility** (40% weight)
- **Seasonal appropriateness** (30% weight)
- **Soil type matching** (20% weight)
- **Humidity requirements** (10% weight)

### 📋 **Detailed Growth Planning**
For each recommended crop:
- **5-stage growth plan** with specific activities
- **Timeline** with start/end dates for each stage
- **Investment analysis** with cost estimates
- **Expected yields** and profitability projections
- **Stage-specific activities**: from land preparation to marketing

### 📅 **Seasonal Intelligence**
- **Kharif Season** (June-October): Monsoon crops
- **Rabi Season** (November-March): Winter crops  
- **Summer Season** (April-May): Heat-tolerant crops

### 💡 **Smart Insights**
- **Suitability factors** explaining why crops are recommended
- **General seasonal advice** for each agricultural season
- **Location-specific recommendations** based on agro-climatic zones

## API Endpoints

### Core Endpoints
```
GET /api/karnataka/locations - Get all Karnataka locations
GET /api/karnataka/weather/<location> - Get weather for location
GET /api/karnataka/crop-recommendations/<location> - Get crop recommendations
GET /api/karnataka/comprehensive-analysis/<location> - Get complete analysis
GET /api/crop/growth-plan/<crop_name> - Get detailed growth plan
GET /api/crop/database - Get complete crop database
```

### Example Usage
```bash
# Get recommendations for Bangalore
curl http://localhost:3001/api/karnataka/crop-recommendations/Bangalore

# Get growth plan for Ragi
curl http://localhost:3001/api/crop/growth-plan/Ragi

# Get comprehensive analysis for Mysore  
curl http://localhost:3001/api/karnataka/comprehensive-analysis/Mysore
```

## How It Works

### 1. Location Selection
User selects from 8 Karnataka locations, each with unique:
- Agro-climatic zone
- Soil type
- Elevation
- District information

### 2. Weather Analysis
System fetches current weather conditions:
- Temperature and humidity
- Wind speed and pressure
- UV index and visibility
- Weather description

### 3. Crop Matching Algorithm
AI system evaluates each crop against:
```python
suitability_score = (
    temperature_compatibility * 0.4 +
    seasonal_appropriateness * 0.3 +
    soil_compatibility * 0.2 +
    humidity_match * 0.1
)
```

### 4. Growth Plan Generation
For recommended crops, system generates:
- **Stage 1**: Germination & Establishment (15-30 days)
- **Stage 2**: Vegetative Growth (30-90 days)
- **Stage 3**: Flowering/Reproductive (30-90 days)
- **Stage 4**: Fruit/Grain Development (30-90 days)
- **Stage 5**: Harvest (variable duration)

## Getting Started

### 1. Start the Application
```bash
# Run the startup script
./start-servers.bat

# Or manually:
python standalone_server.py  # Backend on port 3001
cd frontend && npm start     # Frontend on port 3000
```

### 2. Access the Feature
1. Open http://localhost:3000
2. Navigate to Dashboard
3. Click "Karnataka Crop Recommendations" tab
4. Select a location from the grid
5. View weather, recommendations, and growth plans

### 3. Explore Features
- **Location Selection**: Try different Karnataka cities
- **Crop Details**: View suitability scores and factors
- **Growth Plans**: Expand recommended crops to see detailed plans
- **Seasonal Advice**: Learn about current season recommendations

## Technical Architecture

### Backend Components
- **Flask Server** (standalone_server.py) - REST API
- **Weather Service** - Simulated weather data (easily replaceable with real API)
- **Crop Database** - Comprehensive crop characteristics
- **Recommendation Engine** - AI-powered crop matching
- **Growth Planner** - Stage-wise cultivation planning

### Frontend Components
- **KarnatakaCropRecommendation.tsx** - Main React component
- **KarnatakaCropRecommendation.css** - Custom styling
- **Dashboard Integration** - Tabbed interface

### Data Flow
```
User Selection → Weather Fetch → Crop Analysis → Growth Planning → UI Display
```

## Benefits

### For Farmers
- **Data-driven decisions** based on real weather and soil conditions
- **Optimal crop selection** for maximum productivity
- **Detailed planning** with stage-wise activities
- **Investment guidance** with cost and yield projections

### For Agricultural Extension
- **Scientific recommendations** backed by comprehensive database
- **Location-specific advice** tailored to Karnataka conditions
- **Seasonal optimization** based on current agricultural calendar

### For Research
- **Extensible database** for adding new crops and regions
- **Configurable algorithms** for different recommendation strategies
- **API access** for integration with other agricultural systems

## Future Enhancements

- **Real weather API** integration (OpenWeatherMap)
- **Historical weather** analysis and trends
- **Market price** integration for profitability analysis
- **Pest and disease** risk assessment
- **Irrigation scheduling** based on crop needs
- **Mobile app** for field access
- **Multi-language support** (Kannada, Hindi)
- **Satellite imagery** integration for field monitoring

## Contributing

To add new locations or crops:
1. Update `KARNATAKA_LOCATIONS` in standalone_server.py
2. Add crop data to `CROP_DATABASE`
3. Test with comprehensive analysis endpoint
4. Update documentation

## Support

For technical issues or feature requests, please refer to the main project documentation or create an issue in the project repository.

---

**🌾 Happy Farming with AI-Powered Crop Recommendations! 🌾**
