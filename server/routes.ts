import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertTransactionSchema, insertNotificationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUser = await storage.getUserByUsername(userData.username) || 
                          await storage.getUserByEmail(userData.email);
      
      if (existingUser) {
        return res.status(400).json({ error: "Username or email already exists" });
      }

      const user = await storage.createUser(userData);
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(400).json({ error: "Invalid registration data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (user.isBanned) {
        return res.status(403).json({ error: "Account banned. Please contact support." });
      }

      if (!user.isApproved) {
        return res.status(403).json({ error: "Account pending approval" });
      }

      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const updates = req.body;
      const user = await storage.updateUser(parseInt(req.params.id), updates);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // Account routes
  app.get("/api/accounts/user/:userId", async (req, res) => {
    try {
      const accounts = await storage.getAccountsByUserId(parseInt(req.params.userId));
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch accounts" });
    }
  });

  app.put("/api/accounts/:id", async (req, res) => {
    try {
      const updates = req.body;
      const account = await storage.updateAccount(parseInt(req.params.id), updates);
      if (!account) {
        return res.status(404).json({ error: "Account not found" });
      }
      res.json(account);
    } catch (error) {
      res.status(500).json({ error: "Failed to update account" });
    }
  });

  // Transaction routes
  app.get("/api/transactions/account/:accountId", async (req, res) => {
    try {
      const transactions = await storage.getTransactionsByAccountId(parseInt(req.params.accountId));
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const transactionData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(transactionData);
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ error: "Invalid transaction data" });
    }
  });

  app.put("/api/transactions/:id", async (req, res) => {
    try {
      const updates = req.body;
      const transaction = await storage.updateTransaction(parseInt(req.params.id), updates);
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ error: "Failed to update transaction" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users.map(user => ({ ...user, password: undefined })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/users/pending", async (req, res) => {
    try {
      const users = await storage.getPendingUsers();
      res.json(users.map(user => ({ ...user, password: undefined })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending users" });
    }
  });

  app.get("/api/admin/transactions/pending", async (req, res) => {
    try {
      const transactions = await storage.getPendingTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending transactions" });
    }
  });

  app.post("/api/admin/users/:id/approve", async (req, res) => {
    try {
      const user = await storage.updateUser(parseInt(req.params.id), { isApproved: true });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ error: "Failed to approve user" });
    }
  });

  app.post("/api/admin/users/:id/ban", async (req, res) => {
    try {
      const user = await storage.updateUser(parseInt(req.params.id), { isBanned: true });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ error: "Failed to ban user" });
    }
  });

  // Notification routes
  app.get("/api/notifications/user/:userId", async (req, res) => {
    try {
      const notifications = await storage.getNotificationsByUserId(parseInt(req.params.userId));
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications", async (req, res) => {
    try {
      const notificationData = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(notificationData);
      res.json(notification);
    } catch (error) {
      res.status(400).json({ error: "Invalid notification data" });
    }
  });

  // Support chat routes
  app.get("/api/support/user/:userId", async (req, res) => {
    try {
      const chats = await storage.getChatsByUserId(parseInt(req.params.userId));
      res.json(chats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch support chats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
