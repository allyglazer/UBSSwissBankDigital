import { 
  users, accounts, transactions, notifications, supportChats,
  type User, type InsertUser, type Account, type InsertAccount,
  type Transaction, type InsertTransaction, type Notification, type InsertNotification,
  type SupportChat, type InsertSupportChat
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUbsId(ubsId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getPendingUsers(): Promise<User[]>;
  
  // Account operations
  getAccount(id: number): Promise<Account | undefined>;
  getAccountByNumber(accountNumber: string): Promise<Account | undefined>;
  getAccountsByUserId(userId: number): Promise<Account[]>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccount(id: number, updates: Partial<Account>): Promise<Account | undefined>;
  
  // Transaction operations
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionsByAccountId(accountId: number): Promise<Transaction[]>;
  getPendingTransactions(): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, updates: Partial<Transaction>): Promise<Transaction | undefined>;
  
  // Notification operations
  getNotificationsByUserId(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<void>;
  
  // Support chat operations
  getChatsByUserId(userId: number): Promise<SupportChat[]>;
  createSupportMessage(message: InsertSupportChat): Promise<SupportChat>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private accounts: Map<number, Account> = new Map();
  private transactions: Map<number, Transaction> = new Map();
  private notifications: Map<number, Notification> = new Map();
  private supportChats: Map<number, SupportChat> = new Map();
  
  private currentUserId = 1;
  private currentAccountId = 1;
  private currentTransactionId = 1;
  private currentNotificationId = 1;
  private currentChatId = 1;

  constructor() {
    // Create default admin user
    this.createUser({
      username: "admin",
      email: "admin@ubs.com",
      password: "admin123",
      dateOfBirth: "1980-01-01",
      accountType: "business",
      pin: "1234",
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUbsId(ubsId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.ubsId === ubsId);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const ubsId = this.generateUbsId();
    const user: User = {
      ...insertUser,
      id,
      ubsId,
      isApproved: insertUser.username === "admin",
      isBanned: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);

    // Create default accounts for approved users
    if (user.isApproved) {
      await this.createDefaultAccounts(user);
    }

    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getPendingUsers(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => !user.isApproved);
  }

  // Account operations
  async getAccount(id: number): Promise<Account | undefined> {
    return this.accounts.get(id);
  }

  async getAccountByNumber(accountNumber: string): Promise<Account | undefined> {
    return Array.from(this.accounts.values()).find(account => account.accountNumber === accountNumber);
  }

  async getAccountsByUserId(userId: number): Promise<Account[]> {
    return Array.from(this.accounts.values()).filter(account => account.userId === userId);
  }

  async createAccount(insertAccount: InsertAccount): Promise<Account> {
    const id = this.currentAccountId++;
    const accountNumber = this.generateAccountNumber();
    const ubsId = this.generateUbsId();
    
    const account: Account = {
      ...insertAccount,
      id,
      accountNumber,
      ubsId,
      balance: "0.00",
      isActive: true,
      isFrozen: false,
      createdAt: new Date(),
    };
    
    this.accounts.set(id, account);
    return account;
  }

  async updateAccount(id: number, updates: Partial<Account>): Promise<Account | undefined> {
    const account = this.accounts.get(id);
    if (!account) return undefined;

    const updatedAccount = { ...account, ...updates };
    this.accounts.set(id, updatedAccount);
    return updatedAccount;
  }

  // Transaction operations
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getTransactionsByAccountId(accountId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      transaction => transaction.fromAccountId === accountId || transaction.toAccountId === accountId
    );
  }

  async getPendingTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(transaction => transaction.status === "pending");
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      status: "pending",
      transactionDate: new Date(),
      approvedAt: null,
    };
    
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransaction(id: number, updates: Partial<Transaction>): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;

    const updatedTransaction = { ...transaction, ...updates };
    if (updates.status === "approved") {
      updatedTransaction.approvedAt = new Date();
    }
    
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  // Notification operations
  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(notification => notification.userId === userId);
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.currentNotificationId++;
    const notification: Notification = {
      ...insertNotification,
      id,
      isRead: false,
      createdAt: new Date(),
    };
    
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.isRead = true;
      this.notifications.set(id, notification);
    }
  }

  // Support chat operations
  async getChatsByUserId(userId: number): Promise<SupportChat[]> {
    return Array.from(this.supportChats.values()).filter(chat => chat.userId === userId);
  }

  async createSupportMessage(insertMessage: InsertSupportChat): Promise<SupportChat> {
    const id = this.currentChatId++;
    const message: SupportChat = {
      ...insertMessage,
      id,
      isRead: false,
      createdAt: new Date(),
    };
    
    this.supportChats.set(id, message);
    return message;
  }

  // Helper methods
  private generateUbsId(): string {
    return Math.floor(100000000 + Math.random() * 900000000).toString();
  }

  private generateAccountNumber(): string {
    return Math.floor(100000000 + Math.random() * 900000000).toString();
  }

  private async createDefaultAccounts(user: User): Promise<void> {
    const accountTypes = user.accountType === "personal" 
      ? ["current", "savings", "credit_card", "retirement"]
      : ["business_current", "business_savings", "treasury"];

    for (const type of accountTypes) {
      await this.createAccount({
        userId: user.id,
        accountType: type,
        accountName: this.getAccountDisplayName(type),
      });
    }
  }

  private getAccountDisplayName(type: string): string {
    const names: Record<string, string> = {
      current: "Current Account",
      savings: "Savings Account",
      credit_card: "Gold Credit Card",
      retirement: "Retirement Savings",
      business_current: "Business Current",
      business_savings: "Business Savings",
      treasury: "Treasury Account",
    };
    return names[type] || type;
  }
}

export const storage = new MemStorage();
