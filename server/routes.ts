import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { proxyRequestHandler, rewriteLinksMiddleware } from "./proxy";
import { urlSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API prefix for all routes
  const apiPrefix = "/api";
  
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
  
  // Handle the actual proxy functionality
  app.use('/proxy', rewriteLinksMiddleware, proxyRequestHandler);
  
  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
