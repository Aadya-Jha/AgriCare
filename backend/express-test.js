console.log('Testing Express...');
try {
    const express = require('express');
    console.log('Express loaded successfully');
    
    const app = express();
    console.log('Express app created');
    
    app.get('/', (req, res) => {
        res.send('Hello World');
    });
    
    console.log('Route registered');
    
    const server = app.listen(3001, () => {
        console.log('Server started on port 3001');
    });
    
    server.on('error', (error) => {
        console.error('Server error:', error);
    });
    
} catch (error) {
    console.error('Error:', error);
}
