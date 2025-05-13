import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertCartItemSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Categories API
  app.get("/api/categories", async (req, res, next) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/categories/:slug", async (req, res, next) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      next(error);
    }
  });

  // Products API
  app.get("/api/products", async (req, res, next) => {
    try {
      const { category, featured, search } = req.query;
      
      if (search && typeof search === 'string') {
        const products = await storage.searchProducts(search);
        return res.json(products);
      }
      
      if (category && typeof category === 'string') {
        const categoryObj = await storage.getCategoryBySlug(category);
        if (!categoryObj) {
          return res.status(404).json({ message: "Category not found" });
        }
        const products = await storage.getProductsByCategory(categoryObj.id);
        return res.json(products);
      }
      
      if (featured === 'true') {
        const products = await storage.getFeaturedProducts();
        return res.json(products);
      }
      
      if (featured === 'new') {
        const products = await storage.getNewProducts();
        return res.json(products);
      }
      
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/products/:slug", async (req, res, next) => {
    try {
      const product = await storage.getProductBySlug(req.params.slug);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      next(error);
    }
  });

  // Cart API - protected routes
  app.get("/api/cart", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const cartItems = await storage.getCartItems(req.user.id);
      res.json(cartItems);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/cart", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const validatedData = insertCartItemSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      // Check if product exists
      const product = await storage.getProduct(validatedData.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Check if product is in stock
      if (product.stock < validatedData.quantity) {
        return res.status(400).json({ message: "Not enough stock available" });
      }
      
      // Check if item already exists in cart
      const existingItem = await storage.getCartItemByUserAndProduct(
        req.user.id,
        validatedData.productId
      );
      
      if (existingItem) {
        // Update quantity
        const updatedItem = await storage.updateCartItem(
          existingItem.id,
          existingItem.quantity + validatedData.quantity
        );
        return res.status(200).json(updatedItem);
      }
      
      // Create new cart item
      const cartItem = await storage.createCartItem(validatedData);
      res.status(201).json(cartItem);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/cart/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const cartItemId = parseInt(req.params.id);
      const quantity = z.number().min(1).parse(req.body.quantity);
      
      const cartItem = await storage.getCartItem(cartItemId);
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      if (cartItem.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const product = await storage.getProduct(cartItem.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      if (product.stock < quantity) {
        return res.status(400).json({ message: "Not enough stock available" });
      }
      
      const updatedItem = await storage.updateCartItem(cartItemId, quantity);
      res.json(updatedItem);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/cart/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const cartItemId = parseInt(req.params.id);
      
      const cartItem = await storage.getCartItem(cartItemId);
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      if (cartItem.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteCartItem(cartItemId);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/cart", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      await storage.clearCart(req.user.id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  // Orders API - protected routes
  app.get("/api/orders", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const orders = await storage.getOrders(req.user.id);
      res.json(orders);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/orders", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      // Get cart items
      const cartItems = await storage.getCartItems(req.user.id);
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      
      // Calculate total
      let total = 0;
      for (const item of cartItems) {
        total += item.product.price * item.quantity;
      }
      
      // Create order
      const order = await storage.createOrder({
        userId: req.user.id,
        total,
        status: "pending"
      });
      
      // Create order items
      for (const item of cartItems) {
        await storage.createOrderItem({
          orderId: order.id,
          productId: item.productId,
          price: item.product.price,
          quantity: item.quantity
        });
      }
      
      // Clear cart
      await storage.clearCart(req.user.id);
      
      res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/orders/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const orderId = parseInt(req.params.id);
      
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      if (order.userId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const orderItems = await storage.getOrderItems(orderId);
      
      res.json({ order, items: orderItems });
    } catch (error) {
      next(error);
    }
  });

  // Analytics API - admin only
  app.get("/api/analytics", async (req, res, next) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    try {
      const days = parseInt(req.query.days as string) || 7;
      
      const dailyAnalytics = await storage.getDailyAnalytics(days);
      const bestSellingProducts = await storage.getBestSellingProducts(5);
      
      res.json({
        dailyAnalytics,
        bestSellingProducts
      });
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
