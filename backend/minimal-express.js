console.log('Step 1: Starting script');

try {
    console.log('Step 2: Requiring express');
    const express = require('express');
    console.log('Step 3: Express loaded successfully');

    console.log('Step 4: Creating Express app');
    const app = express();
    console.log('Step 5: Express app created');

    console.log('Step 6: Setting up basic route');
    app.get('/api/health', (req, res) => {
        console.log('Health check requested');
        res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });
    console.log('Step 7: Route configured');

    console.log('Step 8: Starting server...');
    const server = app.listen(3002, '127.0.0.1', () => {
        console.log('SUCCESS: Server started on port 3002');
        console.log('Try: http://localhost:3002/api/health');
    });

    server.on('error', (error) => {
        console.error('SERVER ERROR:', error);
    });

    server.on('close', () => {
        console.log('Server closed event');
    });

    console.log('Step 9: Setup complete, waiting for connections...');

} catch (error) {
    console.error('CATCH ERROR:', error);
    console.error('Stack trace:', error.stack);
}

process.on('exit', (code) => {
    console.log(`Process exit event with code: ${code}`);
});

process.on('SIGINT', () => {
    console.log('SIGINT received but ignoring for debugging');
    // Ignore SIGINT to prevent automatic shutdown
});

process.on('SIGTERM', () => {
    console.log('SIGTERM received');
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    console.error('UNCAUGHT EXCEPTION:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION at:', promise, 'reason:', reason);
});

console.log('All event handlers set up');
