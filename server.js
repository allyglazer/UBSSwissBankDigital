const express = require('express');
const path = require('path');
const cors = require('cors');
const admin = require('firebase-admin');
const firebaseConfig = require('./firebaseConfig');

// Initialize Firebase Admin
const serviceAccount = {
  type: "service_account",
  project_id: firebaseConfig.projectId,
  // In production, use proper service account credentials
  // For development, we'll use the client config
};

// Initialize Firebase Admin (simplified for development)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: firebaseConfig.projectId
  });
}

const db = admin.firestore();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Serve static files
app.use(express.static(path.join(__dirname, 'client/dist')));

// Helper function to generate UBS ID
const generateUbsId = () => {
  return Math.floor(100000000 + Math.random() * 900000000).toString();
};

// Helper function to generate account number
const generateAccountNumber = () => {
  return Math.floor(100000000 + Math.random() * 900000000).toString();
};

// Helper function to create default accounts
const createDefaultAccounts = async (userId, accountType) => {
  const accountTypes = accountType === "personal" 
    ? ["current", "savings", "credit_card", "retirement"]
    : ["business_current", "business_savings", "treasury"];

  const accounts = [];
  
  for (const type of accountTypes) {
    const accountData = {
      userId: userId,
      accountNumber: generateAccountNumber(),
      accountType: type,
      accountName: getAccountDisplayName(type),
      balance: "0.00",
      isActive: true,
      isFrozen: type === "credit_card", // Credit cards start frozen
      ubsId: generateUbsId(),
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const accountRef = await db.collection('accounts').add(accountData);
    accounts.push({ id: accountRef.id, ...accountData });
  }
  
  return accounts;
};

const getAccountDisplayName = (type) => {
  const names = {
    current: "Current Account",
    savings: "Savings Account",
    credit_card: "Gold Credit Card",
    retirement: "Retirement Savings",
    business_current: "Business Current",
    business_savings: "Business Savings",
    treasury: "Treasury Account",
  };
  return names[type] || type;
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, dateOfBirth, accountType, idCardUrl } = req.body;
    
    // Check if user already exists
    const existingUsers = await db.collection('users')
      .where('email', '==', email)
      .get();
    
    if (!existingUsers.empty) {
      return res.status(400).json({ error: "Email already exists" });
    }
    
    const existingUsernames = await db.collection('users')
      .where('username', '==', username)
      .get();
    
    if (!existingUsernames.empty) {
      return res.status(400).json({ error: "Username already exists" });
    }
    
    // Create user in Firestore
    const userData = {
      username,
      email,
      password, // In production, hash this
      dateOfBirth,
      accountType,
      idCardUrl: idCardUrl || null,
      isApproved: username === "admin",
      isBanned: false,
      ubsId: generateUbsId(),
      pin: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const userRef = await db.collection('users').add(userData);
    const userId = userRef.id;
    
    // Create default accounts for approved users
    if (userData.isApproved) {
      await createDefaultAccounts(userId, accountType);
    }
    
    const { password: _, ...userResponse } = { id: userId, ...userData };
    res.json({ user: userResponse });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const usersSnapshot = await db.collection('users')
      .where('email', '==', email)
      .get();
    
    if (usersSnapshot.empty) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();
    
    if (userData.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    if (userData.isBanned) {
      return res.status(403).json({ error: "Kindly contact support for assistance" });
    }
    
    if (!userData.isApproved) {
      return res.status(403).json({ error: "Account pending approval" });
    }
    
    const { password: _, ...userResponse } = { id: userDoc.id, ...userData };
    res.json({ user: userResponse });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: "Login failed" });
  }
});

// User Routes
app.get('/api/users/:id', async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.params.id).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const { password, ...userData } = userDoc.data();
    res.json({ id: userDoc.id, ...userData });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const updates = {
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection('users').doc(req.params.id).update(updates);
    
    const updatedDoc = await db.collection('users').doc(req.params.id).get();
    const { password, ...userData } = updatedDoc.data();
    
    res.json({ id: updatedDoc.id, ...userData });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Account Routes
app.get('/api/accounts/user/:userId', async (req, res) => {
  try {
    const accountsSnapshot = await db.collection('accounts')
      .where('userId', '==', req.params.userId)
      .get();
    
    const accounts = accountsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json(accounts);
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
});

app.put('/api/accounts/:id', async (req, res) => {
  try {
    await db.collection('accounts').doc(req.params.id).update(req.body);
    
    const updatedDoc = await db.collection('accounts').doc(req.params.id).get();
    res.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    console.error('Update account error:', error);
    res.status(500).json({ error: "Failed to update account" });
  }
});

// Transaction Routes
app.get('/api/transactions/account/:accountId', async (req, res) => {
  try {
    const transactionsSnapshot = await db.collection('transactions')
      .where('fromAccountId', '==', req.params.accountId)
      .get();
    
    const toTransactionsSnapshot = await db.collection('transactions')
      .where('toAccountId', '==', req.params.accountId)
      .get();
    
    const transactions = [
      ...transactionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      ...toTransactionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    ];
    
    // Sort by date
    transactions.sort((a, b) => {
      const dateA = a.transactionDate?.toDate?.() || new Date(a.transactionDate);
      const dateB = b.transactionDate?.toDate?.() || new Date(b.transactionDate);
      return dateB - dateA;
    });
    
    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    const transactionData = {
      ...req.body,
      status: "pending",
      transactionDate: admin.firestore.FieldValue.serverTimestamp(),
      approvedAt: null
    };
    
    const transactionRef = await db.collection('transactions').add(transactionData);
    res.json({ id: transactionRef.id, ...transactionData });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: "Failed to create transaction" });
  }
});

app.put('/api/transactions/:id', async (req, res) => {
  try {
    const updates = { ...req.body };
    
    if (updates.status === "approved") {
      updates.approvedAt = admin.firestore.FieldValue.serverTimestamp();
    }
    
    await db.collection('transactions').doc(req.params.id).update(updates);
    
    const updatedDoc = await db.collection('transactions').doc(req.params.id).get();
    res.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ error: "Failed to update transaction" });
  }
});

// Admin Routes
app.get('/api/admin/users', async (req, res) => {
  try {
    const usersSnapshot = await db.collection('users').get();
    const users = usersSnapshot.docs.map(doc => {
      const { password, ...userData } = doc.data();
      return { id: doc.id, ...userData };
    });
    
    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.get('/api/admin/users/pending', async (req, res) => {
  try {
    const usersSnapshot = await db.collection('users')
      .where('isApproved', '==', false)
      .get();
    
    const users = usersSnapshot.docs.map(doc => {
      const { password, ...userData } = doc.data();
      return { id: doc.id, ...userData };
    });
    
    res.json(users);
  } catch (error) {
    console.error('Get pending users error:', error);
    res.status(500).json({ error: "Failed to fetch pending users" });
  }
});

app.get('/api/admin/transactions/pending', async (req, res) => {
  try {
    const transactionsSnapshot = await db.collection('transactions')
      .where('status', '==', 'pending')
      .get();
    
    const transactions = transactionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json(transactions);
  } catch (error) {
    console.error('Get pending transactions error:', error);
    res.status(500).json({ error: "Failed to fetch pending transactions" });
  }
});

app.post('/api/admin/users/:id/approve', async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Update user approval status
    await db.collection('users').doc(userId).update({
      isApproved: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Get user data to create accounts
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    // Create default accounts
    await createDefaultAccounts(userId, userData.accountType);
    
    const { password, ...userResponse } = { id: userDoc.id, ...userData, isApproved: true };
    res.json({ user: userResponse });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({ error: "Failed to approve user" });
  }
});

app.post('/api/admin/users/:id/ban', async (req, res) => {
  try {
    await db.collection('users').doc(req.params.id).update({
      isBanned: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    const updatedDoc = await db.collection('users').doc(req.params.id).get();
    const { password, ...userData } = updatedDoc.data();
    
    res.json({ id: updatedDoc.id, ...userData });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ error: "Failed to ban user" });
  }
});

// Notification Routes
app.get('/api/notifications/user/:userId', async (req, res) => {
  try {
    const notificationsSnapshot = await db.collection('notifications')
      .where('userId', '==', req.params.userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    const notifications = notificationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

app.post('/api/notifications', async (req, res) => {
  try {
    const notificationData = {
      ...req.body,
      isRead: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const notificationRef = await db.collection('notifications').add(notificationData);
    res.json({ id: notificationRef.id, ...notificationData });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ error: "Failed to create notification" });
  }
});

// Support Chat Routes
app.get('/api/support/user/:userId', async (req, res) => {
  try {
    const chatsSnapshot = await db.collection('supportChats')
      .where('userId', '==', req.params.userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    const chats = chatsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json(chats);
  } catch (error) {
    console.error('Get support chats error:', error);
    res.status(500).json({ error: "Failed to fetch support chats" });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`UBS Swiss Digital Banking server running on port ${PORT}`);
});

module.exports = app;