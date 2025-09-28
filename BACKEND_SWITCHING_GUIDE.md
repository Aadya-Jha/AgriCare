# Backend Switching Guide

## Overview
Your agricultural monitoring platform now supports **dual backends** with seamless switching between them:

- **Original Backend** (Port 3001): Hyperspectral image analysis and basic dashboard
- **Unified Backend** (Port 3002): All features + Karnataka crop recommendations + growth planning + weather integration

## How to Switch Between Backends

### Method 1: Dashboard Header (Recommended)
1. Open the dashboard at http://localhost:3000
2. Look for the **Backend Selector** in the top-right corner of the dashboard header
3. Click on the dropdown (shows "Unified" or "Original")
4. Select your preferred backend from the options
5. The page will automatically reload to use the selected backend

### Method 2: Direct API Calls
You can also test different backends directly:

**Original Backend (Port 3001):**
```bash
curl http://localhost:3001/api/health
curl http://localhost:3001/api/dashboard/summary
```

**Unified Backend (Port 3002):**
```bash
curl http://localhost:3002/api/health  
curl http://localhost:3002/api/karnataka/comprehensive-analysis/Bangalore
```

## Backend Status Indicators

The Backend Selector shows real-time status:
- 🟢 **Green Circle**: Backend is online and responding
- 🔴 **Red Circle**: Backend is offline or unreachable  
- 🟡 **Yellow Circle**: Checking backend status

## Features Comparison

### Unified Backend (Port 3002) - Recommended ⭐
✅ **Full Dashboard** with trends and sensor data  
✅ **Hyperspectral Image Analysis** (RGB to 424-band conversion)  
✅ **Karnataka Crop Recommendations** for 8 locations  
✅ **Weather Integration** with real-time data  
✅ **Growth Planning** with stage-wise activities  
✅ **Investment Analysis** and yield predictions  
✅ **10-Crop Database** (Rice, Ragi, Cotton, etc.)  

### Original Backend (Port 3001) - Legacy
✅ **Basic Dashboard** functionality  
✅ **Hyperspectral Analysis** core features  
❌ **Karnataka Crop Recommendations**  
❌ **Growth Planning**  
❌ **Weather Integration**  

## Starting Both Backends

Use the provided batch script:
```bash
./start-unified-platform.bat
```

This will:
1. Stop any existing processes on ports 3001 and 3002
2. Start the original backend on port 3001
3. Start the unified backend on port 3002  
4. Start the frontend on port 3000
5. Display all available endpoints and features

## Troubleshooting

### Backend Not Responding
- Check if the backend process is running
- Verify no other process is using the port
- Try restarting with the batch script

### Switch Not Working
- Ensure you have both backends running
- Clear browser cache and reload
- Check browser console for errors

### Port Conflicts  
- Make sure ports 3001, 3002, and 3000 are available
- Use `netstat -an | findstr "3001"` to check port usage
- Kill existing processes if needed

## API Endpoint Examples

### Karnataka Crop Recommendations (Unified Only)
```bash
# Get Karnataka locations
GET http://localhost:3002/api/karnataka/locations

# Get crop recommendations for Bangalore
GET http://localhost:3002/api/karnataka/comprehensive-analysis/Bangalore

# Get growth plan for Rice
GET http://localhost:3002/api/crop/growth-plan/Rice
```

### Hyperspectral Analysis (Both Backends)
```bash
# Check hyperspectral health
GET http://localhost:3001/api/hyperspectral/health
GET http://localhost:3002/api/hyperspectral/health

# Get supported locations
GET http://localhost:3001/api/hyperspectral/locations  
GET http://localhost:3002/api/hyperspectral/locations
```

### Dashboard Data (Both Backends)
```bash  
# Get dashboard summary
GET http://localhost:3001/api/dashboard/summary
GET http://localhost:3002/api/dashboard/summary

# Get trends data
GET http://localhost:3001/api/trends/1
GET http://localhost:3002/api/trends/1
```

## Best Practices

1. **Use Unified Backend** for full feature access
2. **Check backend status** before switching
3. **Allow page reload** after switching (automatic)
4. **Monitor both backends** for development/testing
5. **Keep original backend** as fallback option

## Technical Details

- Backend preference is stored in `localStorage`
- Frontend automatically detects backend health every 30 seconds
- API service (`services/api.ts`) handles dynamic URL switching
- Page reload ensures all components use correct backend
- CORS is configured for both ports (3001, 3002)
