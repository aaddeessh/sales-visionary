import { useCallback } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
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

function normalizeRows(value: unknown): string[][] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((row): row is unknown[] => Array.isArray(row))
    .map((row) => row.map((cell) => String(cell ?? "")));
}

export function useFirestoreDatasets() {
  const saveDataset = useCallback(
    async (userId: string, fileName: string, headers: string[], rawRows: string[][]) => {
      // Firestore does not support nested arrays directly, so we serialize rows.
      // Also cap storage size for performance.
      const trimmedRows = rawRows.slice(0, 5000);

      const docRef = await addDoc(collection(db, COLLECTION), {
        userId,
        fileName,
        headers,
        rawRowsJson: JSON.stringify(trimmedRows),
        rowCount: rawRows.length,
        createdAt: serverTimestamp(),
      });

      return docRef.id;
    },
    []
  );

  const loadDatasets = useCallback(async (userId: string): Promise<FirestoreDataset[]> => {
    const q = query(collection(db, COLLECTION), where("userId", "==", userId));
    const snapshot = await getDocs(q);

    return snapshot.docs
      .map((d) => {
        const data = d.data();

        let rawRows: string[][] = [];
        if (typeof data.rawRowsJson === "string") {
          try {
            rawRows = normalizeRows(JSON.parse(data.rawRowsJson));
          } catch {
            rawRows = [];
          }
        } else {
          // Backward compatibility for any old shape
          rawRows = normalizeRows(data.rawRows);
        }

        return {
          id: d.id,
          fileName: typeof data.fileName === "string" ? data.fileName : "Untitled dataset",
          headers: Array.isArray(data.headers) ? data.headers.map((h) => String(h)) : [],
          rawRows,
          createdAt: data.createdAt,
        };
      })
      .sort((a, b) => {
        const aMs = a.createdAt?.toMillis?.() ?? 0;
        const bMs = b.createdAt?.toMillis?.() ?? 0;
        return bMs - aMs;
      });
  }, []);

  const removeDataset = useCallback(async (docId: string) => {
    await deleteDoc(doc(db, COLLECTION, docId));
  }, []);

  return { saveDataset, loadDatasets, removeDataset };
}

