const http = require('http');
const fs = require('fs');
const path = require('path');

// Ensure local images/ directory exists
const targetDir = path.join(__dirname, 'images');
if (!fs.existsSync(targetDir)) {
    try {
        fs.mkdirSync(targetDir, { recursive: true });
        console.log('Created local images/ directory.');
    } catch (mkdirErr) {
        console.error('Error creating images directory:', mkdirErr);
    }
}


// Allow port to be specified via command line argument, env variable, or default to 8080
const portArg = process.argv[2];
const PORT = portArg ? parseInt(portArg, 10) : (process.env.PORT ? parseInt(process.env.PORT, 10) : 8080);

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.pdf': 'application/pdf'
};

const server = http.createServer((req, res) => {
    // Resolve clean path
    let decodedUrl;
    try {
        decodedUrl = decodeURIComponent(req.url);
    } catch (e) {
        decodedUrl = req.url;
    }
    
    // Strip query parameters
    const urlPath = decodedUrl.split('?')[0];
    let filePath = path.join(__dirname, urlPath === '/' ? 'index.html' : urlPath);
    
    // Prevent path traversal
    const relative = path.relative(__dirname, filePath);
    const isSafe = relative && !relative.startsWith('..') && !path.isAbsolute(relative);
    
    if (filePath !== __dirname && !isSafe) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Forbidden - Access Denied');
        return;
    }

    fs.stat(filePath, (err, stats) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('404 Not Found - File does not exist');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end(`500 Internal Server Error: ${err.code}`);
            }
            return;
        }

        // If it's a directory, serve index.html within it
        if (stats.isDirectory()) {
            filePath = path.join(filePath, 'index.html');
        }

        const extname = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[extname] || 'application/octet-stream';

        fs.readFile(filePath, (error, content) => {
            if (error) {
                res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end(`500 Internal Server Error: ${error.code}`);
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content);
            }
        });
    });
});

server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Retrying on port ${PORT + 1}...`);
        setTimeout(() => {
            server.close();
            // Try next port
            process.argv[2] = PORT + 1;
            // Spawn/run server again or just re-listen
            startServer(PORT + 1);
        }, 1000);
    } else {
        console.error('Server error:', e);
    }
});

function startServer(portToListen) {
    server.listen(portToListen, () => {
        console.log(`Server is running at: http://localhost:${portToListen}/`);
        console.log(`Serving files from: ${__dirname}`);
        console.log(`Press Ctrl+C to stop the server.`);
    });
}

startServer(PORT);
