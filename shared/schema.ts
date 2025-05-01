import { pgTable, text, serial, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Website history table for storing recently accessed websites
export const websites = pgTable("websites", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  favicon: text("favicon"),
  userId: integer("user_id").references(() => users.id),
  accessedAt: timestamp("accessed_at").defaultNow().notNull(),
});

export const insertWebsiteSchema = createInsertSchema(websites).pick({
  title: true,
  url: true,
  favicon: true,
  userId: true,
});

export type InsertWebsite = z.infer<typeof insertWebsiteSchema>;
export type Website = typeof websites.$inferSelect;

// Define URL validation schema for the proxy service
export const urlSchema = z.object({
  url: z.string().url("Please enter a valid URL").or(
    z.string().refine(val => {
      // Check if the string is a search query and not a URL
      return !val.includes('.') && !val.includes('://') && val.trim().length > 0;
    }, {
      message: "Please enter a valid URL or search query"
    })
  )
});

export type UrlRequest = z.infer<typeof urlSchema>;

// Analytics tables
// ---------------

// Page views table for tracking site usage
export const pageViews = pgTable("page_views", {
  id: serial("id").primaryKey(),
  path: text("path").notNull(),
  userId: integer("user_id").references(() => users.id),
  referrer: text("referrer"),
  userAgent: text("user_agent"),
  ip: text("ip"),
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
});

export const insertPageViewSchema = createInsertSchema(pageViews).pick({
  path: true,
  userId: true,
  referrer: true,
  userAgent: true,
  ip: true,
});

export type InsertPageView = z.infer<typeof insertPageViewSchema>;
export type PageView = typeof pageViews.$inferSelect;

// Proxy requests table for tracking proxy usage
export const proxyRequests = pgTable("proxy_requests", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  userId: integer("user_id").references(() => users.id),
  status: integer("status"),
  responseTime: integer("response_time"),
  contentType: text("content_type"),
  contentSize: integer("content_size"),
  isMobile: boolean("is_mobile"),
  isSuccess: boolean("is_success").default(true),
  error: text("error"),
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
});

export const insertProxyRequestSchema = createInsertSchema(proxyRequests).pick({
  url: true,
  userId: true,
  status: true,
  responseTime: true,
  contentType: true,
  contentSize: true,
  isMobile: true,
  isSuccess: true,
  error: true,
});

export type InsertProxyRequest = z.infer<typeof insertProxyRequestSchema>;
export type ProxyRequest = typeof proxyRequests.$inferSelect;

// Daily statistics for dashboard
export const dailyStats = pgTable("daily_stats", {
  id: serial("id").primaryKey(),
  date: date("date").notNull().unique(),
  totalRequests: integer("total_requests").default(0).notNull(),
  uniqueUrls: integer("unique_urls").default(0).notNull(),
  uniqueVisitors: integer("unique_visitors").default(0).notNull(),
  averageResponseTime: integer("average_response_time").default(0).notNull(),
  successRate: integer("success_rate").default(100).notNull(),
  mobileRequests: integer("mobile_requests").default(0).notNull(),
  desktopRequests: integer("desktop_requests").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDailyStatSchema = createInsertSchema(dailyStats).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDailyStat = z.infer<typeof insertDailyStatSchema>;
export type DailyStat = typeof dailyStats.$inferSelect;
