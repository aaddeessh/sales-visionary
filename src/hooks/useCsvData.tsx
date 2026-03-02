import { createContext, useContext, useState, ReactNode, useCallback, useMemo } from "react";

export interface CsvRow {
  [key: string]: string;
}

interface CsvDataContextType {
  headers: string[];
  rows: CsvRow[];
  rawRows: string[][];
  fileName: string | null;
  setData: (fileName: string, headers: string[], rawRows: string[][]) => void;
  clearData: () => void;
}

const CsvDataContext = createContext<CsvDataContextType | undefined>(undefined);

export function CsvDataProvider({ children }: { children: ReactNode }) {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<string[][]>([]);
  const [fileName, setFileName] = useState<string | null>(null);

  const rows = useMemo(() => {
    return rawRows.map((row) => {
      const obj: CsvRow = {};
      headers.forEach((h, i) => {
        obj[h] = row[i] || "";
      });
      return obj;
    });
  }, [headers, rawRows]);

  const setData = useCallback((name: string, h: string[], r: string[][]) => {
    setFileName(name);
    setHeaders(h);
    setRawRows(r);
  }, []);

  const clearData = useCallback(() => {
    setFileName(null);
    setHeaders([]);
    setRawRows([]);
  }, []);

  return (
    <CsvDataContext.Provider value={{ headers, rows, rawRows, fileName, setData, clearData }}>
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
    const d = r[dateField]?.substring(0, 7) || "Unknown"; // group by YYYY-MM
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
