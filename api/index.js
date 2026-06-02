const express = require('express');
const path = require('path');

const app = express();

// Serve static files from parent directory
const rootDir = path.join(__dirname, '..');
app.use(express.static(rootDir));

// Catch-all - serve index.html for root and return 404 for others
app.get('*', (req, res) => {
    const filePath = path.join(rootDir, req.path);
    const indexPath = path.join(rootDir, 'index.html');
    
    // Check if we're trying to access root
    if (req.path === '/') {
        return res.sendFile(indexPath);
    }
    
    // For all other paths, try to serve the file
    // If it doesn't exist, check if it's meant to be a nav to index
    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).send('404 Not Found');
        }
    });
});

module.exports = app;
