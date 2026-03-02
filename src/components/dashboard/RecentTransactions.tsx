import { cn } from "@/lib/utils";
import { ArrowUpRight, FileSpreadsheet } from "lucide-react";
import { useCsvData, deriveTransactions } from "@/hooks/useCsvData";

export function RecentTransactions() {
  const { rows } = useCsvData();
  const transactions = deriveTransactions(rows);

  if (transactions.length === 0) {
    return (
      <div className="glass-card rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
        <div className="flex h-48 flex-col items-center justify-center text-muted-foreground">
          <FileSpreadsheet className="mb-2 h-10 w-10 opacity-40" />
          <p className="text-sm">Upload a CSV to view transactions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl border border-border p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
        <p className="text-sm text-muted-foreground">Latest from uploaded data</p>
      </div>
      <div className="space-y-3">
        {transactions.map((t) => (
          <div key={t.id} className="group flex items-center justify-between rounded-lg border border-transparent p-3 transition-all hover:border-border hover:bg-secondary/30">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <ArrowUpRight className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{t.customer}</p>
                <p className="text-xs text-muted-foreground">{t.product}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">+${t.amount.toLocaleString()}</p>
              <div className="mt-1 flex items-center justify-end gap-2">
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium capitalize bg-success/10 text-success")}>
                  {t.status}
                </span>
                <span className="text-xs text-muted-foreground">{t.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
