import { createProxyMiddleware, type RequestHandler, type Options } from 'http-proxy-middleware';
import { type Request, type Response, type NextFunction } from 'express';
import { log } from './vite';

// Extended options interface for our proxy
interface ProxyOptions extends Options {
  target: string;
  pathRewrite?: (path: string, req: Request) => string;
}

// List of known problematic domains that might block proxy access
const KNOWN_BLOCKING_DOMAINS = [
  'www.netflix.com',
  'www.hulu.com',
  'www.amazon.com',
  'accounts.google.com'
];

// Create a proxy middleware factory function
export function createProxy(options: ProxyOptions): RequestHandler {
  // Extract target to avoid duplicate property
  const { target, ...restOptions } = options;
  
  const defaultOptions = {
    target, // Use target from options
    changeOrigin: true,
    secure: false, // Allow insecure SSL
    ws: false,
    followRedirects: true,
    onProxyReq: (proxyReq: any, req: Request, res: Response) => {
      try {
        // Add X-Forwarded headers
        proxyReq.setHeader('X-Forwarded-For', req.ip);
        
        // Modify user agent to avoid detection as a proxy
        const userAgent = req.get('User-Agent') || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
        proxyReq.setHeader('User-Agent', userAgent);
        
        // Add custom headers
        proxyReq.setHeader('X-Proxied-By', 'ProxyWave');
        
        // Add Accept headers for better compatibility
        proxyReq.setHeader('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
        proxyReq.setHeader('Accept-Language', 'en-US,en;q=0.5');
        
        // Add Referer for websites that check it
        if (req.headers.referer) {
          const refererURL = new URL(req.headers.referer);
          const targetURL = new URL(target);
          proxyReq.setHeader('Referer', `${targetURL.protocol}//${targetURL.host}/`);
        }
        
        // Log proxy request
        log(`Proxying request to ${target}${req.url}`, 'proxy');
      } catch (err) {
        log(`Error in onProxyReq: ${err}`, 'proxy-error');
      }
    },
    onProxyRes: (proxyRes: any, req: Request, res: Response) => {
      try {
        // Set CORS headers
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'X-Requested-With, Content-Type, Accept';
        
        // Remove headers that might reveal proxy usage
        delete proxyRes.headers['x-powered-by'];
        delete proxyRes.headers['server'];
        
        // Modify cookies to work with our domain
        if (proxyRes.headers['set-cookie']) {
          const cookies = proxyRes.headers['set-cookie'];
          proxyRes.headers['set-cookie'] = cookies.map((cookie: string) => {
            return cookie
              .replace(/Domain=[^;]+;/i, '')
              .replace(/Path=\//i, `Path=/proxy?url=${target}/`);
          });
        }
        
        // Set Content-Security-Policy to allow framing
        proxyRes.headers['content-security-policy'] = "frame-ancestors 'self'";
        proxyRes.headers['x-frame-options'] = 'SAMEORIGIN';
        
        // Check content type for HTML to apply link rewriting
        const contentType = proxyRes.headers['content-type'] || '';
        if (contentType.includes('text/html')) {
          log(`Received HTML content from ${target}`, 'proxy');
        } else {
          log(`Received non-HTML content (${contentType}) from ${target}`, 'proxy');
        }
      } catch (err) {
        log(`Error in onProxyRes: ${err}`, 'proxy-error');
      }
    },
    onError: (err: Error, req: Request, res: Response) => {
      log(`Proxy error for ${target}: ${err.message}`, 'proxy-error');
      
      if (!res.headersSent) {
        res.status(502).json({
          error: 'Proxy Error',
          message: `Failed to connect to the target website: ${err.message}`,
          url: target
        });
      }
    },
    ...restOptions
  };

  return createProxyMiddleware(defaultOptions) as unknown as RequestHandler;
}

// Middleware to handle URL rewriting and content transformation
export function rewriteLinksMiddleware(req: Request, res: Response, next: NextFunction) {
  const originalSend = res.send;
  
  // Override the send method to intercept and rewrite content
  res.send = function(body) {
    let modifiedBody = body;
    
    try {
      // Only modify HTML content
      if (typeof body === 'string' && res.getHeader('Content-Type')?.toString().includes('text/html')) {
        // Get base URL for the proxied site
        const targetUrl = req.query.url as string;
        if (!targetUrl) {
          return originalSend.call(this, body);
        }
        
        const proxyBasePath = `${req.protocol}://${req.get('host')}/proxy?url=`;
        const parsedUrl = new URL(targetUrl);
        const baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;
        
        // Rewrite absolute URLs
        modifiedBody = body.replace(
          /href=(["'])(https?:\/\/[^"']+)(["'])/gi, 
          (match, prefix, url, suffix) => `href=${prefix}${proxyBasePath}${encodeURIComponent(url)}${suffix}`
        );
        
        // Rewrite relative URLs for href
        modifiedBody = modifiedBody.replace(
          /href=(["'])(?!https?:\/\/)(?!javascript:)(?!data:)(?!#)([^"']+)(["'])/gi,
          (match, prefix, relativeUrl, suffix) => {
            // Handle root-relative URLs
            if (relativeUrl.startsWith('/')) {
              return `href=${prefix}${proxyBasePath}${encodeURIComponent(baseUrl + relativeUrl)}${suffix}`;
            }
            // Handle relative URLs
            return `href=${prefix}${proxyBasePath}${encodeURIComponent(new URL(relativeUrl, targetUrl).href)}${suffix}`;
          }
        );
        
        // Rewrite src attributes (images, scripts, etc.)
        modifiedBody = modifiedBody.replace(
          /src=(["'])(https?:\/\/[^"']+)(["'])/gi,
          (match, prefix, url, suffix) => `src=${prefix}${proxyBasePath}${encodeURIComponent(url)}${suffix}`
        );
        
        // Rewrite relative URLs for src
        modifiedBody = modifiedBody.replace(
          /src=(["'])(?!https?:\/\/)(?!data:)(?!#)([^"']+)(["'])/gi,
          (match, prefix, relativeUrl, suffix) => {
            // Handle root-relative URLs
            if (relativeUrl.startsWith('/')) {
              return `src=${prefix}${proxyBasePath}${encodeURIComponent(baseUrl + relativeUrl)}${suffix}`;
            }
            // Handle relative URLs
            return `src=${prefix}${proxyBasePath}${encodeURIComponent(new URL(relativeUrl, targetUrl).href)}${suffix}`;
          }
        );
        
        // Rewrite CSS @import and url() references
        modifiedBody = modifiedBody.replace(
          /@import\s+(?:url\()?["'](https?:\/\/[^"']+)["'](?:\))?/gi,
          (match, url) => `@import "${proxyBasePath}${encodeURIComponent(url)}"`
        );
        
        modifiedBody = modifiedBody.replace(
          /url\(["']?(https?:\/\/[^"'\)]+)["']?\)/gi,
          (match, url) => `url("${proxyBasePath}${encodeURIComponent(url)}")`
        );
        
        // Rewrite forms action URLs
        modifiedBody = modifiedBody.replace(
          /action=(["'])(https?:\/\/[^"']+)(["'])/gi,
          (match, prefix, url, suffix) => `action=${prefix}${proxyBasePath}${encodeURIComponent(url)}${suffix}`
        );
        
        // Add a base tag for proper path resolution if not exists
        if (!modifiedBody.includes('<base') && modifiedBody.includes('<head>')) {
          modifiedBody = modifiedBody.replace(
            /<head>/i, 
            `<head>
            <base href="${targetUrl}">
            <script>
            // Handle dynamic script loading through the proxy
            (function() {
              const originalCreateElement = document.createElement;
              document.createElement = function(tag) {
                const element = originalCreateElement.call(document, tag);
                
                if (tag.toLowerCase() === 'script') {
                  const originalSetAttribute = element.setAttribute;
                  element.setAttribute = function(name, value) {
                    if (name === 'src' && value && value.match(/^https?:\\/\\//)) {
                      value = '/proxy?url=' + encodeURIComponent(value);
                    }
                    return originalSetAttribute.call(this, name, value);
                  };
                }
                
                return element;
              };
            })();
            </script>`
          );
        }
        
        // Add a warning banner for sites that typically block proxies
        const hostname = new URL(targetUrl).hostname;
        if (KNOWN_BLOCKING_DOMAINS.includes(hostname)) {
          modifiedBody = modifiedBody.replace(
            /<body[^>]*>/i, 
            `$&<div style="position: fixed; top: 0; left: 0; width: 100%; background-color: #f8d7da; color: #721c24; padding: 10px; z-index: 9999; text-align: center; font-family: sans-serif;">
              ⚠️ Warning: This website (${hostname}) may not work correctly through a proxy due to security measures.
              <button onclick="this.parentNode.style.display='none'" style="margin-left: 10px; background: #721c24; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Dismiss</button>
            </div>`
          );
        }
      }
      
      return originalSend.call(this, modifiedBody);
    } catch (error) {
      log(`Error in rewriteLinksMiddleware: ${error}`, 'proxy-error');
      return originalSend.call(this, body);
    }
  };
  
  next();
}

// Proxy factory for handling dynamic targets
export function proxyRequestHandler(req: Request, res: Response, next: NextFunction) {
  const url = req.query.url as string;
  
  if (!url) {
    return res.status(400).json({ 
      error: 'Missing URL',
      message: 'URL parameter is required'
    });
  }
  
  try {
    // Create a URL object to validate the URL
    const targetUrl = new URL(url);
    
    // Check if URL uses supported protocol
    if (targetUrl.protocol !== 'http:' && targetUrl.protocol !== 'https:') {
      return res.status(400).json({
        error: 'Unsupported Protocol',
        message: `Protocol "${targetUrl.protocol}" is not supported. Only HTTP and HTTPS are allowed.`
      });
    }
    
    // Block accessing localhost/internal IPs for security
    const hostname = targetUrl.hostname;
    if (hostname === 'localhost' || 
        hostname === '127.0.0.1' || 
        hostname.startsWith('192.168.') || 
        hostname.startsWith('10.') || 
        hostname.startsWith('172.16.')) {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'Accessing internal/private networks is not allowed'
      });
    }
    
    // Add timeouts to prevent hanging connections
    const proxyOptions: ProxyOptions = {
      target: targetUrl.origin,
      pathRewrite: (path, proxyReq) => {
        // Replace the proxy path with the actual path from the URL
        return targetUrl.pathname + targetUrl.search;
      },
      onError: (err, proxyReq, proxyRes) => {
        log(`Proxy error for ${url}: ${err.message}`, 'proxy-error');
        
        if (!proxyRes.headersSent) {
          proxyRes.status(502).json({
            error: 'Proxy Error',
            message: `Failed to connect to ${targetUrl.host}: ${err.message}`,
            code: err.name
          });
        }
      }
    };
    
    // Check for known challenging websites
    if (KNOWN_BLOCKING_DOMAINS.includes(targetUrl.hostname)) {
      log(`Warning: Attempting to proxy a potentially blocking site: ${targetUrl.hostname}`, 'proxy');
    }
    
    // Create a proxy for this specific request
    const proxy = createProxy(proxyOptions);
    
    // Apply the proxy middleware
    return proxy(req, res, next);
  } catch (error) {
    // More descriptive error response
    return res.status(400).json({
      error: 'Invalid URL',
      message: `Could not parse "${url}" as a valid URL. ${error instanceof Error ? error.message : ''}`,
      suggestion: 'Make sure the URL includes the protocol (http:// or https://)'
    });
  }
}
