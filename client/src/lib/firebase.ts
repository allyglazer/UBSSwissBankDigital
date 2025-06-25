import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBqtN-DtaiQ3vejT89FWS80rCYu5nvQW0U",
  authDomain: "ubs-swiss-digital--banking.firebaseapp.com",
  projectId: "ubs-swiss-digital--banking",
  storageBucket: "ubs-swiss-digital--banking.firebasestorage.app",
  messagingSenderId: "108654368871",
  appId: "1:108654368871:web:2ec1787631c3d89ccf1cc2",
  measurementId: "G-M8B71HH3TC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Enable offline persistence for Firestore
import { enableNetwork, disableNetwork } from "firebase/firestore";

// Configure Firestore settings
export const enableFirestoreOffline = () => disableNetwork(db);
export const enableFirestoreOnline = () => enableNetwork(db);

export default app;
