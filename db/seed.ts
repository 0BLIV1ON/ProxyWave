import { db } from "./index";
import * as schema from "@shared/schema";
import { websites } from "@shared/schema";

async function seed() {
  try {
    // Seed data for recently accessed websites
    const websiteData = [
      {
        title: "Google",
        url: "https://www.google.com",
        favicon: "https://www.google.com/favicon.ico",
        accessedAt: new Date()
      },
      {
        title: "YouTube",
        url: "https://www.youtube.com",
        favicon: "https://www.youtube.com/favicon.ico",
        accessedAt: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
      },
      {
        title: "Wikipedia",
        url: "https://www.wikipedia.org",
        favicon: "https://www.wikipedia.org/favicon.ico",
        accessedAt: new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
      },
      {
        title: "Facebook",
        url: "https://www.facebook.com",
        favicon: "https://www.facebook.com/favicon.ico",
        accessedAt: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes ago
      },
      {
        title: "Reddit",
        url: "https://www.reddit.com",
        favicon: "https://www.reddit.com/favicon.ico",
        accessedAt: new Date(Date.now() - 20 * 60 * 1000) // 20 minutes ago
      },
      {
        title: "Instagram",
        url: "https://www.instagram.com",
        favicon: "https://www.instagram.com/favicon.ico",
        accessedAt: new Date(Date.now() - 25 * 60 * 1000) // 25 minutes ago
      }
    ];
    
    // Check if website data already exists
    const existingWebsites = await db.select().from(websites);
    
    if (existingWebsites.length === 0) {
      // Insert website data
      console.log("Seeding database with initial website data...");
      await db.insert(websites).values(websiteData);
      console.log("Database seeded successfully!");
    } else {
      console.log("Website data already exists, skipping seed");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
