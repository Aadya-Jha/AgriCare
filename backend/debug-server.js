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

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString()
    });
});

// Dashboard summary with correct structure
app.get('/api/dashboard/summary', async (req, res) => {
    try {
        console.log('Dashboard summary requested');
        res.json({
            crop_health: {
                status: 'Good',
                ndvi: 0.75,
                confidence: 75
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
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Trends data
app.get('/api/trends/:fieldId?', async (req, res) => {
    try {
        console.log('Trends requested for field:', req.params.fieldId || 1);
        
        // Generate simple trend data
        const data = [];
        for (let i = 7; i >= 0; i--) {
            const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            data.push({
                timestamp: date.toISOString(),
                value: 30 + Math.random() * 20
            });
        }
        
        res.json({
            field_id: parseInt(req.params.fieldId || 1),
            trends: {
                soil_moisture: data,
                air_temperature: data.map(d => ({ ...d, value: 20 + Math.random() * 10 })),
                humidity: data.map(d => ({ ...d, value: 50 + Math.random() * 30 })),
                ndvi: data.map(d => ({ ...d, value: 0.5 + Math.random() * 0.3 }))
            }
        });
    } catch (error) {
        console.error('Trends error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Debug server running on port ${PORT}`);
    console.log(`Test at: http://localhost:${PORT}/api/health`);
}).on('error', (error) => {
    console.error('Server error:', error);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled rejection at:', promise, 'reason:', reason);
});
