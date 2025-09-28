# Hyperspectral Analysis Integration

## Overview

This document describes the complete integration of MATLAB-based hyperspectral analysis with the Agricultural Monitoring Platform frontend and backend. The integration includes:

- **MATLAB Deep Learning Model**: CNN-based hyperspectral crop health analysis
- **Node.js Backend API**: RESTful endpoints for data exchange
- **React Frontend**: Interactive dashboard for visualization and monitoring

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React         │    │   Node.js        │    │   MATLAB        │
│   Frontend      │◄──►│   Backend        │◄──►│   Engine        │
│                 │    │                  │    │                 │
│ - Dashboard     │    │ - API Endpoints  │    │ - CNN Model     │
│ - Visualizations│    │ - Data Processing│    │ - Spectral      │
│ - Maps & Charts │    │ - MATLAB Service │    │   Analysis      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Features Implemented

### 🧠 MATLAB Deep Learning Model
- **Location**: `matlab-processing/deep_learning/hyperspectral_deep_learning_model.m`
- **Architecture**: 1D CNN optimized for hyperspectral data
- **Supported Locations**: Indian agricultural regions (Anand, Jhagdia, Kota, Maddur, Talala)
- **Output Metrics**:
  - Overall health score
  - Vegetation indices (NDVI, SAVI, EVI)
  - Water stress index
  - Pest and disease risk scores
  - Yield predictions
  - Location-specific recommendations

### 🔧 Backend Integration
- **Location**: `backend/index.js` and `backend/services/matlabService.js`
- **Features**:
  - MATLAB process spawning and communication
  - Simulated data fallback when MATLAB is unavailable
  - Climate-aware seasonal adjustments
  - RESTful API endpoints

#### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/hyperspectral/predictions` | GET | Get all location predictions |
| `/api/hyperspectral/predictions/:location` | GET | Get specific location prediction |
| `/api/hyperspectral/train` | POST | Train the deep learning model |
| `/api/hyperspectral/model-info` | GET | Get model information |
| `/api/dashboard/summary` | GET | Dashboard summary with hyperspectral data |
| `/api/alerts` | GET | Alerts based on hyperspectral analysis |
| `/api/trends/:fieldId` | GET | Trend data for locations |

### 🎨 Frontend Dashboard
- **Location**: `frontend/src/pages/HyperspectralPage.tsx`
- **Components**:
  - Interactive map with health-coded markers
  - Location cards with key metrics
  - Health metrics overview panels
  - Vegetation indices charts
  - Model information display
  - Real-time recommendations

## File Structure

```
agri-monitoring-platform/
├── matlab-processing/
│   └── deep_learning/
│       └── hyperspectral_deep_learning_model.m
├── backend/
│   ├── index.js
│   ├── services/
│   │   └── matlabService.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   └── HyperspectralPage.tsx
    │   ├── components/
    │   │   ├── HyperspectralMap.tsx
    │   │   ├── LocationCard.tsx
    │   │   ├── HealthMetricsOverview.tsx
    │   │   ├── VegetationIndicesChart.tsx
    │   │   └── ModelInfoPanel.tsx
    │   ├── hooks/
    │   │   └── useApi.ts (updated)
    │   ├── services/
    │   │   └── api.ts (updated)
    │   └── App.tsx (updated)
    └── package.json
```

## Installation and Setup

### Prerequisites
- Node.js 16+ and npm
- MATLAB R2023a+ (optional - falls back to simulated data)
- React development environment

### Backend Setup

1. **Install dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Start the backend server**:
   ```bash
   npm start
   ```
   Server will start on port 3001.

3. **Verify installation**:
   ```bash
   curl http://localhost:3001/api/health
   ```

### Frontend Setup

1. **Navigate to frontend**:
   ```bash
   cd frontend
   ```

2. **Install dependencies** (if not already installed):
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```
   Application will be available at http://localhost:3000.

### MATLAB Integration

1. **MATLAB Available**: 
   - Model will execute real hyperspectral analysis
   - Data path should point to actual hyperspectral datasets

2. **MATLAB Not Available**: 
   - System automatically falls back to realistic simulated data
   - All functionality remains available for demonstration

## Usage Guide

### Accessing the Hyperspectral Dashboard

1. **Login** to the application (admin/admin123 for demo)
2. **Navigate** to "Hyperspectral Analysis" in the top navigation
3. **Explore** the dashboard features:
   - View overall statistics
   - Select locations on the interactive map
   - Review detailed health metrics
   - Examine vegetation indices charts
   - Read AI-generated recommendations

### Training the Model

1. **Click** the "Train Model" button in the dashboard header
2. **Monitor** progress through the UI feedback
3. **View** training results and model accuracy

### Interpreting Results

#### Health Scores
- **Excellent (80-100%)**: Optimal crop health
- **Good (60-79%)**: Healthy with minor concerns
- **Fair (40-59%)**: Moderate health issues
- **Poor (0-39%)**: Significant health problems

#### Vegetation Indices
- **NDVI**: Overall vegetation health (0.0-1.0)
- **SAVI**: Soil-adjusted vegetation index
- **EVI**: Enhanced vegetation index for dense canopies

#### Risk Assessments
- **Low Risk (0-40%)**: Minimal concern
- **Medium Risk (40-70%)**: Moderate monitoring needed
- **High Risk (70-100%)**: Immediate attention required

## Data Models

### Location Prediction Structure
```typescript
interface LocationPrediction {
  location: string;
  coordinates: [number, number];
  state: string;
  climate: string;
  major_crops: string[];
  health_metrics: {
    overall_health_score: number;
    ndvi: number;
    savi: number;
    evi: number;
    water_stress_index: number;
    chlorophyll_content: number;
    predicted_yield: number;
    pest_risk_score: number;
    disease_risk_score: number;
    recommendations: string[];
  };
  analysis_timestamp: string;
}
```

## Technical Details

### MATLAB Model Specifications
- **Input**: Hyperspectral reflectance data (400-2500nm, 211 bands)
- **Architecture**: Multi-layer 1D CNN with batch normalization
- **Output**: 4-class health classification + regression metrics
- **Training**: Synthetic data based on Indian crop characteristics

### Performance Optimizations
- **Caching**: API responses cached for improved performance
- **Lazy Loading**: Components loaded on demand
- **Error Handling**: Graceful fallbacks and user feedback
- **Real-time Updates**: Automatic refresh capabilities

### Security Considerations
- **CORS**: Configured for frontend-backend communication
- **Input Validation**: All API inputs validated
- **Error Sanitization**: Sensitive error details hidden in production

## Troubleshooting

### Common Issues

1. **Backend Won't Start**
   - Verify Node.js installation
   - Check port 3001 availability
   - Install dependencies: `npm install`

2. **MATLAB Integration Issues**
   - Verify MATLAB installation path
   - Check MATLAB licensing
   - System falls back to simulated data automatically

3. **Frontend Build Errors**
   - Update React dependencies
   - Clear node_modules and reinstall
   - Check for TypeScript compilation errors

4. **Map Not Loading**
   - Verify leaflet dependencies
   - Check internet connection for map tiles
   - Ensure coordinates are properly formatted

### Error Messages

- **"MATLAB not available"**: System using simulated data (normal operation)
- **"Training not triggered"**: Click "Train Model" button to initiate
- **"Authentication required"**: Login with demo credentials

## Development Notes

### Code Organization
- **Separation of Concerns**: Clear separation between data, business logic, and presentation
- **Reusable Components**: Modular React components for easy maintenance
- **Type Safety**: Full TypeScript integration for better development experience

### Testing Strategy
- **Unit Tests**: Individual component and function testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full user workflow testing

### Future Enhancements
- **Real-time Data Streaming**: WebSocket integration for live updates
- **Advanced Visualizations**: 3D spectral plots and time-series analysis
- **Machine Learning Pipeline**: Automated model retraining
- **Mobile Responsive**: Enhanced mobile device support

## Support and Maintenance

### Monitoring
- **Health Checks**: `/api/health` endpoint for system monitoring
- **Error Logging**: Comprehensive error logging and alerting
- **Performance Metrics**: Response time and resource usage tracking

### Updates
- **Model Updates**: Regular model retraining with new data
- **Security Patches**: Regular dependency updates
- **Feature Enhancements**: Based on user feedback and requirements

---

## Contact Information

For technical support or questions regarding the hyperspectral integration:

- **Backend Issues**: Check `backend/services/matlabService.js`
- **Frontend Issues**: Review React component documentation
- **MATLAB Issues**: Verify MATLAB model in `matlab-processing/deep_learning/`

**Created**: 2024  
**Last Updated**: January 2025  
**Version**: 1.0.0
