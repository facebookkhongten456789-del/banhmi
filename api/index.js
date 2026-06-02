const fs = require('fs');
const path = require('path');

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.pdf': 'application/pdf',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2'
};

module.exports = (req, res) => {
    try {
        // Parse URL
        let decodedUrl;
        try {
            decodedUrl = decodeURIComponent(req.url);
        } catch (e) {
            decodedUrl = req.url;
        }
        
        // Strip query parameters
        const urlPath = decodedUrl.split('?')[0];
        
        // Serve root as index.html
        let requestPath = urlPath === '/' ? 'index.html' : urlPath.replace(/^\//, '');
        
        // Build file path - go up one level from api directory to project root
        let filePath = path.join(__dirname, '..', requestPath);
        
        // Security check - prevent path traversal
        const relative = path.relative(path.join(__dirname, '..'), filePath);
        if (relative && relative.startsWith('..')) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            res.status(404).json({ error: 'File not found', path: requestPath });
            return;
        }
        
        // Check if it's a directory
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            // Try index.html in directory
            filePath = path.join(filePath, 'index.html');
            if (!fs.existsSync(filePath)) {
                res.status(404).json({ error: 'index.html not found in directory' });
                return;
            }
        }
        
        // Read and serve file
        const content = fs.readFileSync(filePath);
        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.status(200).send(content);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
};
