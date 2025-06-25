import { 
  collection, 
  doc, 
  onSnapshot, 
  query, 
  where, 
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// Firestore service for banking operations
export class FirestoreService {
  // User operations
  static async createUser(userData: any) {
    try {
      const docRef = await addDoc(collection(db, 'users'), {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async getUserByEmail(email: string) {
    try {
      const q = query(collection(db, 'users'), where('email', '==', email));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  }

  static async getUserByUsername(username: string) {
    try {
      const q = query(collection(db, 'users'), where('username', '==', username));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting user by username:', error);
      throw error;
    }
  }

  static async updateUser(userId: string, updates: any) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  static async getAllUsers() {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  static async getPendingUsers() {
    try {
      const q = query(collection(db, 'users'), where('isApproved', '==', false));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting pending users:', error);
      throw error;
    }
  }

  // Account operations
  static async createAccount(accountData: any) {
    try {
      const docRef = await addDoc(collection(db, 'accounts'), {
        ...accountData,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  }

  static async getAccountsByUserId(userId: string) {
    try {
      const q = query(collection(db, 'accounts'), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting user accounts:', error);
      throw error;
    }
  }

  static async updateAccount(accountId: string, updates: any) {
    try {
      const accountRef = doc(db, 'accounts', accountId);
      await updateDoc(accountRef, updates);
    } catch (error) {
      console.error('Error updating account:', error);
      throw error;
    }
  }

  // Transaction operations
  static async createTransaction(transactionData: any) {
    try {
      const docRef = await addDoc(collection(db, 'transactions'), {
        ...transactionData,
        status: 'pending',
        transactionDate: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  static async getTransactionsByAccountId(accountId: string) {
    try {
      // Get transactions where this account is sender
      const fromQuery = query(
        collection(db, 'transactions'), 
        where('fromAccountId', '==', accountId),
        orderBy('transactionDate', 'desc')
      );
      
      // Get transactions where this account is receiver
      const toQuery = query(
        collection(db, 'transactions'), 
        where('toAccountId', '==', accountId),
        orderBy('transactionDate', 'desc')
      );

      const [fromSnapshot, toSnapshot] = await Promise.all([
        getDocs(fromQuery),
        getDocs(toQuery)
      ]);

      const transactions = [
        ...fromSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        ...toSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      ];

      // Sort by date
      return transactions.sort((a: any, b: any) => {
        const dateA = a.transactionDate?.toDate?.() || new Date(a.transactionDate);
        const dateB = b.transactionDate?.toDate?.() || new Date(b.transactionDate);
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw error;
    }
  }

  static async getPendingTransactions() {
    try {
      const q = query(
        collection(db, 'transactions'), 
        where('status', '==', 'pending'),
        orderBy('transactionDate', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting pending transactions:', error);
      throw error;
    }
  }

  static async updateTransaction(transactionId: string, updates: any) {
    try {
      const transactionRef = doc(db, 'transactions', transactionId);
      const updateData = { ...updates };
      
      if (updates.status === 'approved') {
        updateData.approvedAt = serverTimestamp();
      }
      
      await updateDoc(transactionRef, updateData);
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  // Notification operations
  static async createNotification(notificationData: any) {
    try {
      const docRef = await addDoc(collection(db, 'notifications'), {
        ...notificationData,
        isRead: false,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  static async getNotificationsByUserId(userId: string) {
    try {
      const q = query(
        collection(db, 'notifications'), 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  }

  // Support chat operations
  static async createSupportMessage(messageData: any) {
    try {
      const docRef = await addDoc(collection(db, 'supportChats'), {
        ...messageData,
        isRead: false,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating support message:', error);
      throw error;
    }
  }

  static async getSupportChatsByUserId(userId: string) {
    try {
      const q = query(
        collection(db, 'supportChats'), 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting support chats:', error);
      throw error;
    }
  }

  // Helper function to generate UBS ID
  static generateUbsId(): string {
    return Math.floor(100000000 + Math.random() * 900000000).toString();
  }

  // Helper function to generate account number
  static generateAccountNumber(): string {
    return Math.floor(100000000 + Math.random() * 900000000).toString();
  }

  // Helper function to create default accounts for approved users
  static async createDefaultAccounts(userId: string, accountType: string) {
    const accountTypes = accountType === "personal" 
      ? ["current", "savings", "credit_card", "retirement"]
      : ["business_current", "business_savings", "treasury"];

    const accounts = [];
    
    for (const type of accountTypes) {
      const accountData = {
        userId: userId,
        accountNumber: this.generateAccountNumber(),
        accountType: type,
        accountName: this.getAccountDisplayName(type),
        balance: "0.00",
        isActive: true,
        isFrozen: type === "credit_card", // Credit cards start frozen
        ubsId: this.generateUbsId()
      };
      
      const accountId = await this.createAccount(accountData);
      accounts.push({ id: accountId, ...accountData });
    }
    
    return accounts;
  }

  static getAccountDisplayName(type: string): string {
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

export default FirestoreService;