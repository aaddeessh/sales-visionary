import { useCallback } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface FirestoreDataset {
  id: string;
  fileName: string;
  headers: string[];
  rawRows: string[][];
  createdAt?: any;
}

const COLLECTION = "datasets";

export function useFirestoreDatasets() {
  const saveDataset = useCallback(
    async (userId: string, fileName: string, headers: string[], rawRows: string[][]) => {
      // Firestore doc limit is ~1MB. Chunk rows into batches if needed,
      // but for typical CSV files we store as-is. Limit to 5000 rows max.
      const trimmedRows = rawRows.slice(0, 5000);
      const docRef = await addDoc(collection(db, COLLECTION), {
        userId,
        fileName,
        headers,
        rawRows: trimmedRows,
        rowCount: rawRows.length,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    },
    []
  );

  const loadDatasets = useCallback(async (userId: string): Promise<FirestoreDataset[]> => {
    const q = query(
      collection(db, COLLECTION),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      fileName: d.data().fileName,
      headers: d.data().headers,
      rawRows: d.data().rawRows,
    }));
  }, []);

  const removeDataset = useCallback(async (docId: string) => {
    await deleteDoc(doc(db, COLLECTION, docId));
  }, []);

  return { saveDataset, loadDatasets, removeDataset };
}
