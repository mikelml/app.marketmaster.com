import {
  User,
  InsertUser,
  Product,
  InsertProduct,
  Category,
  InsertCategory,
  CartItem,
  InsertCartItem,
  Order,
  InsertOrder,
  OrderItem,
  InsertOrderItem,
  Analytics,
  InsertAnalytics
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Product methods
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  getNewProducts(): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  
  // Category methods
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Cart methods
  getCartItems(userId: number): Promise<(CartItem & { product: Product })[]>;
  getCartItem(id: number): Promise<CartItem | undefined>;
  getCartItemByUserAndProduct(userId: number, productId: number): Promise<CartItem | undefined>;
  createCartItem(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  deleteCartItem(id: number): Promise<boolean>;
  clearCart(userId: number): Promise<boolean>;
  
  // Order methods
  getOrders(userId: number): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  
  // Order item methods
  getOrderItems(orderId: number): Promise<(OrderItem & { product: Product })[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
  // Analytics methods
  getDailyAnalytics(days: number): Promise<Analytics[]>;
  getBestSellingProducts(limit: number): Promise<Product[]>;
  updateAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private categories: Map<number, Category>;
  private cartItems: Map<number, CartItem>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private analyticsData: Map<number, Analytics>;
  
  sessionStore: session.SessionStore;
  
  private userId: number;
  private productId: number;
  private categoryId: number;
  private cartItemId: number;
  private orderId: number;
  private orderItemId: number;
  private analyticsId: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.categories = new Map();
    this.cartItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.analyticsData = new Map();
    
    this.userId = 1;
    this.productId = 1;
    this.categoryId = 1;
    this.cartItemId = 1;
    this.orderId = 1;
    this.orderItemId = 1;
    this.analyticsId = 1;
    
    // Initialize session store
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Initialize with sample data
    this.initializeData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }
  
  // Product methods
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
  
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async getProductBySlug(slug: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(
      (product) => product.slug === slug
    );
  }
  
  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.categoryId === categoryId
    );
  }
  
  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.isFeatured
    );
  }
  
  async getNewProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.isNew
    );
  }
  
  async searchProducts(query: string): Promise<Product[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.products.values()).filter(
      (product) => 
        product.name.toLowerCase().includes(lowercaseQuery) ||
        (product.description && product.description.toLowerCase().includes(lowercaseQuery))
    );
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productId++;
    const newProduct: Product = { ...product, id };
    this.products.set(id, newProduct);
    return newProduct;
  }
  
  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) return undefined;
    
    const updatedProduct = { ...existingProduct, ...product };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }
  
  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.slug === slug
    );
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }
  
  // Cart methods
  async getCartItems(userId: number): Promise<(CartItem & { product: Product })[]> {
    const items = Array.from(this.cartItems.values()).filter(
      (item) => item.userId === userId
    );
    
    return items.map(item => {
      const product = this.products.get(item.productId);
      if (!product) throw new Error(`Product with id ${item.productId} not found`);
      return { ...item, product };
    });
  }
  
  async getCartItem(id: number): Promise<CartItem | undefined> {
    return this.cartItems.get(id);
  }
  
  async getCartItemByUserAndProduct(userId: number, productId: number): Promise<CartItem | undefined> {
    return Array.from(this.cartItems.values()).find(
      (item) => item.userId === userId && item.productId === productId
    );
  }
  
  async createCartItem(cartItem: InsertCartItem): Promise<CartItem> {
    const id = this.cartItemId++;
    const newCartItem: CartItem = { ...cartItem, id };
    this.cartItems.set(id, newCartItem);
    return newCartItem;
  }
  
  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) return undefined;
    
    const updatedCartItem: CartItem = { ...cartItem, quantity };
    this.cartItems.set(id, updatedCartItem);
    return updatedCartItem;
  }
  
  async deleteCartItem(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }
  
  async clearCart(userId: number): Promise<boolean> {
    const cartItems = Array.from(this.cartItems.values()).filter(
      (item) => item.userId === userId
    );
    
    for (const item of cartItems) {
      this.cartItems.delete(item.id);
    }
    
    return true;
  }
  
  // Order methods
  async getOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId
    );
  }
  
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.orderId++;
    const newOrder: Order = { 
      ...order, 
      id, 
      createdAt: new Date() 
    };
    this.orders.set(id, newOrder);
    
    // Update analytics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayAnalytics = Array.from(this.analyticsData.values()).find(
      (analytics) => {
        if (!analytics.date) return false;
        const analyticsDate = new Date(analytics.date);
        analyticsDate.setHours(0, 0, 0, 0);
        return analyticsDate.getTime() === today.getTime();
      }
    );
    
    if (todayAnalytics) {
      this.analyticsData.set(todayAnalytics.id, {
        ...todayAnalytics,
        sales: todayAnalytics.sales + order.total,
        orders: todayAnalytics.orders + 1,
        customers: todayAnalytics.customers + 1
      });
    } else {
      const id = this.analyticsId++;
      this.analyticsData.set(id, {
        id,
        date: today,
        sales: order.total,
        orders: 1,
        customers: 1
      });
    }
    
    return newOrder;
  }
  
  // Order item methods
  async getOrderItems(orderId: number): Promise<(OrderItem & { product: Product })[]> {
    const items = Array.from(this.orderItems.values()).filter(
      (item) => item.orderId === orderId
    );
    
    return items.map(item => {
      const product = this.products.get(item.productId);
      if (!product) throw new Error(`Product with id ${item.productId} not found`);
      return { ...item, product };
    });
  }
  
  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemId++;
    const newOrderItem: OrderItem = { ...orderItem, id };
    this.orderItems.set(id, newOrderItem);
    return newOrderItem;
  }
  
  // Analytics methods
  async getDailyAnalytics(days: number): Promise<Analytics[]> {
    const analytics = Array.from(this.analyticsData.values());
    
    // Sort by date (newest first)
    analytics.sort((a, b) => {
      if (!a.date || !b.date) return 0;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    return analytics.slice(0, days);
  }
  
  async getBestSellingProducts(limit: number): Promise<Product[]> {
    const products = Array.from(this.products.values());
    
    // Sort by review count for this mock implementation
    // In a real implementation, this would be based on actual sales data
    products.sort((a, b) => {
      return (b.reviewCount || 0) - (a.reviewCount || 0);
    });
    
    return products.slice(0, limit);
  }
  
  async updateAnalytics(analytics: InsertAnalytics): Promise<Analytics> {
    const id = this.analyticsId++;
    const newAnalytics: Analytics = { 
      ...analytics, 
      id, 
      date: new Date() 
    };
    this.analyticsData.set(id, newAnalytics);
    return newAnalytics;
  }
  
  // Initialize with sample data
  private async initializeData() {
    // Create categories
    const categories = [
      {
        name: "Electronics",
        slug: "electronics",
        description: "Latest gadgets",
        imageUrl: "https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
      },
      {
        name: "Fashion",
        slug: "fashion",
        description: "Trendy styles",
        imageUrl: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
      },
      {
        name: "Home & Kitchen",
        slug: "home-kitchen",
        description: "For your space",
        imageUrl: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
      },
      {
        name: "Beauty & Health",
        slug: "beauty-health",
        description: "Self-care essentials",
        imageUrl: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
      }
    ];
    
    for (const category of categories) {
      await this.createCategory(category);
    }
    
    // Create products
    const products = [
      {
        name: "SoundMax Pro Wireless Earbuds",
        slug: "soundmax-pro-wireless-earbuds",
        description: "Noise cancellation, 24h battery",
        price: 129.99,
        comparePrice: 169.99,
        categoryId: 1,
        imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
        rating: 4.5,
        reviewCount: 120,
        stock: 45,
        tags: ["wireless", "earbuds", "audio"],
        featuredTag: "New",
        isNew: true,
        isFeatured: true,
        isBestSeller: false
      },
      {
        name: "FitPro X Smart Watch",
        slug: "fitpro-x-smart-watch",
        description: "Health tracking, GPS, 7-day battery",
        price: 179.99,
        comparePrice: 229.99,
        categoryId: 1,
        imageUrl: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
        rating: 5,
        reviewCount: 248,
        stock: 32,
        tags: ["smartwatch", "fitness", "wearable"],
        featuredTag: "Best Seller",
        isNew: false,
        isFeatured: true,
        isBestSeller: true
      },
      {
        name: "PowerBoost Wireless Charging Pad",
        slug: "powerboost-wireless-charging-pad",
        description: "Fast charging, LED indicator",
        price: 39.99,
        comparePrice: 49.99,
        categoryId: 1,
        imageUrl: "https://images.unsplash.com/photo-1623126908029-58cb08a2b272?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
        rating: 4,
        reviewCount: 86,
        stock: 65,
        tags: ["charger", "wireless", "accessories"],
        featuredTag: "",
        isNew: false,
        isFeatured: true,
        isBestSeller: false
      },
      {
        name: "SoundWave Mini Bluetooth Speaker",
        slug: "soundwave-mini-bluetooth-speaker",
        description: "Waterproof, 12h playtime",
        price: 59.99,
        comparePrice: 89.99,
        categoryId: 1,
        imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
        rating: 4.5,
        reviewCount: 157,
        stock: 28,
        tags: ["speaker", "bluetooth", "audio"],
        featuredTag: "",
        isNew: false,
        isFeatured: true,
        isBestSeller: false
      },
      {
        name: "UltraBook Pro X15",
        slug: "ultrabook-pro-x15",
        description: "15\" 4K display, 16GB RAM, 512GB SSD",
        price: 1299.99,
        comparePrice: 1499.99,
        categoryId: 1,
        imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
        rating: 5,
        reviewCount: 92,
        stock: 15,
        tags: ["laptop", "computer", "productivity"],
        featuredTag: "New",
        isNew: true,
        isFeatured: false,
        isBestSeller: false
      },
      {
        name: "Florale Summer Dress",
        slug: "florale-summer-dress",
        description: "100% cotton, floral pattern",
        price: 49.99,
        comparePrice: 69.99,
        categoryId: 2,
        imageUrl: "https://images.unsplash.com/photo-1548549557-dbe9946621da?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
        rating: 4,
        reviewCount: 64,
        stock: 42,
        tags: ["dress", "summer", "women"],
        featuredTag: "",
        isNew: false,
        isFeatured: false,
        isBestSeller: false
      },
      {
        name: "BrewMaster Coffee Maker",
        slug: "brewmaster-coffee-maker",
        description: "Programmable, 12-cup capacity",
        price: 89.99,
        comparePrice: 119.99,
        categoryId: 3,
        imageUrl: "https://pixabay.com/get/gce4b1196c891f7f43256b9a744b4a4cbb28cd94ebe15e2e984d9ed745f1bea0cb333210041579c1b37f7081e46e0450b2eb666f0a4170ef01bcd05515d45acff_1280.jpg",
        rating: 4.5,
        reviewCount: 127,
        stock: 0,
        tags: ["coffee", "kitchen", "appliances"],
        featuredTag: "Best Seller",
        isNew: false,
        isFeatured: false,
        isBestSeller: true
      },
      {
        name: "NaturalGlow Skincare Set",
        slug: "naturalglow-skincare-set",
        description: "Organic ingredients, 5-piece set",
        price: 79.99,
        comparePrice: 99.99,
        categoryId: 4,
        imageUrl: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
        rating: 5,
        reviewCount: 215,
        stock: 22,
        tags: ["skincare", "beauty", "organic"],
        featuredTag: "",
        isNew: false,
        isFeatured: false,
        isBestSeller: false
      }
    ];
    
    for (const product of products) {
      await this.createProduct(product);
    }
    
    // Create analytics data for the past 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      await this.updateAnalytics({
        date,
        sales: Math.floor(Math.random() * 3000) + 1000,
        orders: Math.floor(Math.random() * 50) + 10,
        customers: Math.floor(Math.random() * 30) + 5
      });
    }
  }
}

import { DatabaseStorage } from "./database-storage";

// Use database storage instead of memory storage
export const storage = new DatabaseStorage();
