# 🌾 Agriculture Monitoring Platform - Complete Testing Guide

## 📋 Prerequisites
- Python 3.8+ installed
- Node.js and npm installed
- All dependencies installed for both frontend and backend

## 🚀 Step-by-Step Testing Instructions

### Step 1: Start the Backend Server

Open **Terminal/PowerShell Window #1**:
```bash
cd C:\Users\Gayatri Gurugubelli\agri-monitoring-platform\backend
python app.py
```

**Expected Output:**
```
Real-time sensor data simulation started
* Serving Flask app 'backend.app'
* Running on http://127.0.0.1:5000
```

**✅ Success Signs:**
- No error messages
- Server shows "Running on http://127.0.0.1:5000"
- You see periodic "Generated real-time data" messages

### Step 2: Start the Frontend Server

Open **Terminal/PowerShell Window #2**:
```bash
cd C:\Users\Gayatri Gurugubelli\agri-monitoring-platform\frontend
npm start
```

**Expected Output:**
```
Starting the development server...
Compiled successfully!
Local: http://localhost:3000
```

**✅ Success Signs:**
- No compilation errors
- Browser automatically opens to http://localhost:3000
- "Compiled successfully!" message appears

## 🧪 Testing Your Website

### 1. Frontend Testing (http://localhost:3000)

**Visual Testing:**
- [ ] **Homepage loads** without errors
- [ ] **Navigation menu** is visible and clickable
- [ ] **Dashboard tab** shows charts and data
- [ ] **Karnataka Crops tab** displays crop recommendations
- [ ] **Image Analysis tab** has upload functionality
- [ ] **Real-time data** updates periodically

**Browser Console Testing:**
1. Press `F12` to open Developer Tools
2. Click on the **Console** tab
3. Look for any red error messages
4. Refresh the page and check for new errors

### 2. Backend API Testing

**Quick Browser Tests:**
Open these URLs in your browser:

**Core Health Check:**
```
http://localhost:5000/api/health
```
Expected: `{"status": "healthy", ...}`

**Dashboard Data:**
```
http://localhost:5000/api/dashboard/summary
```
Expected: JSON with farm overview data

**Karnataka Locations:**
```
http://localhost:5000/api/karnataka/locations
```
Expected: Array of Karnataka cities

**Crop Database:**
```
http://localhost:5000/api/crop/database
```
Expected: List of crops with details

### 3. Advanced API Testing (Using PowerShell)

Run these commands in PowerShell:

```powershell
# Test backend health
Invoke-WebRequest -Uri "http://localhost:5000/api/health" -UseBasicParsing

# Test dashboard
Invoke-WebRequest -Uri "http://localhost:5000/api/dashboard/summary" -UseBasicParsing

# Test Karnataka API
Invoke-WebRequest -Uri "http://localhost:5000/api/karnataka/locations" -UseBasicParsing
```

## 🔧 Troubleshooting Common Issues

### ❌ Frontend Won't Start
**Problem:** `npm start` fails or shows errors

**Solutions:**
1. Install dependencies:
   ```bash
   cd frontend
   npm install
   npm start
   ```

2. Clear npm cache:
   ```bash
   npm cache clean --force
   npm install
   ```

3. Check for port conflicts:
   ```bash
   netstat -ano | findstr :3000
   ```

### ❌ Backend Won't Start
**Problem:** Python server crashes or shows errors

**Solutions:**
1. Install Python dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   python app.py
   ```

2. Check Python version:
   ```bash
   python --version
   ```
   Should be 3.8 or higher

3. Database issues:
   - Delete `agriculture_enhanced.db` file
   - Restart the server to recreate database

### ❌ API Calls Failing
**Problem:** Frontend can't connect to backend

**Solutions:**
1. Verify both servers are running
2. Check firewall settings
3. Ensure correct ports (3000 for frontend, 5000 for backend)

### ❌ MATLAB Errors (Safe to Ignore)
**Problem:** "Failed to initialize MATLAB engine"

**Solution:** This is normal if you don't have MATLAB license
- Core functionality works without MATLAB
- Only affects advanced hyperspectral processing

## ✅ Success Indicators

### Your website is working correctly if you see:

**Frontend (http://localhost:3000):**
- [ ] Page loads without errors
- [ ] Dashboard shows charts and data
- [ ] Navigation works between tabs
- [ ] Real-time updates are visible
- [ ] No console errors in browser dev tools

**Backend (http://localhost:5000):**
- [ ] API endpoints return JSON data
- [ ] Health check returns "healthy" status
- [ ] Database queries work
- [ ] Real-time data generation active

## 🎯 Key Features to Test

### 1. Dashboard Features
- Real-time sensor data display
- Interactive charts and graphs
- Alert notifications
- Field overview information

### 2. Karnataka Crop Recommendations
- Location-based suggestions
- Weather integration
- Seasonal advice
- Investment analysis

### 3. Image Analysis
- Upload functionality
- Hyperspectral processing
- Crop health classification
- Disease detection

### 4. Real-time Updates
- Data refreshes automatically
- WebSocket connections (if implemented)
- Live sensor readings

## 📱 Mobile Testing (Optional)
- Resize browser window to mobile size
- Test touch interactions
- Verify responsive design
- Check mobile-specific features

## 🔄 Automated Testing Scripts

**Quick Test (PowerShell):**
```powershell
# Run from project root
.\Quick-Test.ps1
```

**Complete Test (Batch):**
```batch
# Run from project root
test-platform.bat
```

## 📞 Getting Help

If you encounter issues:
1. Check both terminal windows for error messages
2. Verify all prerequisites are installed
3. Follow troubleshooting steps above
4. Check firewall and antivirus settings
5. Ensure ports 3000 and 5000 are available

---

**🏁 Testing Complete!**
Once both frontend and backend are running successfully, your Agriculture Monitoring Platform is ready for use!