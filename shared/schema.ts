import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
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
