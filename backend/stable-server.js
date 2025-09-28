const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        service: 'Agricultural Monitoring Backend'
    });
});

// Dashboard summary endpoint
app.get('/api/dashboard/summary', (req, res) => {
    try {
        console.log('Dashboard summary requested');
        
        const summaryData = {
            crop_health: {
                status: 'Good',
                ndvi: 0.75,
                confidence: 78
            },
            soil_moisture: {
                value: 45,
                unit: '%',
                status: 'optimal',
                last_updated: new Date().toISOString()
            },
            pest_risk: {
                level: 'low',
                confidence: 85,
                detected_pests: []
            },
            irrigation_advice: {
                recommendation: 'Maintain',
                status: 'good',
                reason: 'Soil moisture levels are optimal'
            },
            weather: {
                temperature: 28,
                humidity: 65,
                last_updated: new Date().toISOString()
            },
            field_info: {
                id: 1,
                name: 'Demo Field',
                crop_type: 'Wheat',
                area_hectares: 25
            }
        };
        
        res.json(summaryData);
    } catch (error) {
        console.error('Dashboard summary error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard summary' });
    }
});

// Trends endpoint for charts
app.get('/api/dashboard/trends', (req, res) => {
    try {
        const fieldId = req.query.field_id || 1;
        console.log('Trends requested for field:', fieldId);
        
        // Generate trend data for the last 7 days
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            data.push({
                timestamp: date.toISOString(),
                soil_moisture: 30 + Math.random() * 20,
                air_temperature: 20 + Math.random() * 10,
                humidity: 50 + Math.random() * 30,
                ndvi: 0.5 + Math.random() * 0.3
            });
        }
        
        res.json({
            field_id: parseInt(fieldId),
            trends: {
                soil_moisture: data.map(d => ({ timestamp: d.timestamp, value: d.soil_moisture })),
                air_temperature: data.map(d => ({ timestamp: d.timestamp, value: d.air_temperature })),
                humidity: data.map(d => ({ timestamp: d.timestamp, value: d.humidity })),
                ndvi: data.map(d => ({ timestamp: d.timestamp, value: d.ndvi }))
            }
        });
    } catch (error) {
        console.error('Trends error:', error);
        res.status(500).json({ error: 'Failed to fetch trends data' });
    }
});

// Legacy trends endpoint (for compatibility)
app.get('/api/trends/:fieldId?', (req, res) => {
    try {
        const fieldId = req.params.fieldId || 1;
        console.log('Legacy trends requested for field:', fieldId);
        
        // Generate trend data
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            data.push({
                timestamp: date.toISOString(),
                value: 25 + Math.random() * 15
            });
        }
        
        res.json({
            field_id: parseInt(fieldId),
            trends: {
                soil_moisture: data,
                air_temperature: data.map(d => ({ ...d, value: 22 + Math.random() * 8 })),
                humidity: data.map(d => ({ ...d, value: 55 + Math.random() * 25 })),
                ndvi: data.map(d => ({ ...d, value: 0.6 + Math.random() * 0.25 }))
            }
        });
    } catch (error) {
        console.error('Legacy trends error:', error);
        res.status(500).json({ error: 'Failed to fetch trends data' });
    }
});

// Error handling middleware
app.use((req, res) => {
    console.log(`404 - Route not found: ${req.method} ${req.url}`);
    res.status(404).json({ error: 'Endpoint not found' });
});

app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
    });
});

// Server startup with graceful shutdown handling
let server;

function startServer() {
    server = app.listen(PORT, '127.0.0.1', () => {
        console.log(`✅ Agricultural Monitoring Backend Server running on port ${PORT}`);
        console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
        console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
        console.log(`📊 Dashboard: http://localhost:${PORT}/api/dashboard/summary`);
    });
    
    server.on('error', (error) => {
        console.error('Server error:', error);
        if (error.code === 'EADDRINUSE') {
            console.error(`Port ${PORT} is already in use. Trying to restart...`);
            setTimeout(() => {
                server.close();
                startServer();
            }, 1000);
        }
    });
    
    return server;
}

// Graceful shutdown handling
function gracefulShutdown(signal) {
    console.log(`\n${signal} received. Starting graceful shutdown...`);
    
    if (server) {
        server.close((err) => {
            if (err) {
                console.error('Error during server close:', err);
                process.exit(1);
            }
            console.log('HTTP server closed.');
            process.exit(0);
        });
        
        // Force close after 10 seconds
        setTimeout(() => {
            console.log('Forcing process exit after timeout');
            process.exit(1);
        }, 10000);
    } else {
        process.exit(0);
    }
}

// Handle various termination signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGQUIT', () => gracefulShutdown('SIGQUIT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('UNHANDLED_REJECTION');
});

// Start the server
console.log('🚀 Starting Agricultural Monitoring Backend...');
startServer();

module.exports = app;
