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

// Simulated data without MATLAB dependency
const createSimulatedDashboardData = () => {
    return {
        crop_health: {
            status: 'Good',
            ndvi: 0.72,
            confidence: 78
        },
        soil_moisture: {
            value: 42,
            unit: '%',
            status: 'optimal',
            last_updated: new Date().toISOString()
        },
        pest_risk: {
            level: 'low',
            confidence: 88,
            detected_pests: []
        },
        irrigation_advice: {
            recommendation: 'Maintain',
            status: 'good',
            reason: 'Soil moisture levels are optimal'
        },
        weather: {
            temperature: 26,
            humidity: 62,
            last_updated: new Date().toISOString()
        },
        field_info: {
            id: 1,
            name: 'Demo Field',
            crop_type: 'Mixed Crops',
            area_hectares: 35
        }
    };
};

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        service: 'Agricultural Monitoring Backend (Simplified)'
    });
});

// Dashboard summary
app.get('/api/dashboard/summary', (req, res) => {
    console.log('Dashboard summary requested');
    res.json(createSimulatedDashboardData());
});

// Trends data  
app.get('/api/trends/:fieldId?', (req, res) => {
    console.log('Trends requested for field:', req.params.fieldId || 1);
    
    const data = [];
    for (let i = 7; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        data.push({
            timestamp: date.toISOString(),
            value: 25 + Math.random() * 15
        });
    }
    
    res.json({
        field_id: parseInt(req.params.fieldId || 1),
        trends: {
            soil_moisture: data,
            air_temperature: data.map(d => ({ ...d, value: 22 + Math.random() * 8 })),
            humidity: data.map(d => ({ ...d, value: 55 + Math.random() * 25 })),
            ndvi: data.map(d => ({ ...d, value: 0.6 + Math.random() * 0.25 }))
        }
    });
});

// Error handling
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start server with error handling
try {
    const server = app.listen(PORT, '127.0.0.1', () => {
        console.log(`Simplified server running on port ${PORT}`);
        console.log(`Test health endpoint: http://localhost:${PORT}/api/health`);
    });
    
    server.on('error', (error) => {
        console.error('Server error:', error);
        if (error.code === 'EADDRINUSE') {
            console.error(`Port ${PORT} is already in use. Please stop other processes or use a different port.`);
        }
    });
} catch (error) {
    console.error('Failed to start server:', error);
}

process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled rejection at:', promise, 'reason:', reason);
});

module.exports = app;
