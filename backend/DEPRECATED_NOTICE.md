# ⚠️ BACKEND DEPRECATION NOTICE

## 🔄 Backend Consolidation Completed

The separate backend servers in this directory have been **DEPRECATED** and consolidated into a single unified backend server.

### ❌ **OLD Architecture (DEPRECATED)**
- `backend/app.py` - Separate Flask server (Port 5000)
- `backend/index.js` - Separate Node.js server (Port 3002)
- Multiple servers causing port conflicts and complexity

### ✅ **NEW Architecture (CURRENT)**
- `consolidated_server.py` - **Single unified backend** (Port 3001)
- All features integrated into one server
- No port conflicts, simplified deployment
- Enhanced functionality with hyperspectral integration

## 🚀 **How to Use the New System**

### Start the Unified Backend
```bash
# From project root directory
python consolidated_server.py
```

### Features Included in Consolidated Backend
- ✅ **Dashboard API** - Real-time sensor data and analytics
- ✅ **Karnataka Crop System** - 8 locations with weather integration
- ✅ **Image Analysis** - AI-powered disease detection
- ✅ **Hyperspectral Processing** - RGB to 424-band conversion
- ✅ **MATLAB Integration** - Advanced processing capabilities
- ✅ **Cross-Platform Support** - Works with mobile and web apps

### API Endpoints (All on Port 3001)
```
http://localhost:3001/api/health
http://localhost:3001/api/dashboard/summary
http://localhost:3001/api/karnataka/locations
http://localhost:3001/api/image-analysis/analyze
http://localhost:3001/api/hyperspectral/predictions
http://localhost:3001/api/matlab/status
```

## 🗂️ **Migration Guide**

### If You Were Using `backend/app.py`
```bash
# OLD (Don't use)
cd backend
python app.py

# NEW (Use this)
python consolidated_server.py
```

### If You Were Using `backend/index.js`
```bash
# OLD (Don't use)  
cd backend
node index.js

# NEW (Use this)
python consolidated_server.py
```

### Frontend Applications
Update your API base URLs from:
- ❌ `http://localhost:5000/api` (old Flask)
- ❌ `http://localhost:3002/api` (old Node.js)

To:
- ✅ `http://localhost:3001/api` (new consolidated)

## 🔧 **Development Workflow**

### Start Development
```bash
# Use the deployment script
deploy.bat

# Or manually
python consolidated_server.py
```

### Access All Features
- Dashboard: `http://localhost:3001/api/dashboard/summary`
- Health Check: `http://localhost:3001/api/health`
- Enhanced Features: `http://localhost:3001/api/dashboard/enhanced-summary`

## 📦 **Why Consolidation?**

1. **Simplified Architecture** - One server instead of multiple
2. **No Port Conflicts** - Single port (3001) for all features  
3. **Enhanced Integration** - Better data flow between features
4. **Easier Deployment** - Single server to deploy and maintain
5. **Cross-Platform Ready** - Works with Flutter mobile and React web
6. **MATLAB Integration** - Direct integration without proxying
7. **Performance** - Reduced network overhead between services

## 🚨 **Important Notes**

- **DO NOT** start the old backend servers anymore
- **UPDATE** all frontend applications to use port 3001
- **USE** `consolidated_server.py` for all development and production
- **REMOVE** any references to ports 5000 and 3002 in your configuration

## ✅ **Verification**

To verify the consolidation is working:

1. Start the consolidated server:
   ```bash
   python consolidated_server.py
   ```

2. Test the unified API:
   ```bash
   curl http://localhost:3001/api/health
   ```

3. Check that no other backend servers are running:
   ```bash
   netstat -ano | findstr :5000
   netstat -ano | findstr :3002
   # These should return no results
   ```

---

**🌱 The Agriculture Monitoring Platform is now unified and more powerful than ever!**

*For questions about migration, check the updated WARP.md or README_CROSS_PLATFORM.md*