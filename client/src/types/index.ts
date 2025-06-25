export interface User {
  id: number;
  username: string;
  email: string;
  dateOfBirth: string;
  accountType: "personal" | "business";
  isApproved: boolean;
  isBanned: boolean;
  ubsId: string;
  pin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: number;
  userId: number;
  accountNumber: string;
  accountType: string;
  accountName: string;
  balance: string;
  isActive: boolean;
  isFrozen: boolean;
  ubsId: string;
  createdAt: string;
}

export interface Transaction {
  id: number;
  fromAccountId?: number;
  toAccountId?: number;
  amount: string;
  transactionType: "credit" | "debit" | "transfer";
  description?: string;
  status: "pending" | "approved" | "rejected";
  adminId?: number;
  transactionDate: string;
  approvedAt?: string;
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: "transaction" | "security" | "system";
  isRead: boolean;
  createdAt: string;
}

export interface SupportChat {
  id: number;
  userId: number;
  adminId?: number;
  message: string;
  sender: "user" | "admin";
  isRead: boolean;
  createdAt: string;
}

export type AccountType = 
  | "current"
  | "savings" 
  | "credit_card"
  | "retirement"
  | "business_current"
  | "business_savings"
  | "treasury"
  | "line_of_credit";

export interface LineOfCreditType {
  id: string;
  name: string;
  description: string;
  category: "personal" | "business" | "specialized";
}
