import { useState, useEffect } from "react";
import { 
  collection, 
  doc, 
  onSnapshot, 
  query, 
  where, 
  orderBy,
  DocumentData,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// Hook to get real-time collection data
export function useFirestoreCollection(collectionName: string, conditions?: any[]) {
  const [data, setData] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!collectionName) {
      setLoading(false);
      return;
    }

    try {
      const collectionRef = collection(db, collectionName);
      
      let q: any = collectionRef;
      if (conditions && conditions.length > 0) {
        const queryConstraints: any[] = [];
        conditions.forEach(condition => {
          if (condition.type === 'where') {
            queryConstraints.push(where(condition.field, condition.operator, condition.value));
          } else if (condition.type === 'orderBy') {
            queryConstraints.push(orderBy(condition.field, condition.direction || 'desc'));
          }
        });
        
        if (queryConstraints.length > 0) {
          q = query(collectionRef, ...queryConstraints);
        }
      }

      const unsubscribe = onSnapshot(q, 
        (snapshot: any) => {
          const documents = snapshot.docs.map((doc: any) => {
            const data = doc.data();
            // Convert Firestore timestamps to JS dates
            const convertedData = Object.keys(data).reduce((acc, key) => {
              const value = data[key];
              if (value instanceof Timestamp) {
                acc[key] = value.toDate().toISOString();
              } else {
                acc[key] = value;
              }
              return acc;
            }, {} as any);

            return {
              id: doc.id,
              ...convertedData
            };
          });
          setData(documents);
          setLoading(false);
        },
        (err: any) => {
          console.error(`Firestore error for ${collectionName}:`, err);
          setError(err.message);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (err) {
      console.error(`Firestore setup error for ${collectionName}:`, err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  }, [collectionName, JSON.stringify(conditions)]);

  return { data, loading, error };
}

// Hook to get real-time document data
export function useFirestoreDocument(collectionName: string, documentId: string) {
  const [data, setData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!documentId || !collectionName) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, collectionName, documentId),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          // Convert Firestore timestamps to JS dates
          const convertedData = Object.keys(data).reduce((acc, key) => {
            const value = data[key];
            if (value instanceof Timestamp) {
              acc[key] = value.toDate().toISOString();
            } else {
              acc[key] = value;
            }
            return acc;
          }, {} as any);

          setData({ id: docSnapshot.id, ...convertedData });
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error(`Firestore document error for ${collectionName}/${documentId}:`, err);
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [collectionName, documentId]);

  return { data, loading, error };
}

// Utility functions for Firestore operations
export const firestoreService = {
  // Add document to collection
  async addDocument(collectionName: string, data: any) {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error(`Error adding document to ${collectionName}:`, error);
      throw error;
    }
  },

  // Update document
  async updateDocument(collectionName: string, documentId: string, data: any) {
    try {
      const docRef = doc(db, collectionName, documentId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error(`Error updating document ${collectionName}/${documentId}:`, error);
      throw error;
    }
  },

  // Delete document
  async deleteDocument(collectionName: string, documentId: string) {
    try {
      const docRef = doc(db, collectionName, documentId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting document ${collectionName}/${documentId}:`, error);
      throw error;
    }
  },

  // Get documents once (not real-time)
  async getDocuments(collectionName: string, conditions?: any[]) {
    try {
      const collectionRef = collection(db, collectionName);
      
      let q: any = collectionRef;
      if (conditions && conditions.length > 0) {
        const queryConstraints: any[] = [];
        conditions.forEach(condition => {
          if (condition.type === 'where') {
            queryConstraints.push(where(condition.field, condition.operator, condition.value));
          } else if (condition.type === 'orderBy') {
            queryConstraints.push(orderBy(condition.field, condition.direction || 'desc'));
          }
        });
        
        if (queryConstraints.length > 0) {
          q = query(collectionRef, ...queryConstraints);
        }
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc: any) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data
        };
      });
    } catch (error) {
      console.error(`Error getting documents from ${collectionName}:`, error);
      throw error;
    }
  }
};
