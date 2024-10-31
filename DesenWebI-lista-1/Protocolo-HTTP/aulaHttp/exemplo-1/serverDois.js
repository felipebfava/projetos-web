const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify({ message: 'Hello World' }));
    res.end();
});

server.listen(5000, () => {
    console.log('Server is running on http://localhost:5000');
});