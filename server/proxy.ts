import { createProxyMiddleware, type RequestHandler, type Options } from 'http-proxy-middleware';
import { type Request, type Response, type NextFunction } from 'express';
import { log } from './vite';

// Custom options interface for our proxy
interface ContentFilterOptions {
  blockImages: boolean;
  blockScripts: boolean;
  blockAds: boolean;
  blockTrackers: boolean;
  blockPopups: boolean;
}

// Privacy features interface
interface PrivacyOptions {
  incognitoMode: boolean;
  useTor: boolean;
}

interface ProxyOptions {
  target: string;
  changeOrigin?: boolean;
  secure?: boolean;
  ws?: boolean;
  followRedirects?: boolean;
  pathRewrite?: (path: string, req: any) => string;
  onProxyReq?: (proxyReq: any, req: Request, res: Response) => void;
  onProxyRes?: (proxyRes: any, req: Request, res: Response) => void;
  onError?: (err: Error, req: Request, res: Response) => void;
  filterOptions?: ContentFilterOptions;
  privacyOptions?: PrivacyOptions;
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
  const { target, filterOptions, privacyOptions, ...restOptions } = options;
  
  // Ensure target uses HTTPS
  let secureTarget = target;
  if (secureTarget.startsWith('http://')) {
    secureTarget = secureTarget.replace('http://', 'https://');
    log(`Upgraded connection to SSL/TLS: ${secureTarget}`, 'proxy-security');
  }
  
  // Log filter options if provided
  if (filterOptions) {
    log(`Content filtering enabled: ${JSON.stringify(filterOptions)}`, 'proxy-filter');
  }
  
  // Log privacy options if provided
  if (privacyOptions) {
    log(`Privacy features enabled: ${JSON.stringify(privacyOptions)}`, 'proxy-privacy');
  }

  const defaultOptions = {
    target: secureTarget, // Use secure target
    changeOrigin: true,
    secure: true, // Enforce secure SSL/TLS connections
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
        
        // Get privacy options if any
        const privacyOptions = options.privacyOptions;
        
        // Apply privacy features if enabled
        if (privacyOptions) {
          // Handle incognito mode (strip cookies and prevent tracking)
          if (privacyOptions.incognitoMode) {
            log('Applying incognito mode privacy features', 'proxy-privacy');
            
            // Remove all cookies in incognito mode
            if (proxyRes.headers['set-cookie']) {
              proxyRes.headers['set-cookie'] = [];
              log('Stripped cookies for incognito browsing', 'proxy-privacy');
            }
            
            // Add cache control headers to prevent caching
            proxyRes.headers['cache-control'] = 'no-store, no-cache, must-revalidate, proxy-revalidate';
            proxyRes.headers['pragma'] = 'no-cache';
            proxyRes.headers['expires'] = '0';
            
            // Add Do Not Track header
            proxyRes.headers['dnt'] = '1';
            
            // Remove potential tracking headers
            delete proxyRes.headers['etag'];
            delete proxyRes.headers['last-modified'];
            
            // Add additional security headers for incognito
            proxyRes.headers['referrer-policy'] = 'no-referrer';
          }
          
          // Handle Tor routing simulation (add anonymity indicators)
          if (privacyOptions.useTor) {
            log('Applying Tor routing simulation', 'proxy-privacy');
            
            // Since we're simulating Tor routing, add educational headers
            proxyRes.headers['x-tor-simulation'] = 'active';
            
            // When Tor is enabled, we add stronger privacy headers
            proxyRes.headers['referrer-policy'] = 'no-referrer';
            proxyRes.headers['permissions-policy'] = 'geolocation=(), microphone=(), camera=(), payment=()';
            
            // Note: In a real implementation, this would actually route through Tor network
            // For now, we're just adding the headers to show the feature is "active"
          }
        }
        
        // Get filter options if any
        const filterOptions = options.filterOptions;
        
        // Apply content filters if options are provided
        if (filterOptions) {
          // Set Content-Security-Policy based on filter settings
          let cspDirectives = [];
          
          // Default source policy
          if (filterOptions.blockScripts) {
            cspDirectives.push("script-src 'none'");
          } else {
            cspDirectives.push("script-src * 'unsafe-inline' 'unsafe-eval'");
          }
          
          // Image policy
          if (filterOptions.blockImages) {
            cspDirectives.push("img-src 'none'");
          } else {
            cspDirectives.push("img-src * data: blob: 'unsafe-inline'");
          }
          
          // If blocking popups
          if (filterOptions.blockPopups) {
            cspDirectives.push("frame-src 'self'");
            cspDirectives.push("form-action 'self'");
          } else {
            cspDirectives.push("frame-src *");
            cspDirectives.push("form-action *");
          }
          
          // Default policy
          cspDirectives.push("default-src * 'unsafe-inline' 'unsafe-eval' data:");
          cspDirectives.push("frame-ancestors 'self'");
          
          // Set the constructed CSP header
          proxyRes.headers['content-security-policy'] = cspDirectives.join('; ');
          
          // If blocking trackers, remove common tracking cookies
          if (filterOptions.blockTrackers && proxyRes.headers['set-cookie']) {
            const trackingCookiePatterns = [
              /^_ga/, /^_gid/, /^_gat/, // Google Analytics
              /^_fbp/, /^_fbc/,         // Facebook
              /^_ym/, /^yandex/,        // Yandex
              /^__utm/,                 // Various UTM tracking
              /^optimizely/,            // Optimizely
              /^hubspot/,               // HubSpot
              /^intercom/               // Intercom
            ];
            
            proxyRes.headers['set-cookie'] = proxyRes.headers['set-cookie'].filter((cookie: string) => {
              // Keep the cookie if it doesn't match any tracking pattern
              return !trackingCookiePatterns.some(pattern => pattern.test(cookie));
            });
          }
          
          // Log application of filters
          log(`Applied content filters: ${JSON.stringify(filterOptions)}`, 'proxy-filter');
        } else {
          // Default CSP when no filters are applied
          proxyRes.headers['content-security-policy'] = 
            "default-src * 'unsafe-inline' 'unsafe-eval' data:; " +
            "img-src * data: blob: 'unsafe-inline'; " + 
            "frame-ancestors 'self'";
        }
          
        // Remove X-Frame-Options to allow our own framing
        delete proxyRes.headers['x-frame-options'];
        
        // Set our own frame options
        proxyRes.headers['x-frame-options'] = 'SAMEORIGIN';
        
        // Check content type for HTML to apply link rewriting
        const contentType = proxyRes.headers['content-type'] || '';
        log(`Response headers: ${JSON.stringify(proxyRes.headers)}`, 'proxy-debug');
        
        // Check if we should block this content type based on filter settings
        if (filterOptions) {
          // Block images if that option is enabled
          if (filterOptions.blockImages && contentType.includes('image/')) {
            log(`Blocking image content due to filter settings: ${req.url}`, 'proxy-filter');
            res.status(403).send('Content blocked by filter settings');
            return;
          }
          
          // Block scripts if that option is enabled
          if (filterOptions.blockScripts && 
             (contentType.includes('javascript') || contentType.includes('application/js'))) {
            log(`Blocking script content due to filter settings: ${req.url}`, 'proxy-filter');
            res.status(403).send('Content blocked by filter settings');
            return;
          }
          
          // Block ads if that option is enabled (simple check based on URL patterns)
          if (filterOptions.blockAds) {
            const adPatterns = ['/ad/', '/ads/', '/adserver/', '/banner/', '/sponsor/', 
                              'pagead', 'googleads', 'doubleclick.net', 'adnxs.com'];
            const url = req.url || '';
            if (adPatterns.some(pattern => url.includes(pattern))) {
              log(`Blocking ad content due to filter settings: ${req.url}`, 'proxy-filter');
              res.status(403).send('Content blocked by filter settings');
              return;
            }
          }
        }
        
        // Log content type if not blocked
        if (contentType.includes('text/html')) {
          log(`Received HTML content from ${target}`, 'proxy');
        } else if (contentType.includes('image/')) {
          log(`Received image content: ${contentType} from ${req.url}`, 'proxy');
        } else {
          log(`Received content: (${contentType}) from ${target} ${req.url}`, 'proxy');
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
          (match: string, prefix: string, url: string, suffix: string): string => 
            `href=${prefix}${proxyBasePath}${encodeURIComponent(url)}${suffix}`
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
          (match, prefix, url, suffix) => {
            // Make sure we're properly encoding the URL
            const encodedUrl = encodeURIComponent(url);
            return `src=${prefix}${proxyBasePath}${encodedUrl}${suffix}`;
          }
        );
        
        // Fix for src attributes with relative paths
        modifiedBody = modifiedBody.replace(
          /src=(["'])(?!https?:\/\/)(?!data:)(?!#)([^"']+)(["'])/gi,
          (match, prefix, relativeUrl, suffix) => {
            try {
              // Handle root-relative URLs (starting with /)
              if (relativeUrl.startsWith('/')) {
                const absoluteUrl = baseUrl + relativeUrl;
                return `src=${prefix}${proxyBasePath}${encodeURIComponent(absoluteUrl)}${suffix}`;
              }
              
              // Handle fully relative URLs (no leading /)
              const fullUrl = new URL(relativeUrl, targetUrl).href;
              return `src=${prefix}${proxyBasePath}${encodeURIComponent(fullUrl)}${suffix}`;
            } catch (e) {
              // If we can't parse the URL, leave it as is
              log(`Error rewriting URL ${relativeUrl}: ${e}`, 'proxy-error');
              return match;
            }
          }
        );
        
        // Special handling for image URLs using the direct image proxy endpoint
        modifiedBody = modifiedBody.replace(
          /<img[^>]+>/gi,
          (imgTag) => {
            // Log the original image tag
            log(`Processing img tag: ${imgTag}`, 'proxy-debug');
            
            // Make sure all img tags have proper proxied src attributes using our dedicated image-proxy
            // This bypasses the regular proxy mechanism for better image handling
            return imgTag.replace(
              /src=(["'])([^"']+)(["'])/gi,
              (srcMatch, srcPrefix, imgUrl, srcSuffix) => {
                try {
                  // Skip data URLs and anchors
                  if (imgUrl.startsWith('data:') || imgUrl.startsWith('#')) {
                    return srcMatch;
                  }
                  
                  let fullImageUrl = '';
                  
                  // Handle absolute URLs
                  if (imgUrl.match(/^https?:\/\//i)) {
                    fullImageUrl = imgUrl;
                  }
                  // Handle root-relative URLs
                  else if (imgUrl.startsWith('/')) {
                    fullImageUrl = baseUrl + imgUrl;
                  }
                  // Handle relative URLs
                  else {
                    fullImageUrl = new URL(imgUrl, targetUrl).href;
                  }
                  
                  // Use our dedicated image proxy endpoint instead
                  return `src=${srcPrefix}/image-proxy?url=${encodeURIComponent(fullImageUrl)}${srcSuffix}`;
                } catch (e) {
                  // If URL parsing fails, leave as is
                  log(`Error rewriting image URL ${imgUrl}: ${e}`, 'proxy-error');
                  return srcMatch;
                }
              }
            );
          }
        );
        
        // Add inline style to show image URLs in case they're not loading
        modifiedBody = modifiedBody.replace(
          /<img([^>]*)>/gi,
          (match, attributes) => {
            return `<img${attributes} onerror="console.error('Failed to load image:', this.src); this.style.border='1px solid red'; this.style.padding='5px'; this.title=this.src;">`;
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
  
  // Extract content filter settings from query parameters
  const blockImages = req.query.blockImages === 'true';
  const blockScripts = req.query.blockScripts === 'true';
  const blockAds = req.query.blockAds === 'true';
  const blockTrackers = req.query.blockTrackers === 'true';
  const blockPopups = req.query.blockPopups === 'true';
  
  // Log filter settings if any are enabled
  if (blockImages || blockScripts || blockAds || blockTrackers || blockPopups) {
    log(`Content filter settings - Images: ${blockImages}, Scripts: ${blockScripts}, Ads: ${blockAds}, Trackers: ${blockTrackers}, Popups: ${blockPopups}`, 'proxy-filter');
  }
  
  if (!url) {
    return res.status(400).json({ 
      error: 'Missing URL',
      message: 'URL parameter is required'
    });
  }
  
  try {
    // Create a URL object to validate the URL
    let targetUrl = new URL(url);
    
    // Check if URL uses supported protocol
    if (targetUrl.protocol !== 'http:' && targetUrl.protocol !== 'https:') {
      return res.status(400).json({
        error: 'Unsupported Protocol',
        message: `Protocol "${targetUrl.protocol}" is not supported. Only HTTP and HTTPS are allowed.`
      });
    }
    
    // Force HTTPS for security
    if (targetUrl.protocol === 'http:') {
      targetUrl = new URL(targetUrl.href.replace('http:', 'https:'));
      log(`Upgraded connection to SSL/TLS: ${targetUrl.href}`, 'proxy-security');
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
    
    // Add content filter settings if any are enabled
    const filterOptions: ContentFilterOptions = {
      blockImages: req.query.blockImages === 'true',
      blockScripts: req.query.blockScripts === 'true',
      blockAds: req.query.blockAds === 'true',
      blockTrackers: req.query.blockTrackers === 'true',
      blockPopups: req.query.blockPopups === 'true'
    };
    
    // Only add filter options if at least one is enabled
    if (Object.values(filterOptions).some(value => value === true)) {
      proxyOptions.filterOptions = filterOptions;
    }
    
    // Add privacy options if any are enabled
    const privacyOptions: PrivacyOptions = {
      incognitoMode,
      useTor
    };
    
    // Only add privacy options if at least one is enabled
    if (incognitoMode || useTor) {
      proxyOptions.privacyOptions = privacyOptions;
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
