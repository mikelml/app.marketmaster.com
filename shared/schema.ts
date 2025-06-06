import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  role: text("role").default("customer")
});

// User relations defined below to avoid circular reference

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  imageUrl: text("image_url")
});

// Category relations defined below to avoid circular reference

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  price: doublePrecision("price").notNull(),
  comparePrice: doublePrecision("compare_price"),
  categoryId: integer("category_id").notNull(),
  imageUrl: text("image_url"),
  rating: doublePrecision("rating").default(0),
  reviewCount: integer("review_count").default(0),
  stock: integer("stock").default(0),
  tags: text("tags").array(),
  featuredTag: text("featured_tag"),
  isNew: boolean("is_new").default(false),
  isFeatured: boolean("is_featured").default(false),
  isBestSeller: boolean("is_best_seller").default(false)
});

// Product relations defined below to avoid circular reference

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1)
});

// Cart item relations defined below to avoid circular reference

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  total: doublePrecision("total").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow()
});

// Order relations defined below to avoid circular reference

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  price: doublePrecision("price").notNull(),
  quantity: integer("quantity").notNull()
});

// Order item relations defined below to avoid circular reference

export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  date: timestamp("date").defaultNow(),
  sales: doublePrecision("sales").default(0),
  orders: integer("orders").default(0),
  customers: integer("customers").default(0)
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
}).omit({ id: true });

export const insertCategorySchema = createInsertSchema(categories).omit({ 
  id: true 
});

export const insertProductSchema = createInsertSchema(products).omit({ 
  id: true 
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({ 
  id: true 
});

export const insertOrderSchema = createInsertSchema(orders).omit({ 
  id: true, 
  createdAt: true 
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ 
  id: true 
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({ 
  id: true,
  date: true
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;

export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type Analytics = typeof analytics.$inferSelect;

// Login schema
export const loginSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export type LoginData = z.infer<typeof loginSchema>;

// Define all relations after table definitions to avoid circular references
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  cartItems: many(cartItems)
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products)
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id]
  }),
  cartItems: many(cartItems),
  orderItems: many(orderItems)
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id]
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id]
  })
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id]
  }),
  orderItems: many(orderItems)
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id]
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id]
  })
}));
