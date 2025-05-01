import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { proxyRequestHandler, rewriteLinksMiddleware } from "./proxy";
import { urlSchema } from "@shared/schema";
import { ZodError } from "zod";
import axios from "axios";
import { log } from "./vite";

export async function registerRoutes(app: Express): Promise<Server> {
  // API prefix for all routes
  const apiPrefix = "/api";
  
  // Endpoint to download browser extension zip file
  app.get(`${apiPrefix}/extension/download`, (req, res) => {
    const extensionData = Buffer.from("UEsDBAoAAAAAAOJbeFYAAAAAAAAAAAAAAAANAAAAcHJveHl3YXZlLWV4dC9QSwMECgAAAAAA4lt4VgAAAAAAAAAAAAAAABQAAABwcm94eXdhdmUtZXh0L2ljb25zL1BLAwQKAAAAAADiW3hWAAAAAAAAAAAAAAAAGQAAAHByb3h5d2F2ZS1leHQvaWNvbnMvaWNvbi5QSwMECgAAAAAA4lt4VgAAAAAAAAAAAAAAACEAAABwcm94eXdhdmUtZXh0L2ljb25zL2ljb25fMTI4LnBuZ1BLAwQKAAAAAADiW3hWAAAAAAAAAAAAAAAAIAAAAHByb3h5d2F2ZS1leHQvaWNvbnMvaWNvbl8xNi5wbmdQSwMECgAAAAAA4lt4VgAAAAAAAAAAAAAAACAAAABwcm94eXdhdmUtZXh0L2ljb25zL2ljb25fNDgucG5nUEsDBBQAAAAIAOJbeFaDQzqrugAAADIBAAATAAAAcHJveHl3YXZlLWV4dC9tYW5pZmVzdC5qc29ue2NocgAAAG1hbmlmZXN0X3ZlcnNpb24iOiAzLCAibmFtZSI6ICJQcm94eVdhdmUgQnJvd3NlciBFeHRlbnNpb24iLCAidmVyc2lvbiI6ICIxLjAiLCAiZGVzY3JpcHRpb24iOiAiRWFzaWx5IGFjY2VzcyB3ZWJzaXRlcyB1c2luZyBQcm94eVdhdmUgcHJveHkgc2VydmljZSIsICJpY29ucyI6IHsgIjE2IjogImljb25zL2ljb25fMTYucG5nIiwgIjQ4IjogImljb25zL2ljb25fNDgucG5nIiwgIjEyOCI6ICJpY29ucy9pY29uXzEyOC5wbmciIH0sICJhY3Rpb24iOiB7ICJkZWZhdWx0X2ljb24iOiAiaWNvbnMvaWNvbl8xNi5wbmciLCAiZGVmYXVsdF90aXRsZSI6ICJQcm94eVdhdmUiIH0sICJwZXJtaXNzaW9ucyI6IFsidGFicyIsICJhY3RpdmVUYWIiLCAic3RvcmFnZSJdLCAiYmFja2dyb3VuZCI6IHsgInNjcmlwdHMiOiBbImJhY2tncm91bmQuanMiXSwgInBlcnNpc3RlbnQiOiBmYWxzZSB9fVBLAwQUAAAACADiW3hW1oUxBiAAAABiAAAAFgAAAHByb3h5d2F2ZS1leHQvYmFja2dyb3VuZC5qc2VjaHIAAABjaHJvbWUuYWN0aW9uLm9uQ2xpY2tlZC5hZGRMaXN0ZW5lcihmdW5jdGlvbigpIHsgY2hyb21lLnRhYnMuY3JlYXRlKHsgdXJsOiAiaHR0cHM6Ly9wcm94eXdhdmUucmVwbGl0LmFwcCIgfSk7IH0pO1BLAQIUAAoAAAAAAOJbeFYAAAAAAAAAAAAAAAANAAAAAAAAAAAAAAAAAAAAAHByb3h5d2F2ZS1leHQvUEsBAhQACgAAAAAA4lt4VgAAAAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAdAAAcHJveHl3YXZlLWV4dC9pY29ucy9QSwECFAAKAAAAAADiW3hWAAAAAAAAAAAAAAAAGQAAAAAAAAAAAAAAAACyAABwcm94eXdhdmUtZXh0L2ljb25zL2ljb24uUEsBAhQACgAAAAAA4lt4VgAAAAAAAAAAAAAAACEAAAAAAAAAAAAAAAAA5wAAcHJveHl3YXZlLWV4dC9pY29ucy9pY29uXzEyOC5wbmdQSwECFAAKAAAAAADiW3hWAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAmAQBwcm94eXdhdmUtZXh0L2ljb25zL2ljb25fMTYucG5nUEsBAhQACgAAAAAA4lt4VgAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAZAEAcHJveHl3YXZlLWV4dC9pY29ucy9pY29uXzQ4LnBuZ1BLAQIUABQAAAAIAOJbeFaDQzqrugAAADIBAAATAAAAAAAAAAAAAAAAAKIBAHByb3h5d2F2ZS1leHQvbWFuaWZlc3QuanNvblBLAQIUABQAAAAIAOJbeFbWhTEGIAAAAGIAAAAWAAAAAAAAAAAAAAAAAMkCAHByb3h5d2F2ZS1leHQvYmFja2dyb3VuZC5qc1BLBQYAAAAACAAIAMwCAAA3AwAAAAA=", "base64");
    
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", "attachment; filename=proxywave-extension.zip");
    res.send(extensionData);
  });
  
  // Handle website history - get recent websites
  app.get(`${apiPrefix}/websites/recent`, async (req, res) => {
    try {
      const userId = req.session?.userId;
      const recentWebsites = await storage.getRecentWebsites(userId);
      
      res.json(recentWebsites);
    } catch (error) {
      console.error("Error fetching recent websites:", error);
      res.status(500).json({ message: "Failed to fetch recent websites" });
    }
  });
  
  // Handle URL validation and proxy request
  app.get(`${apiPrefix}/proxy`, async (req, res) => {
    try {
      // Validate the URL
      const { url } = urlSchema.parse({ url: req.query.url });
      
      // If it's not a URL but a search query, redirect to search engine
      if (!url.includes('://') && !url.startsWith('www.')) {
        const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(url)}`;
        return res.json({ url: searchUrl });
      }
      
      // Normalize the URL
      let normalizedUrl = url;
      if (!url.match(/^https?:\/\//)) {
        normalizedUrl = `http://${url}`;
      }
      
      // Send the normalized URL back to the client
      res.json({ url: normalizedUrl });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: error.errors[0]?.message || "Invalid URL provided" 
        });
      }
      
      res.status(500).json({ message: "Server error processing the URL" });
    }
  });

  // Record website visit
  app.post(`${apiPrefix}/websites/record`, async (req, res) => {
    try {
      const { title, url, favicon } = req.body;
      const userId = req.session?.userId || null;
      
      if (!title || !url) {
        return res.status(400).json({ message: "Title and URL are required" });
      }
      
      const website = await storage.recordWebsiteVisit({
        title,
        url,
        favicon,
        userId
      });
      
      res.status(201).json(website);
    } catch (error) {
      console.error("Error recording website visit:", error);
      res.status(500).json({ message: "Failed to record website visit" });
    }
  });
  
  // Direct image proxy endpoint - handles images directly without rewriting
  app.get('/image-proxy', async (req, res) => {
    const imageUrl = req.query.url as string;
    
    if (!imageUrl) {
      return res.status(400).send('Missing image URL');
    }
    
    try {
      log(`Directly proxying image: ${imageUrl}`, 'image-proxy');
      
      // Fetch the image with axios
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 10000, // 10 second timeout
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      // Set appropriate headers
      res.set('Content-Type', response.headers['content-type'] || 'image/jpeg');
      res.set('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
      res.set('Access-Control-Allow-Origin', '*');
      
      // Send the image data
      return res.send(Buffer.from(response.data, 'binary'));
    } catch (error) {
      log(`Error proxying image ${imageUrl}: ${error}`, 'image-proxy-error');
      // Return a 1x1 transparent GIF as fallback
      res.set('Content-Type', 'image/gif');
      const transparentPixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
      return res.send(transparentPixel);
    }
  });
  
  // Analytics API routes
  app.get(`${apiPrefix}/analytics`, async (req, res) => {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 30;
      const analyticsData = await storage.getAnalyticsDashboardData(days);
      res.json(analyticsData);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      res.status(500).json({ message: "Failed to fetch analytics data" });
    }
  });
  
  // Record page view for analytics
  app.post(`${apiPrefix}/analytics/pageview`, async (req, res) => {
    try {
      const { path, referrer, userAgent, ip } = req.body;
      const userId = req.session?.userId || null;
      
      if (!path) {
        return res.status(400).json({ message: "Path is required" });
      }
      
      const pageView = await storage.recordPageView({
        path,
        userId,
        referrer,
        userAgent,
        ip
      });
      
      res.status(201).json(pageView);
    } catch (error) {
      console.error("Error recording page view:", error);
      res.status(500).json({ message: "Failed to record page view" });
    }
  });
  
  // Handle the actual proxy functionality
  app.use('/proxy', rewriteLinksMiddleware, (req, res, next) => {
    // Record analytics for proxy requests
    const startTime = Date.now();
    
    // Store the original end method
    const originalEnd = res.end;
    
    // Override end method to capture response data
    res.end = function(chunk, encoding) {
      // Calculate response time
      const responseTime = Date.now() - startTime;
      
      // Detect if request is from mobile
      const userAgent = req.headers['user-agent'] || '';
      const isMobile = /Mobile|Android|iPhone|iPad|iPod|Windows Phone/i.test(userAgent);
      
      // Record the proxy request analytics
      storage.recordProxyRequest({
        url: req.query.url as string,
        userId: req.session?.userId || null,
        status: res.statusCode,
        responseTime,
        contentType: (res.getHeader('content-type') || '') as string,
        contentSize: parseInt(res.getHeader('content-length') as string || '0'),
        isMobile,
        isSuccess: res.statusCode >= 200 && res.statusCode < 400,
        error: res.statusCode >= 400 ? `HTTP Error ${res.statusCode}` : null
      }).catch(err => console.error("Failed to record proxy analytics:", err));
      
      // Call the original end method
      return originalEnd.apply(res, arguments as any);
    };
    
    // Continue to the proxy handler
    proxyRequestHandler(req, res, next);
  });
  
  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
