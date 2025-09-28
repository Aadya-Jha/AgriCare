# AgriCare Render Deployment Options

You have three main applications in your project. Here are the deployment options for each:

## 🎯 **RECOMMENDED: Option 1 - Deploy React Frontend**

Your React frontend (`frontend/`) is the most suitable for web deployment.

### Current Issue
The React app has dependency conflicts that need to be fixed first.

### Fix Steps:
```bash
# Navigate to frontend directory
cd frontend

# Delete problematic dependencies
rm -rf node_modules package-lock.json

# Reinstall with exact versions that work together
npm install react-scripts@4.0.3 --legacy-peer-deps
npm install --legacy-peer-deps

# Test the build
npm run build
```

### Render Configuration:
- **Build Command:** `chmod +x build-react.sh && ./build-react.sh`
- **Start Command:** `python server.py`
- **Environment:** Python 3

---

## Option 2 - Deploy Flutter Web

Deploy your Flutter mobile app as a web application.

### Prerequisites:
- Your Flutter app needs to be web-compatible
- All plugins must support web platform

### Render Configuration:
- **Build Command:** `chmod +x build.sh && ./build.sh`
- **Start Command:** `python server.py`
- **Environment:** Python 3

### Files Ready:
- ✅ `build.sh` - Flutter web build script
- ✅ `server.py` - Python server
- ✅ `render.yaml` - Configuration file

---

## Option 3 - Deploy Python Backend Only

Deploy just the backend API (`backend/`).

### Render Configuration:
```yaml
services:
  - type: web
    name: agricare-api
    env: python
    plan: free
    buildCommand: cd backend && pip install -r requirements.txt
    startCommand: cd backend && python app.py
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: SECRET_KEY
        generateValue: true
```

---

## 🚀 **Quick Start - React Frontend (Recommended)**

1. **Fix React Dependencies First:**
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install react-scripts@4.0.3 typescript@4.9.5 --legacy-peer-deps
   npm install --legacy-peer-deps
   npm run build  # Test if build works
   ```

2. **Deploy to Render:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Create new Web Service
   - Connect GitHub repo: `https://github.com/gayatri148/AgriCare`
   - **Build Command:** `chmod +x build-react.sh && ./build-react.sh`
   - **Start Command:** `python server.py`

3. **Alternative - Manual Deploy:**
   If dependencies still fail, you can build locally and deploy the build folder:
   ```bash
   # Build locally (after fixing dependencies)
   cd frontend
   npm run build
   
   # Create a simple static deployment
   # Upload the 'build' folder as a static site
   ```

---

## 📋 **Next Steps**

**Choose your preferred option:**

### For React Frontend:
1. Fix the dependency issues in `frontend/package.json`
2. Test `npm run build` works locally
3. Deploy using the React configuration

### For Flutter Web:
1. Ensure Flutter is installed locally
2. Test `flutter build web` in `mobile_app/`
3. Deploy using the Flutter configuration

### For Backend API:
1. Test the Python backend locally
2. Set up database environment variables
3. Deploy using the backend configuration

---

## 🔧 **Troubleshooting**

### React Build Fails:
- Downgrade react-scripts to 4.0.3
- Use TypeScript 4.9.5 instead of 5.x
- Run with `--legacy-peer-deps`

### Flutter Build Fails:
- Check Flutter web compatibility of all plugins
- Remove incompatible plugins temporarily
- Test web build locally first

### Server Issues:
- Check that `server.py` serves the correct directory
- Ensure PORT environment variable is used
- Verify health check endpoint responds

---

**Files created for deployment:**
- ✅ `server.py` - Python HTTP server
- ✅ `build.sh` - Flutter build script  
- ✅ `build-react.sh` - React build script
- ✅ `render.yaml` - Render configuration
- ✅ `requirements.txt` - Python dependencies
- ✅ `DEPLOYMENT_README.md` - Detailed Flutter deployment guide