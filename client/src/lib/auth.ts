import { auth } from "./firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import FirestoreService from "@/services/firestore";

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  ubsId: string;
  accountType: string;
  isApproved: boolean;
  isBanned: boolean;
  dateOfBirth: string;
  createdAt: any;
}

export const signIn = async (email: string, password: string): Promise<AuthUser> => {
  try {
    // First authenticate with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Then get user data from Firestore
    const userData = await FirestoreService.getUserByEmail(email);
    
    if (!userData) {
      throw new Error("User not found in database");
    }
    
    const userInfo = userData as any;
    
    if (userInfo.isBanned) {
      throw new Error("Kindly contact support for assistance");
    }
    
    if (!userInfo.isApproved) {
      throw new Error("Account pending approval");
    }
    
    return userInfo as AuthUser;
  } catch (error: any) {
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      throw new Error("Invalid credentials");
    }
    throw new Error(error.message || "Sign in failed");
  }
};

export const signUp = async (userData: {
  username: string;
  email: string;
  password: string;
  dateOfBirth: string;
  accountType: string;
  idCardUrl?: string;
}): Promise<AuthUser> => {
  try {
    // Check if username already exists
    const existingUsername = await FirestoreService.getUserByUsername(userData.username);
    if (existingUsername) {
      throw new Error("Username already exists");
    }
    
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
    const firebaseUser = userCredential.user;
    
    // Create user document in Firestore
    const newUserData = {
      username: userData.username,
      email: userData.email,
      dateOfBirth: userData.dateOfBirth,
      accountType: userData.accountType,
      idCardUrl: userData.idCardUrl || null,
      isApproved: userData.username === "admin", // Auto-approve admin
      isBanned: false,
      ubsId: FirestoreService.generateUbsId(),
      firebaseUid: firebaseUser.uid,
    };
    
    const userId = await FirestoreService.createUser(newUserData);
    
    return {
      id: userId,
      ...newUserData,
      createdAt: new Date()
    };
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      throw new Error("Email already exists");
    }
    throw new Error(error.message || "Registration failed");
  }
};

export const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
