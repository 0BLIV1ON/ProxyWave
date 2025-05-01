import { createProxyMiddleware, type RequestHandler } from 'http-proxy-middleware';
import { type Request, type Response, type NextFunction } from 'express';
import { log } from './vite';

interface ProxyOptions {
  target: string;
  changeOrigin?: boolean;
  secure?: boolean;
  ws?: boolean;
  followRedirects?: boolean;
  onProxyReq?: (proxyReq: any, req: Request, res: Response) => void;
  onProxyRes?: (proxyRes: any, req: Request, res: Response) => void;
}

// Create a proxy middleware factory function
export function createProxy(options: ProxyOptions): RequestHandler {
  const defaultOptions: ProxyOptions = {
    target: options.target,
    changeOrigin: true,
    secure: false,
    ws: false,
    followRedirects: true,
    onProxyReq: (proxyReq, req, res) => {
      // Add X-Forwarded headers
      proxyReq.setHeader('X-Forwarded-For', req.ip);
      
      // Modify user agent to avoid detection as a proxy
      const userAgent = req.get('User-Agent') || 'Mozilla/5.0';
      proxyReq.setHeader('User-Agent', userAgent);
      
      // Add custom headers to track proxy usage
      proxyReq.setHeader('X-Proxied-By', 'ProxyWave');
      
      // Log proxy request
      log(`Proxying request to ${options.target}`, 'proxy');
    },
    onProxyRes: (proxyRes, req, res) => {
      // Set CORS headers
      proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
      proxyRes.headers['Access-Control-Allow-Headers'] = 'X-Requested-With, Content-Type, Accept';
      
      // Remove headers that might reveal proxy usage
      delete proxyRes.headers['X-Powered-By'];
      
      // Set Content-Security-Policy to allow framing
      proxyRes.headers['Content-Security-Policy'] = "frame-ancestors 'self'";
      proxyRes.headers['X-Frame-Options'] = 'SAMEORIGIN';
    },
    ...options
  };

  return createProxyMiddleware(defaultOptions);
}

// Middleware to handle URL rewriting and content transformation
export function rewriteLinksMiddleware(req: Request, res: Response, next: NextFunction) {
  const originalSend = res.send;
  
  // Override the send method to intercept and rewrite content
  res.send = function(body) {
    if (typeof body === 'string' && res.getHeader('Content-Type')?.toString().includes('text/html')) {
      // Rewrite all absolute URLs to go through our proxy
      const proxyBasePath = `${req.protocol}://${req.get('host')}/proxy?url=`;
      
      // Rewrite links, stylesheets, scripts, etc.
      // This is a simple approach - in production a more robust HTML parser would be used
      body = body.replace(
        /href=(["'])(https?:\/\/[^"']+)(["'])/g, 
        `href=$1${proxyBasePath}$2$3`
      );
      body = body.replace(
        /src=(["'])(https?:\/\/[^"']+)(["'])/g, 
        `src=$1${proxyBasePath}$2$3`
      );
      
      // Add a base tag to handle relative URLs
      if (!body.includes('<base')) {
        body = body.replace(
          /<head>/i, 
          `<head><base href="${req.query.url || '/'}">`
        );
      }
    }
    
    return originalSend.call(this, body);
  };
  
  next();
}

// Proxy factory for handling dynamic targets
export function proxyRequestHandler(req: Request, res: Response, next: NextFunction) {
  const url = req.query.url as string;
  
  if (!url) {
    return res.status(400).json({ message: 'URL parameter is required' });
  }
  
  try {
    // Create a URL object to validate the URL
    const targetUrl = new URL(url);
    
    // Create a proxy for this specific request
    const proxy = createProxy({
      target: targetUrl.origin,
      pathRewrite: (path) => {
        // Replace the proxy path with the actual path from the URL
        return targetUrl.pathname + targetUrl.search;
      }
    });
    
    // Apply the proxy middleware
    return proxy(req, res, next);
  } catch (error) {
    return res.status(400).json({ message: 'Invalid URL provided' });
  }
}
