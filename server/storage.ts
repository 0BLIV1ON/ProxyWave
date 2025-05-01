import { db } from "@db";
import { websites, users, type Website, type InsertWebsite } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

// Storage interface for website history
export const storage = {
  // Fetch recent websites for a user (or anonymous if userId is null)
  async getRecentWebsites(userId?: number, limit = 10): Promise<Website[]> {
    try {
      let query = db.select().from(websites).orderBy(desc(websites.accessedAt)).limit(limit);
      
      if (userId) {
        query = query.where(eq(websites.userId, userId));
      } else {
        // For anonymous users, only return websites with null userId
        query = query.where(eq(websites.userId, null as any));
      }
      
      return await query;
    } catch (error) {
      console.error("Error fetching recent websites:", error);
      return [];
    }
  },
  
  // Record a website visit
  async recordWebsiteVisit(website: Omit<InsertWebsite, "accessedAt">): Promise<Website | null> {
    try {
      // Check if the website already exists for this user
      let existingWebsite;
      
      if (website.userId) {
        existingWebsite = await db.select().from(websites)
          .where(eq(websites.url, website.url))
          .where(eq(websites.userId, website.userId))
          .limit(1);
      } else {
        existingWebsite = await db.select().from(websites)
          .where(eq(websites.url, website.url))
          .where(eq(websites.userId, null as any))
          .limit(1);
      }
      
      if (existingWebsite && existingWebsite.length > 0) {
        // Update the accessed timestamp
        const [updated] = await db.update(websites)
          .set({ accessedAt: new Date() })
          .where(eq(websites.id, existingWebsite[0].id))
          .returning();
          
        return updated;
      }
      
      // Insert new website record
      const [newWebsite] = await db.insert(websites)
        .values({
          title: website.title,
          url: website.url,
          favicon: website.favicon,
          userId: website.userId,
        })
        .returning();
        
      return newWebsite;
    } catch (error) {
      console.error("Error recording website visit:", error);
      return null;
    }
  },
  
  // Get user by username
  async getUserByUsername(username: string) {
    try {
      const user = await db.select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);
        
      return user[0] || null;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  },
  
  // Insert a new user
  async insertUser(user: { username: string; password: string }) {
    try {
      const [newUser] = await db.insert(users)
        .values({
          username: user.username,
          password: user.password, // In a real app, this would be hashed
        })
        .returning();
        
      return newUser;
    } catch (error) {
      console.error("Error inserting user:", error);
      return null;
    }
  }
};
