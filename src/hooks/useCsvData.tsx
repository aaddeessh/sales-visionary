import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useFirestoreDatasets } from "@/hooks/useFirestoreDatasets";
import { toast } from "sonner";

export interface CsvRow {
  [key: string]: string;
}

interface Dataset {
  id: string;
  firestoreId?: string; // Firestore document ID for persistence
  fileName: string;
  headers: string[];
  rawRows: string[][];
}

interface CsvDataContextType {
  headers: string[];
  rows: CsvRow[];
  rawRows: string[][];
  fileName: string | null;
  datasets: Dataset[];
  activeDatasetId: string | null;
  loadingHistory: boolean;
  addDataset: (fileName: string, headers: string[], rawRows: string[][], firestoreId?: string) => string;
  removeDataset: (id: string) => void;
  switchDataset: (id: string) => void;
  clearData: () => void;
  /** @deprecated use addDataset */
  setData: (fileName: string, headers: string[], rawRows: string[][]) => void;
}

const CsvDataContext = createContext<CsvDataContextType | undefined>(undefined);

let nextId = 1;

export function CsvDataProvider({ children }: { children: ReactNode }) {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [activeDatasetId, setActiveDatasetId] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const { user } = useAuth();
  const { loadDatasets } = useFirestoreDatasets();

  // Load previous datasets from Firestore on login
  useEffect(() => {
    if (!user) {
      setDatasets([]);
      setActiveDatasetId(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingHistory(true);
      try {
        const saved = await loadDatasets(user.uid);
        if (cancelled) return;
        if (saved.length > 0) {
          const loaded: Dataset[] = saved.map((s) => ({
            id: `ds-${nextId++}`,
            firestoreId: s.id,
            fileName: s.fileName,
            headers: s.headers,
            rawRows: s.rawRows,
          }));
          setDatasets(loaded);
          setActiveDatasetId(loaded[0].id);
          toast.success(`Loaded ${loaded.length} previous dataset(s)`);
        }
      } catch (err) {
        console.error("Failed to load datasets from Firestore", err);
      } finally {
        if (!cancelled) setLoadingHistory(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user, loadDatasets]);

  const active = useMemo(() => datasets.find((d) => d.id === activeDatasetId) || null, [datasets, activeDatasetId]);

  const headers = active?.headers ?? [];
  const rawRows = active?.rawRows ?? [];
  const fileName = active?.fileName ?? null;

  const rows = useMemo(() => {
    return rawRows.map((row) => {
      const obj: CsvRow = {};
      headers.forEach((h, i) => {
        obj[h] = row[i] || "";
      });
      return obj;
    });
  }, [headers, rawRows]);

  const addDataset = useCallback((name: string, h: string[], r: string[][], firestoreId?: string) => {
    const id = `ds-${nextId++}`;
    const ds: Dataset = { id, firestoreId, fileName: name, headers: h, rawRows: r };
    setDatasets((prev) => [...prev, ds]);
    setActiveDatasetId(id);
    return id;
  }, []);

  const removeDataset = useCallback((id: string) => {
    setDatasets((prev) => {
      const next = prev.filter((d) => d.id !== id);
      return next;
    });
    setActiveDatasetId((cur) => {
      if (cur === id) {
        // switch to last remaining or null
        const remaining = datasets.filter((d) => d.id !== id);
        return remaining.length > 0 ? remaining[remaining.length - 1].id : null;
      }
      return cur;
    });
  }, [datasets]);

  const switchDataset = useCallback((id: string) => {
    setActiveDatasetId(id);
  }, []);

  const clearData = useCallback(() => {
    setDatasets([]);
    setActiveDatasetId(null);
  }, []);

  // backward compat
  const setData = useCallback((name: string, h: string[], r: string[][]) => {
    addDataset(name, h, r);
  }, [addDataset]);

  return (
    <CsvDataContext.Provider value={{ headers, rows, rawRows, fileName, datasets, activeDatasetId, loadingHistory, addDataset, removeDataset, switchDataset, clearData, setData }}>
      {children}
    </CsvDataContext.Provider>
  );
}

export function useCsvData() {
  const ctx = useContext(CsvDataContext);
  if (!ctx) throw new Error("useCsvData must be used within CsvDataProvider");
  return ctx;
}

// Helper functions to derive dashboard data from CSV rows
export function deriveKPIs(rows: CsvRow[]) {
  if (rows.length === 0) return null;

  const totalField = findField(rows[0], ["total", "amount", "revenue", "sales", "price"]);
  const qtyField = findField(rows[0], ["quantity", "qty", "units", "count"]);
  const customerField = findField(rows[0], ["customer_id", "customer", "client"]);

  const totalRevenue = totalField
    ? rows.reduce((sum, r) => sum + (parseFloat(r[totalField]) || 0), 0)
    : 0;
  const totalOrders = rows.length;
  const uniqueCustomers = customerField
    ? new Set(rows.map((r) => r[customerField])).size
    : 0;
  const avgOrderValue = totalRevenue / (totalOrders || 1);

  return { totalRevenue, totalOrders, uniqueCustomers, avgOrderValue };
}

export function deriveSalesOverTime(rows: CsvRow[]) {
  const dateField = findField(rows[0] || {}, ["date", "order_date", "created_at", "timestamp"]);
  const totalField = findField(rows[0] || {}, ["total", "amount", "revenue", "sales"]);
  if (!dateField || !totalField || rows.length === 0) return [];

  const grouped: Record<string, number> = {};
  rows.forEach((r) => {
    const d = r[dateField]?.substring(0, 7) || "Unknown";
    grouped[d] = (grouped[d] || 0) + (parseFloat(r[totalField]) || 0);
  });

  return Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, sales]) => ({ month, sales }));
}

export function deriveCategoryData(rows: CsvRow[]) {
  const catField = findField(rows[0] || {}, ["category", "product_category", "type", "department"]);
  const totalField = findField(rows[0] || {}, ["total", "amount", "revenue", "sales"]);
  const qtyField = findField(rows[0] || {}, ["quantity", "qty", "units"]);
  if (!catField || !totalField || rows.length === 0) return [];

  const grouped: Record<string, { sales: number; units: number }> = {};
  rows.forEach((r) => {
    const cat = r[catField] || "Other";
    if (!grouped[cat]) grouped[cat] = { sales: 0, units: 0 };
    grouped[cat].sales += parseFloat(r[totalField]) || 0;
    grouped[cat].units += parseInt(r[qtyField] || "0") || 0;
  });

  return Object.entries(grouped)
    .map(([name, data]) => ({ name, sales: data.sales, units: data.units }))
    .sort((a, b) => b.sales - a.sales);
}

export function deriveRegionData(rows: CsvRow[]) {
  const regionField = findField(rows[0] || {}, ["region", "country", "location", "territory"]);
  const totalField = findField(rows[0] || {}, ["total", "amount", "revenue", "sales"]);
  if (!regionField || !totalField || rows.length === 0) return [];

  const grouped: Record<string, number> = {};
  rows.forEach((r) => {
    const region = r[regionField] || "Unknown";
    grouped[region] = (grouped[region] || 0) + (parseFloat(r[totalField]) || 0);
  });

  const maxRevenue = Math.max(...Object.values(grouped), 1);
  return Object.entries(grouped)
    .map(([name, revenue]) => ({
      name,
      code: name.substring(0, 4).toUpperCase(),
      revenue,
      intensity: Math.round((revenue / maxRevenue) * 100),
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

export function deriveTransactions(rows: CsvRow[]) {
  const dateField = findField(rows[0] || {}, ["date", "order_date", "created_at"]);
  const totalField = findField(rows[0] || {}, ["total", "amount", "revenue"]);
  const productField = findField(rows[0] || {}, ["product", "item", "product_name"]);
  const customerField = findField(rows[0] || {}, ["customer_id", "customer", "client"]);
  const paymentField = findField(rows[0] || {}, ["payment_method", "payment", "method"]);

  if (rows.length === 0) return [];

  return rows.slice(-10).reverse().map((r, i) => ({
    id: `TXN-${String(i + 1).padStart(3, "0")}`,
    customer: customerField ? r[customerField] : `Row ${i + 1}`,
    product: productField ? r[productField] : "N/A",
    amount: totalField ? parseFloat(r[totalField]) || 0 : 0,
    status: "completed" as const,
    date: dateField ? r[dateField] : "N/A",
    payment: paymentField ? r[paymentField] : "N/A",
  }));
}

function findField(row: CsvRow, candidates: string[]): string | null {
  const keys = Object.keys(row).map((k) => k.toLowerCase());
  for (const candidate of candidates) {
    const idx = keys.findIndex((k) => k.includes(candidate));
    if (idx !== -1) return Object.keys(row)[idx];
  }
  return null;
}
