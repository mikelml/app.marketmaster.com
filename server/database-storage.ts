import { 
  users, type User, type InsertUser,
  products, type Product, type InsertProduct,
  categories, type Category, type InsertCategory,
  cartItems, type CartItem, type InsertCartItem,
  orders, type Order, type InsertOrder,
  orderItems, type OrderItem, type InsertOrderItem,
  analytics, type Analytics, type InsertAnalytics
} from "@shared/schema";
import { db } from "./db";
import { eq, and, like, desc, sql, asc } from "drizzle-orm";
import { IStorage } from "./storage";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }
  
  // Product methods
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }
  
  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }
  
  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.slug, slug));
    return product;
  }
  
  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.categoryId, categoryId));
  }
  
  async getFeaturedProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.isFeatured, true));
  }
  
  async getNewProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(desc(products.id)).limit(8);
  }
  
  async searchProducts(query: string): Promise<Product[]> {
    return await db.select().from(products).where(
      like(products.name, `%${query}%`)
    );
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }
  
  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set(product)
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }
  
  // Category methods
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }
  
  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }
  
  // Cart methods
  async getCartItems(userId: number): Promise<(CartItem & { product: Product })[]> {
    const items = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.userId, userId));
      
    // Get products for each cart item
    const result = await Promise.all(
      items.map(async (item) => {
        const [product] = await db
          .select()
          .from(products)
          .where(eq(products.id, item.productId));
        return { ...item, product };
      })
    );
    
    return result;
  }
  
  async getCartItem(id: number): Promise<CartItem | undefined> {
    const [cartItem] = await db.select().from(cartItems).where(eq(cartItems.id, id));
    return cartItem;
  }
  
  async getCartItemByUserAndProduct(userId: number, productId: number): Promise<CartItem | undefined> {
    const [cartItem] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, userId),
          eq(cartItems.productId, productId)
        )
      );
    return cartItem;
  }
  
  async createCartItem(cartItem: InsertCartItem): Promise<CartItem> {
    const [newCartItem] = await db.insert(cartItems).values(cartItem).returning();
    return newCartItem;
  }
  
  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const [updatedCartItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updatedCartItem;
  }
  
  async deleteCartItem(id: number): Promise<boolean> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
    return true;
  }
  
  async clearCart(userId: number): Promise<boolean> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
    return true;
  }
  
  // Order methods
  async getOrders(userId: number): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }
  
  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }
  
  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }
  
  // Order item methods
  async getOrderItems(orderId: number): Promise<(OrderItem & { product: Product })[]> {
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));
      
    // Get products for each order item
    const result = await Promise.all(
      items.map(async (item) => {
        const [product] = await db
          .select()
          .from(products)
          .where(eq(products.id, item.productId));
        return { ...item, product };
      })
    );
    
    return result;
  }
  
  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const [newOrderItem] = await db.insert(orderItems).values(orderItem).returning();
    return newOrderItem;
  }
  
  // Analytics methods
  async getDailyAnalytics(days: number): Promise<Analytics[]> {
    // Get data for the last X days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return await db
      .select()
      .from(analytics)
      .where(sql`${analytics.date} >= ${startDate.toISOString()}`)
      .orderBy(asc(analytics.date));
  }
  
  async getBestSellingProducts(limit: number): Promise<Product[]> {
    // Using a raw query to join and aggregate data
    const result = await db.execute(sql`
      SELECT p.*
      FROM ${orderItems} oi
      JOIN ${products} p ON oi.product_id = p.id
      GROUP BY p.id
      ORDER BY SUM(oi.quantity) DESC
      LIMIT ${limit}
    `);
    
    // Map raw results to Product type
    return result.rows as Product[];
  }
  
  async updateAnalytics(analyticsData: InsertAnalytics): Promise<Analytics> {
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if we already have an entry for today
    const [existingAnalytics] = await db
      .select()
      .from(analytics)
      .where(sql`DATE(${analytics.date}) = DATE(${today.toISOString()})`);
    
    if (existingAnalytics) {
      // Update existing entry
      const [updatedAnalytics] = await db
        .update(analytics)
        .set({
          orders: analyticsData.orders ?? existingAnalytics.orders,
          sales: analyticsData.sales ?? existingAnalytics.sales,
          customers: analyticsData.customers ?? existingAnalytics.customers
        })
        .where(eq(analytics.id, existingAnalytics.id))
        .returning();
      return updatedAnalytics;
    } else {
      // Create new entry
      const [newAnalytics] = await db
        .insert(analytics)
        .values({
          date: today,
          ...analyticsData
        })
        .returning();
      return newAnalytics;
    }
  }
}