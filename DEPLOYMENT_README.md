# AgriCare Flutter Web Deployment on Render

This project deploys the AgriCare Flutter mobile app as a web application on Render.

## Deployment Setup

### Option 1: Using Render Dashboard (Recommended)

1. **Create a New Web Service:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `https://github.com/gayatri148/AgriCare`

2. **Configure the Service:**
   - **Name:** `agricare-flutter-web`
   - **Environment:** `Python 3`
   - **Region:** Choose your preferred region
   - **Branch:** `master` (or `main`)
   - **Runtime:** `Python 3`

3. **Build & Deploy Settings:**
   - **Build Command:** `chmod +x build.sh && ./build.sh`
   - **Start Command:** `python server.py`
   - **Advanced Settings:**
     - **Auto-Deploy:** Yes
     - **Health Check Path:** `/`

### Option 2: Using render.yaml

1. Push the included `render.yaml` file to your repository
2. Render will automatically detect and use this configuration

## What the Deployment Does

1. **Installs Flutter SDK** during the build process
2. **Builds the Flutter web app** from the `mobile_app/` directory
3. **Serves the built web app** using a Python HTTP server
4. **Handles SPA routing** to serve `index.html` for all routes

## Files Created for Deployment

- `build.sh` - Build script that installs Flutter and builds the web app
- `server.py` - Python HTTP server to serve the Flutter web build
- `requirements.txt` - Minimal Python requirements for the server
- `render.yaml` - Optional configuration for automated deployment

## Environment Variables

The following environment variables are automatically set by Render:
- `PORT` - Server port (automatically assigned by Render)

## Troubleshooting

### Build Failures
- Check the build logs in Render dashboard
- Ensure all Flutter dependencies are compatible with web platform
- Verify that the `mobile_app/pubspec.yaml` has proper web dependencies

### Runtime Issues
- Check the application logs for any Flutter web-specific issues
- Ensure Firebase configuration is properly set for web
- Verify that all API endpoints are accessible from the web environment

### Common Issues

1. **Firebase not working:** Ensure Firebase is configured for web in `mobile_app/web/index.html`
2. **Routing issues:** The server handles SPA routing automatically
3. **Assets not loading:** Check that asset paths are correct in the Flutter build

## Accessing Your Deployed App

Once deployed successfully, your app will be available at:
`https://agricare-flutter-web.onrender.com`

(The exact URL will be shown in your Render dashboard)

## Local Testing

To test the deployment setup locally:

```bash
# Make build script executable
chmod +x build.sh

# Run the build (requires Flutter SDK installed)
./build.sh

# Start the server
python server.py

# Visit http://localhost:8000
```

## Support

For deployment issues:
- Check Render's [troubleshooting guide](https://render.com/docs/troubleshooting-deploys)
- Review Flutter web [deployment documentation](https://docs.flutter.dev/platform-integration/web)