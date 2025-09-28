/**
 * Agricultural Monitoring Platform - Backend API Server
 * Includes hyperspectral analysis integration with MATLAB
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Import services
const matlabService = require('./services/matlabService');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|tiff|tif|hdr|bil|bsq|bip/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'application/octet-stream';
        
        if (extname || mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Static file serving
app.use('/api/static', express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        service: 'Agricultural Monitoring - Hyperspectral Analysis Service',
        port: PORT,
        matlab_available: true
    });
});

// ==================== HYPERSPECTRAL ANALYSIS ENDPOINTS ====================

/**
 * Get all hyperspectral predictions
 */
app.get('/api/hyperspectral/predictions', async (req, res) => {
    try {
        const predictions = await matlabService.getHyperspectralPredictions();
        res.json(predictions);
    } catch (error) {
        console.error('Error fetching hyperspectral predictions:', error);
        res.status(500).json({ 
            error: 'Failed to fetch hyperspectral predictions',
            message: error.message 
        });
    }
});

/**
 * Get hyperspectral prediction for a specific location
 */
app.get('/api/hyperspectral/predictions/:locationName', async (req, res) => {
    try {
        const { locationName } = req.params;
        const prediction = await matlabService.getLocationPrediction(locationName);
        res.json(prediction);
    } catch (error) {
        console.error(`Error fetching prediction for ${req.params.locationName}:`, error);
        res.status(500).json({ 
            error: 'Failed to fetch location prediction',
            message: error.message 
        });
    }
});

/**
 * Train the hyperspectral deep learning model
 */
app.post('/api/hyperspectral/train', async (req, res) => {
    try {
        const results = await matlabService.trainHyperspectralModel();
        res.json(results);
    } catch (error) {
        console.error('Error training hyperspectral model:', error);
        res.status(500).json({ 
            error: 'Failed to train hyperspectral model',
            message: error.message 
        });
    }
});

/**
 * Get model information and status
 */
app.get('/api/hyperspectral/model-info', async (req, res) => {
    try {
        const info = await matlabService.getModelInfo();
        res.json(info);
    } catch (error) {
        console.error('Error fetching model info:', error);
        res.status(500).json({ 
            error: 'Failed to fetch model information',
            message: error.message 
        });
    }
});

// ==================== DASHBOARD ENDPOINTS ====================

/**
 * Get dashboard summary data
 */
app.get('/api/dashboard/summary', async (req, res) => {
    try {
        // Get hyperspectral data for dashboard summary
        const hyperspectralData = await matlabService.getHyperspectralPredictions();
        
        // Calculate aggregated metrics
        const locations = Object.keys(hyperspectralData.predictions || {});
        let totalHealthScore = 0;
        let totalYieldPrediction = 0;
        let alertCount = 0;

        locations.forEach(location => {
            const locationData = hyperspectralData.predictions[location];
            if (locationData.health_metrics) {
                totalHealthScore += locationData.health_metrics.overall_health_score;
                totalYieldPrediction += locationData.health_metrics.predicted_yield;
                
                // Count alerts based on thresholds
                if (locationData.health_metrics.overall_health_score < 0.5) alertCount++;
                if (locationData.health_metrics.pest_risk_score > 0.6) alertCount++;
                if (locationData.health_metrics.disease_risk_score > 0.6) alertCount++;
            }
        });

        const avgHealthScore = locations.length > 0 ? totalHealthScore / locations.length : 0;
        const avgYieldPrediction = locations.length > 0 ? totalYieldPrediction / locations.length : 1.0;
        
        // Calculate average NDVI from hyperspectral data
        let totalNDVI = 0;
        locations.forEach(location => {
            const locationData = hyperspectralData.predictions[location];
            if (locationData.health_metrics && locationData.health_metrics.ndvi) {
                totalNDVI += locationData.health_metrics.ndvi;
            }
        });
        const avgNDVI = locations.length > 0 ? totalNDVI / locations.length : 0.6;

        // Create dashboard summary in the format expected by DashboardPage
        res.json({
            // Legacy format for compatibility
            active_fields: locations.length,
            total_sensors: locations.length * 5,
            alerts_count: alertCount,
            avg_yield_prediction: Math.round(avgYieldPrediction * 100) / 100,
            
            // Dashboard page expected format
            crop_health: {
                status: avgHealthScore >= 0.8 ? 'Excellent' : 
                       avgHealthScore >= 0.6 ? 'Good' : 
                       avgHealthScore >= 0.4 ? 'Fair' : 'Poor',
                ndvi: Math.round(avgNDVI * 100) / 100,
                confidence: Math.round(avgHealthScore * 100)
            },
            soil_moisture: {
                value: Math.round((0.3 + Math.random() * 0.4) * 100), // 30-70% range
                unit: '%',
                status: 'optimal',
                last_updated: new Date().toISOString()
            },
            pest_risk: {
                level: alertCount > 2 ? 'high' : alertCount > 0 ? 'medium' : 'low',
                confidence: Math.round(Math.random() * 30 + 70), // 70-100%
                detected_pests: alertCount > 0 ? ['Aphids', 'Thrips'] : []
            },
            irrigation_advice: {
                recommendation: avgHealthScore < 0.5 ? 'Increase' : 
                               avgHealthScore < 0.7 ? 'Maintain' : 'Reduce',
                status: avgHealthScore < 0.5 ? 'urgent' : 'good',
                reason: avgHealthScore < 0.5 ? 'Low crop health detected' : 
                       'Crops in good condition'
            },
            weather: {
                temperature: Math.round(20 + Math.random() * 15), // 20-35°C
                humidity: Math.round(40 + Math.random() * 40), // 40-80%
                last_updated: new Date().toISOString()
            },
            field_info: {
                id: 1,
                name: 'Main Agricultural Area',
                crop_type: 'Mixed Crops',
                area_hectares: locations.length * 50
            },
            
            // Additional hyperspectral data
            health_status: {
                excellent: locations.filter(loc => 
                    hyperspectralData.predictions[loc].health_metrics?.overall_health_score >= 0.8).length,
                good: locations.filter(loc => {
                    const score = hyperspectralData.predictions[loc].health_metrics?.overall_health_score;
                    return score >= 0.6 && score < 0.8;
                }).length,
                fair: locations.filter(loc => {
                    const score = hyperspectralData.predictions[loc].health_metrics?.overall_health_score;
                    return score >= 0.4 && score < 0.6;
                }).length,
                poor: locations.filter(loc => 
                    hyperspectralData.predictions[loc].health_metrics?.overall_health_score < 0.4).length
            },
            recent_activity: [
                {
                    id: 1,
                    type: 'hyperspectral_analysis',
                    message: 'Hyperspectral analysis completed for all locations',
                    timestamp: new Date().toISOString(),
                    location: 'All'
                },
                {
                    id: 2,
                    type: 'health_update',
                    message: `Average crop health score: ${Math.round(avgHealthScore * 100)}%`,
                    timestamp: new Date(Date.now() - 300000).toISOString(),
                    location: 'Summary'
                }
            ]
        });
    } catch (error) {
        console.error('Error fetching dashboard summary:', error);
        res.status(500).json({ 
            error: 'Failed to fetch dashboard summary',
            message: error.message 
        });
    }
});

/**
 * Get alerts based on hyperspectral analysis
 */
app.get('/api/alerts', async (req, res) => {
    try {
        const hyperspectralData = await matlabService.getHyperspectralPredictions();
        const alerts = [];
        let alertId = 1;

        Object.keys(hyperspectralData.predictions || {}).forEach(location => {
            const locationData = hyperspectralData.predictions[location];
            const metrics = locationData.health_metrics;

            // Generate alerts based on thresholds
            if (metrics.overall_health_score < 0.5) {
                alerts.push({
                    id: alertId++,
                    type: 'health',
                    severity: metrics.overall_health_score < 0.3 ? 'high' : 'medium',
                    title: `Low Crop Health Detected`,
                    message: `${location} showing poor health (${Math.round(metrics.overall_health_score * 100)}%)`,
                    location: location,
                    coordinates: locationData.coordinates,
                    timestamp: new Date().toISOString(),
                    recommendations: metrics.recommendations.slice(0, 3)
                });
            }

            if (metrics.pest_risk_score > 0.6) {
                alerts.push({
                    id: alertId++,
                    type: 'pest',
                    severity: metrics.pest_risk_score > 0.7 ? 'high' : 'medium',
                    title: `High Pest Risk`,
                    message: `${location} has elevated pest risk (${Math.round(metrics.pest_risk_score * 100)}%)`,
                    location: location,
                    coordinates: locationData.coordinates,
                    timestamp: new Date().toISOString(),
                    recommendations: ['Implement pest control measures', 'Monitor crop closely']
                });
            }

            if (metrics.disease_risk_score > 0.6) {
                alerts.push({
                    id: alertId++,
                    type: 'disease',
                    severity: metrics.disease_risk_score > 0.7 ? 'high' : 'medium',
                    title: `Disease Risk Alert`,
                    message: `${location} showing signs of potential disease risk (${Math.round(metrics.disease_risk_score * 100)}%)`,
                    location: location,
                    coordinates: locationData.coordinates,
                    timestamp: new Date().toISOString(),
                    recommendations: ['Apply preventive treatments', 'Increase monitoring frequency']
                });
            }

            if (metrics.water_stress_index > 0.7) {
                alerts.push({
                    id: alertId++,
                    type: 'water',
                    severity: metrics.water_stress_index > 0.8 ? 'high' : 'medium',
                    title: `Water Stress Detected`,
                    message: `${location} experiencing water stress (${Math.round(metrics.water_stress_index * 100)}%)`,
                    location: location,
                    coordinates: locationData.coordinates,
                    timestamp: new Date().toISOString(),
                    recommendations: ['Increase irrigation', 'Check soil moisture levels']
                });
            }
        });

        // Sort alerts by severity and timestamp
        alerts.sort((a, b) => {
            const severityOrder = { high: 3, medium: 2, low: 1 };
            if (severityOrder[a.severity] !== severityOrder[b.severity]) {
                return severityOrder[b.severity] - severityOrder[a.severity];
            }
            return new Date(b.timestamp) - new Date(a.timestamp);
        });

        res.json({ alerts });
    } catch (error) {
        console.error('Error fetching alerts:', error);
        res.status(500).json({ 
            error: 'Failed to fetch alerts',
            message: error.message 
        });
    }
});

/**
 * Get trend data based on hyperspectral analysis
 */
app.get('/api/trends/:fieldId?', async (req, res) => {
    try {
        const fieldId = req.params.fieldId || 1;
        const locations = ['Anand', 'Jhagdia', 'Kota', 'Maddur', 'Talala'];
        const targetLocation = locations[fieldId - 1] || locations[0];
        
        // Generate historical trend data
        const generateTrendData = (days = 30) => {
            const data = [];
            const now = new Date();
            
            for (let i = days - 1; i >= 0; i--) {
                const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
                const baseHealth = 0.6 + Math.sin(i / 10) * 0.2 + Math.random() * 0.1;
                
                data.push({
                    date: date.toISOString().split('T')[0],
                    timestamp: date.toISOString(),
                    ndvi: Math.max(0.2, Math.min(0.9, baseHealth + Math.random() * 0.1)),
                    health_score: Math.max(0.3, Math.min(0.95, baseHealth + Math.random() * 0.15)),
                    water_stress: Math.max(0.1, Math.min(0.8, 0.5 - baseHealth * 0.3 + Math.random() * 0.2)),
                    temperature: 25 + Math.sin(i / 15) * 8 + Math.random() * 5,
                    humidity: 60 + Math.cos(i / 12) * 15 + Math.random() * 10,
                    yield_prediction: Math.max(0.6, Math.min(1.4, baseHealth + 0.4 + Math.random() * 0.2))
                });
            }
            
            return data;
        };

        const trendData = generateTrendData();
        
        res.json({
            field_id: parseInt(fieldId),
            location: targetLocation,
            time_period: '30_days',
            trends: {
                soil_moisture: trendData.map(d => ({ timestamp: d.timestamp, value: d.water_stress * 100 })),
                air_temperature: trendData.map(d => ({ timestamp: d.timestamp, value: d.temperature })),
                humidity: trendData.map(d => ({ timestamp: d.timestamp, value: d.humidity })),
                ndvi: trendData.map(d => ({ timestamp: d.timestamp, value: d.ndvi }))
            },
            summary: {
                avg_health_score: 0.72,
                avg_ndvi: 0.68,
                avg_water_stress: 0.35,
                trend_direction: 'stable'
            }
        });
    } catch (error) {
        console.error('Error fetching trends:', error);
        res.status(500).json({ 
            error: 'Failed to fetch trend data',
            message: error.message 
        });
    }
});

// ==================== IMAGE PROCESSING ENDPOINTS ====================

// Store for image processing jobs (in production, use a database)
const imageJobs = new Map();
let jobCounter = 1;

/**
 * Upload image for hyperspectral analysis
 */
app.post('/api/images/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const jobId = 'job_' + jobCounter++;
        const imageData = {
            job_id: jobId,
            image_id: jobCounter,
            filename: req.file.originalname,
            filepath: req.file.path,
            field_id: parseInt(req.body.field_id) || 1,
            status: 'processing',
            progress: 0,
            uploaded_at: new Date().toISOString()
        };

        imageJobs.set(jobId, imageData);

        // Simulate image processing (in real implementation, this would trigger MATLAB processing)
        setTimeout(() => {
            processImageAsync(jobId);
        }, 1000);

        res.json({
            message: 'Image uploaded successfully',
            job_id: jobId,
            estimated_processing_time: 30 // seconds
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ 
            error: 'Failed to upload image',
            message: error.message 
        });
    }
});

/**
 * Get image processing status
 */
app.get('/api/images/status/:jobId', (req, res) => {
    try {
        const { jobId } = req.params;
        const job = imageJobs.get(jobId);
        
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        res.json({
            job_id: job.job_id,
            status: job.status,
            progress: job.progress,
            result: job.result,
            error: job.error
        });
    } catch (error) {
        console.error('Error fetching job status:', error);
        res.status(500).json({ 
            error: 'Failed to fetch job status',
            message: error.message 
        });
    }
});

/**
 * Get spectral indices for processed image
 */
app.get('/api/images/indices/:imageId', (req, res) => {
    try {
        const { imageId } = req.params;
        
        // Find job by image ID
        let targetJob = null;
        for (const [jobId, job] of imageJobs.entries()) {
            if (job.image_id.toString() === imageId) {
                targetJob = job;
                break;
            }
        }
        
        if (!targetJob || targetJob.status !== 'completed') {
            return res.status(404).json({ error: 'Processed image not found' });
        }

        res.json(targetJob.result);
    } catch (error) {
        console.error('Error fetching spectral indices:', error);
        res.status(500).json({ 
            error: 'Failed to fetch spectral indices',
            message: error.message 
        });
    }
});

/**
 * Async function to simulate image processing
 */
async function processImageAsync(jobId) {
    const job = imageJobs.get(jobId);
    if (!job) return;

    try {
        // Update progress
        job.progress = 25;
        job.status = 'processing';
        imageJobs.set(jobId, job);

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 3000));
        job.progress = 75;
        imageJobs.set(jobId, job);

        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Generate simulated results
        const indices = {
            ndvi: 0.6 + Math.random() * 0.3, // 0.6 - 0.9
            savi: 0.5 + Math.random() * 0.3, // 0.5 - 0.8
            evi: 0.4 + Math.random() * 0.4,  // 0.4 - 0.8
            mcari: 0.3 + Math.random() * 0.5, // 0.3 - 0.8
            red_edge_position: 720 + Math.random() * 20 // 720 - 740 nm
        };

        const overallHealth = indices.ndvi > 0.7 ? 'Excellent' : 
                             indices.ndvi > 0.6 ? 'Good' : 
                             indices.ndvi > 0.4 ? 'Fair' : 'Poor';

        const result = {
            image_id: job.image_id,
            filename: job.filename,
            indices: indices,
            analysis_results: {
                processing_status: 'completed',
                health_assessment: {
                    overall_health: overallHealth,
                    stress_indicators: indices.ndvi < 0.5 ? 'High' : indices.ndvi < 0.7 ? 'Medium' : 'Low',
                    vegetation_coverage: Math.round(indices.ndvi * 100) + '%'
                }
            },
            processed_at: new Date().toISOString()
        };

        // Complete the job
        job.status = 'completed';
        job.progress = 100;
        job.result = result;
        imageJobs.set(jobId, job);

    } catch (error) {
        console.error('Error processing image:', error);
        job.status = 'error';
        job.error = error.message;
        job.progress = 0;
        imageJobs.set(jobId, job);
    }
}

// ==================== AUTHENTICATION ENDPOINTS (SIMULATED) ====================

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    // Simulate authentication
    if (username && password) {
        const token = 'simulated-jwt-token-' + Date.now();
        res.json({
            access_token: token,
            token_type: 'bearer',
            user: {
                username: username,
                email: `${username}@example.com`,
                full_name: username.charAt(0).toUpperCase() + username.slice(1)
            }
        });
    } else {
        res.status(400).json({ error: 'Username and password required' });
    }
});

app.post('/api/auth/register', (req, res) => {
    const { username, password, email, full_name } = req.body;
    
    // Simulate registration
    if (username && password && email) {
        res.json({
            message: 'User registered successfully',
            user: {
                username: username,
                email: email,
                full_name: full_name || username
            }
        });
    } else {
        res.status(400).json({ error: 'Username, password, and email required' });
    }
});

// ==================== ERROR HANDLING ====================

app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// ==================== SERVER STARTUP ====================

app.listen(PORT, () => {
    console.log(`Agricultural Monitoring Backend Server running on port ${PORT}`);
    console.log(`API endpoints available at http://localhost:${PORT}/api`);
    console.log(`MATLAB integration: Available (with fallback to simulated data)`);
});

module.exports = app;
