import type { AnyMySqlColumn } from "drizzle-orm/mysql-core";
import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  decimal,
  bigint,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Self-referencing FK requires type annotation to avoid circular inference
const categoriesTable = mysqlTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  image: text("image"),
  parentId: bigint("parentId", { mode: "number", unsigned: true }).references((): AnyMySqlColumn => categoriesTable.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export const categories = categoriesTable;

export type Category = typeof categories.$inferSelect;

export const brands = mysqlTable("brands", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  logo: text("logo"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Brand = typeof brands.$inferSelect;

export const products = mysqlTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: decimal("compareAtPrice", { precision: 10, scale: 2 }),
  image: text("image"),
  images: text("images"),
  categoryId: bigint("categoryId", { mode: "number", unsigned: true }).references(() => categories.id),
  brandId: bigint("brandId", { mode: "number", unsigned: true }).references(() => brands.id),
  inventory: int("inventory").default(0).notNull(),
  featured: int("featured").default(0).notNull(),
  tags: text("tags"),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0"),
  reviewCount: int("reviewCount").default(0),
  colors: text("colors"),
  moq: int("moq").default(100).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;

export const blogPosts = mysqlTable("blogPosts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content"),
  image: text("image"),
  category: varchar("category", { length: 100 }),
  author: varchar("author", { length: 255 }),
  publishedAt: timestamp("publishedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BlogPost = typeof blogPosts.$inferSelect;

export const orders = mysqlTable("orders", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).references(() => users.id),
  status: mysqlEnum("status", ["pending", "processing", "completed", "cancelled"]).default("pending").notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  paymentIntentId: varchar("paymentIntentId", { length: 255 }),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "succeeded", "failed"]).default("pending").notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }),
  customerName: varchar("customerName", { length: 255 }),
  shippingAddress: text("shippingAddress"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;

export const orderItems = mysqlTable("orderItems", {
  id: serial("id").primaryKey(),
  orderId: bigint("orderId", { mode: "number", unsigned: true }).notNull().references(() => orders.id),
  productId: bigint("productId", { mode: "number", unsigned: true }).notNull().references(() => products.id),
  quantity: int("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;

export const quoteRequests = mysqlTable("quoteRequests", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  company: varchar("company", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  productName: varchar("productName", { length: 255 }),
  productId: bigint("productId", { mode: "number", unsigned: true }).references(() => products.id),
  quantity: int("quantity").notNull(),
  message: text("message"),
  status: mysqlEnum("status", ["pending", "reviewed", "responded"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type QuoteRequest = typeof quoteRequests.$inferSelect;

export const reviews = mysqlTable("reviews", {
  id: serial("id").primaryKey(),
  productId: bigint("productId", { mode: "number", unsigned: true }).references(() => products.id).notNull(),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 255 }),
  rating: int("rating").notNull(),
  title: varchar("title", { length: 255 }),
  content: text("content").notNull(),
  verified: int("verified").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
