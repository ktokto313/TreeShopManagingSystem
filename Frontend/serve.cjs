const http = require('http');
const handler = require('serve-handler');
const { createProxyMiddleware } = require('http-proxy-middleware');

const serverPort = process.env.SERVER_PORT || 8080;
const apiProxy = createProxyMiddleware({
  target: `http://app:${serverPort}`,
  changeOrigin: true,
});

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api')) {
    return apiProxy(req, res);
  }
  return handler(req, res, { 
    public: 'dist',
    rewrites: [
      { source: '**', destination: '/index.html' }
    ] 
   });
});

server.listen(3000, () => console.log('serving frontend on port 3000'));