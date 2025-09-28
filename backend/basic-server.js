const http = require('http');

console.log('Creating basic HTTP server...');

const server = http.createServer((req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.url === '/api/health') {
        res.writeHead(200);
        res.end(JSON.stringify({ 
            status: 'healthy', 
            timestamp: new Date().toISOString(),
            server: 'Basic Node.js HTTP Server'
        }));
    } else if (req.url === '/api/dashboard/summary') {
        res.writeHead(200);
        res.end(JSON.stringify({
            crop_health: { status: 'Good', ndvi: 0.75, confidence: 80 },
            soil_moisture: { value: 45, unit: '%', status: 'optimal' },
            weather: { temperature: 28, humidity: 65 }
        }));
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not found' }));
    }
});

server.on('error', (error) => {
    console.error('Server error:', error);
});

server.listen(3001, '127.0.0.1', () => {
    console.log('Basic server running on port 3001');
    console.log('Try: http://localhost:3001/api/health');
});

process.on('SIGINT', () => {
    console.log('\nReceived SIGINT. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
});

console.log('Server setup complete');
