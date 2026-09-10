import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev middleware to run serverless API functions during local development
function apiMiddlewarePlugin() {
  return {
    name: 'api-serverless-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && (req.url.startsWith('/api/send-whatsapp') || req.url.startsWith('/api/create-razorpay-order'))) {
          try {
            const endpoint = req.url.split('?')[0].replace('/api/', '');
            const modulePath = `./api/${endpoint}.js`;
            const { default: handler } = await import(modulePath);
            
            let body = {};
            if (req.method === 'POST') {
              const buffers = [];
              for await (const chunk of req) {
                buffers.push(chunk);
              }
              const raw = Buffer.concat(buffers).toString();
              if (raw) {
                try {
                  body = JSON.parse(raw);
                } catch (e) {
                  body = {};
                }
              }
            }
            req.body = body;

            const mockRes = {
              setHeader: (k, v) => res.setHeader(k, v),
              status: (code) => ({
                json: (data) => {
                  res.statusCode = code;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                },
                end: () => res.end()
              })
            };

            return await handler(req, mockRes);
          } catch (err) {
            console.error('Vite local API handler error:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err.message }));
            return;
          }
        }
        next();
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), apiMiddlewarePlugin()],
  server: {
    port: 3000,
    host: true
  }
})
