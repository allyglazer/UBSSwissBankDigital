import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  idCardUrl: text("id_card_url"),
  accountType: varchar("account_type", { length: 20 }).notNull(), // 'personal' or 'business'
  isApproved: boolean("is_approved").default(false),
  isBanned: boolean("is_banned").default(false),
  pin: text("pin"),
  ubsId: text("ubs_id").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  accountNumber: text("account_number").notNull().unique(),
  accountType: varchar("account_type", { length: 50 }).notNull(),
  accountName: text("account_name").notNull(),
  balance: decimal("balance", { precision: 15, scale: 2 }).default("0.00"),
  isActive: boolean("is_active").default(true),
  isFrozen: boolean("is_frozen").default(false),
  ubsId: text("ubs_id").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  fromAccountId: integer("from_account_id").references(() => accounts.id),
  toAccountId: integer("to_account_id").references(() => accounts.id),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  transactionType: varchar("transaction_type", { length: 20 }).notNull(), // 'credit', 'debit', 'transfer'
  description: text("description"),
  status: varchar("status", { length: 20 }).default("pending"), // 'pending', 'approved', 'rejected'
  adminId: integer("admin_id").references(() => users.id),
  transactionDate: timestamp("transaction_date").defaultNow(),
  approvedAt: timestamp("approved_at"),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 20 }).notNull(), // 'transaction', 'security', 'system'
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const supportChats = pgTable("support_chats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  adminId: integer("admin_id").references(() => users.id),
  message: text("message").notNull(),
  sender: varchar("sender", { length: 10 }).notNull(), // 'user' or 'admin'
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  ubsId: true,
  isApproved: true,
  isBanned: true,
});

export const insertAccountSchema = createInsertSchema(accounts).omit({
  id: true,
  createdAt: true,
  ubsId: true,
  accountNumber: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  transactionDate: true,
  approvedAt: true,
  status: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  isRead: true,
});

export const insertSupportChatSchema = createInsertSchema(supportChats).omit({
  id: true,
  createdAt: true,
  isRead: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Account = typeof accounts.$inferSelect;
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type SupportChat = typeof supportChats.$inferSelect;
export type InsertSupportChat = z.infer<typeof insertSupportChatSchema>;
