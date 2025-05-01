import { db } from "@db";
import { 
  websites, users, pageViews, proxyRequests, dailyStats,
  type Website, type InsertWebsite, type InsertPageView, 
  type InsertProxyRequest, type DailyStat, type PageView, type ProxyRequest
} from "@shared/schema";
import { eq, desc, and, sql, count, avg, sum } from "drizzle-orm";

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
  },

  // ========== Analytics Methods ==========

  // Record a page view
  async recordPageView(pageView: InsertPageView): Promise<PageView | null> {
    try {
      const [result] = await db.insert(pageViews)
        .values(pageView)
        .returning();
      return result;
    } catch (error) {
      console.error("Error recording page view:", error);
      return null;
    }
  },

  // Record a proxy request
  async recordProxyRequest(request: InsertProxyRequest): Promise<ProxyRequest | null> {
    try {
      const [result] = await db.insert(proxyRequests)
        .values(request)
        .returning();
      
      // Update daily stats
      await this.updateDailyStats();
      
      return result;
    } catch (error) {
      console.error("Error recording proxy request:", error);
      return null;
    }
  },

  // Get daily stats for a specific date
  async getDailyStats(date?: Date): Promise<DailyStat | null> {
    try {
      const targetDate = date || new Date();
      const formattedDate = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD

      const result = await db.select()
        .from(dailyStats)
        .where(eq(dailyStats.date, formattedDate))
        .limit(1);

      if (result.length > 0) {
        return result[0];
      }

      // Create a new stats record for today if none exists
      return await this.createEmptyDailyStats(targetDate);
    } catch (error) {
      console.error("Error getting daily stats:", error);
      return null;
    }
  },
  
  // Create empty daily stats record
  async createEmptyDailyStats(date: Date): Promise<DailyStat | null> {
    try {
      const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      const [newStats] = await db.insert(dailyStats)
        .values({
          date: formattedDate,
          totalRequests: 0,
          uniqueUrls: 0,
          uniqueVisitors: 0,
          averageResponseTime: 0,
          successRate: 100,
          mobileRequests: 0,
          desktopRequests: 0
        })
        .returning();
        
      return newStats;
    } catch (error) {
      console.error("Error creating empty daily stats:", error);
      return null;
    }
  },
  
  // Update daily stats based on proxy requests
  async updateDailyStats(date?: Date): Promise<DailyStat | null> {
    try {
      const targetDate = date || new Date();
      const formattedDate = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Calculate start and end of the day
      const startOfDay = new Date(formattedDate);
      const endOfDay = new Date(formattedDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      // Get existing record or create if it doesn't exist
      let dailyStat = await this.getDailyStats(targetDate);
      if (!dailyStat) {
        dailyStat = await this.createEmptyDailyStats(targetDate);
        if (!dailyStat) return null;
      }
      
      // Calculate statistics for today
      const totalRequestsResult = await db.select({ count: count() })
        .from(proxyRequests)
        .where(
          and(
            sql`${proxyRequests.requestedAt} >= ${startOfDay}`,
            sql`${proxyRequests.requestedAt} <= ${endOfDay}`
          )
        );
      const totalRequests = totalRequestsResult[0]?.count || 0;
      
      // Calculate unique URLs
      const uniqueUrlsResult = await db.select({ count: count(proxyRequests.url, { distinct: true }) })
        .from(proxyRequests)
        .where(
          and(
            sql`${proxyRequests.requestedAt} >= ${startOfDay}`,
            sql`${proxyRequests.requestedAt} <= ${endOfDay}`
          )
        );
      const uniqueUrls = uniqueUrlsResult[0]?.count || 0;
      
      // Calculate unique visitors
      const uniqueVisitorsResult = await db.select({ count: count(proxyRequests.userId, { distinct: true }) })
        .from(proxyRequests)
        .where(
          and(
            sql`${proxyRequests.requestedAt} >= ${startOfDay}`,
            sql`${proxyRequests.requestedAt} <= ${endOfDay}`
          )
        );
      const uniqueVisitors = uniqueVisitorsResult[0]?.count || 0;
      
      // Calculate average response time
      const avgResponseTimeResult = await db.select({ average: avg(proxyRequests.responseTime) })
        .from(proxyRequests)
        .where(
          and(
            sql`${proxyRequests.requestedAt} >= ${startOfDay}`,
            sql`${proxyRequests.requestedAt} <= ${endOfDay}`,
            sql`${proxyRequests.responseTime} IS NOT NULL`
          )
        );
      const averageResponseTime = Math.round(avgResponseTimeResult[0]?.average || 0);
      
      // Calculate success rate
      const successCount = await db.select({ count: count() })
        .from(proxyRequests)
        .where(
          and(
            sql`${proxyRequests.requestedAt} >= ${startOfDay}`,
            sql`${proxyRequests.requestedAt} <= ${endOfDay}`,
            eq(proxyRequests.isSuccess, true)
          )
        );
      
      const successRate = totalRequests > 0 
        ? Math.round((successCount[0]?.count || 0) * 100 / totalRequests) 
        : 100;
      
      // Count mobile vs desktop requests
      const mobileRequestsResult = await db.select({ count: count() })
        .from(proxyRequests)
        .where(
          and(
            sql`${proxyRequests.requestedAt} >= ${startOfDay}`,
            sql`${proxyRequests.requestedAt} <= ${endOfDay}`,
            eq(proxyRequests.isMobile, true)
          )
        );
      const mobileRequests = mobileRequestsResult[0]?.count || 0;
      
      const desktopRequestsResult = await db.select({ count: count() })
        .from(proxyRequests)
        .where(
          and(
            sql`${proxyRequests.requestedAt} >= ${startOfDay}`,
            sql`${proxyRequests.requestedAt} <= ${endOfDay}`,
            eq(proxyRequests.isMobile, false)
          )
        );
      const desktopRequests = desktopRequestsResult[0]?.count || 0;
      
      // Update the daily stats
      const [updatedStats] = await db.update(dailyStats)
        .set({
          totalRequests,
          uniqueUrls,
          uniqueVisitors,
          averageResponseTime,
          successRate,
          mobileRequests,
          desktopRequests,
          updatedAt: new Date()
        })
        .where(eq(dailyStats.id, dailyStat.id))
        .returning();
      
      return updatedStats;
    } catch (error) {
      console.error("Error updating daily stats:", error);
      return null;
    }
  },
  
  // Get analytics for dashboard
  async getAnalyticsDashboardData(days = 30): Promise<{
    summary: {
      totalRequests: number;
      uniqueUrls: number;
      uniqueVisitors: number;
      averageResponseTime: number;
      successRate: number;
    };
    dailyStats: DailyStat[];
    topWebsites: { url: string; count: number }[];
    deviceBreakdown: { mobile: number; desktop: number };
  }> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);
      
      // Get daily stats for the period
      const stats = await db.select()
        .from(dailyStats)
        .where(and(
          sql`${dailyStats.date} >= ${startDate.toISOString().split('T')[0]}`,
          sql`${dailyStats.date} <= ${endDate.toISOString().split('T')[0]}`
        ))
        .orderBy(dailyStats.date);
      
      // Calculate summary stats
      const totalRequests = stats.reduce((sum, stat) => sum + stat.totalRequests, 0);
      const uniqueUrls = stats.reduce((sum, stat) => sum + stat.uniqueUrls, 0);
      const uniqueVisitors = stats.reduce((sum, stat) => sum + stat.uniqueVisitors, 0);
      
      // Calculate weighted average of response times
      const totalWeightedTime = stats.reduce((sum, stat) => 
        sum + (stat.averageResponseTime * stat.totalRequests), 0);
      const averageResponseTime = totalRequests > 0 
        ? Math.round(totalWeightedTime / totalRequests) 
        : 0;
      
      // Calculate overall success rate
      const totalSuccessRate = stats.reduce((sum, stat) => sum + (stat.successRate * stat.totalRequests), 0);
      const successRate = totalRequests > 0 
        ? Math.round(totalSuccessRate / totalRequests) 
        : 100;
      
      // Get top websites by request count
      const topWebsitesResult = await db.select({
        url: proxyRequests.url,
        count: count()
      })
      .from(proxyRequests)
      .where(
        and(
          sql`${proxyRequests.requestedAt} >= ${startDate}`,
          sql`${proxyRequests.requestedAt} <= ${endDate}`
        )
      )
      .groupBy(proxyRequests.url)
      .orderBy(sql`count DESC`)
      .limit(10);
      
      const topWebsites = topWebsitesResult.map(result => ({
        url: result.url,
        count: Number(result.count)
      }));
      
      // Calculate device breakdown
      const mobileTotal = stats.reduce((sum, stat) => sum + stat.mobileRequests, 0);
      const desktopTotal = stats.reduce((sum, stat) => sum + stat.desktopRequests, 0);
      
      return {
        summary: {
          totalRequests,
          uniqueUrls,
          uniqueVisitors,
          averageResponseTime,
          successRate
        },
        dailyStats: stats,
        topWebsites,
        deviceBreakdown: {
          mobile: mobileTotal,
          desktop: desktopTotal
        }
      };
    } catch (error) {
      console.error("Error getting analytics dashboard data:", error);
      return {
        summary: {
          totalRequests: 0,
          uniqueUrls: 0,
          uniqueVisitors: 0,
          averageResponseTime: 0,
          successRate: 100
        },
        dailyStats: [],
        topWebsites: [],
        deviceBreakdown: {
          mobile: 0,
          desktop: 0
        }
      };
    }
  }
};
