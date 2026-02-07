import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Transaction {
  id: string;
  customer: string;
  product: string;
  amount: number;
  status: "completed" | "pending" | "refunded";
  date: string;
}

const transactions: Transaction[] = [
  {
    id: "TXN-001",
    customer: "Acme Corp",
    product: "Enterprise Suite",
    amount: 24500,
    status: "completed",
    date: "Today, 2:34 PM",
  },
  {
    id: "TXN-002",
    customer: "TechStart Inc",
    product: "Professional Plan",
    amount: 12800,
    status: "completed",
    date: "Today, 11:20 AM",
  },
  {
    id: "TXN-003",
    customer: "Global Retail",
    product: "Analytics Add-on",
    amount: 4500,
    status: "pending",
    date: "Yesterday",
  },
  {
    id: "TXN-004",
    customer: "DataFlow LLC",
    product: "Basic Plan",
    amount: 2100,
    status: "refunded",
    date: "Yesterday",
  },
  {
    id: "TXN-005",
    customer: "Innovate Co",
    product: "Enterprise Suite",
    amount: 34200,
    status: "completed",
    date: "2 days ago",
  },
];

export function RecentTransactions() {
  const getStatusStyles = (status: Transaction["status"]) => {
    switch (status) {
      case "completed":
        return "bg-success/10 text-success";
      case "pending":
        return "bg-warning/10 text-warning";
      case "refunded":
        return "bg-danger/10 text-danger";
    }
  };

  return (
    <div className="glass-card rounded-xl border border-border p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Recent Transactions
          </h3>
          <p className="text-sm text-muted-foreground">Latest sales activity</p>
        </div>
        <button className="text-sm font-medium text-primary hover:underline">
          View all
        </button>
      </div>

      <div className="space-y-3">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="group flex items-center justify-between rounded-lg border border-transparent p-3 transition-all hover:border-border hover:bg-secondary/30"
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  transaction.status === "refunded"
                    ? "bg-danger/10"
                    : "bg-success/10"
                )}
              >
                {transaction.status === "refunded" ? (
                  <ArrowDownRight className="h-5 w-5 text-danger" />
                ) : (
                  <ArrowUpRight className="h-5 w-5 text-success" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {transaction.customer}
                </p>
                <p className="text-xs text-muted-foreground">
                  {transaction.product}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p
                className={cn(
                  "text-sm font-semibold",
                  transaction.status === "refunded"
                    ? "text-danger"
                    : "text-foreground"
                )}
              >
                {transaction.status === "refunded" ? "-" : "+"}$
                {transaction.amount.toLocaleString()}
              </p>
              <div className="mt-1 flex items-center justify-end gap-2">
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
                    getStatusStyles(transaction.status)
                  )}
                >
                  {transaction.status}
                </span>
                <span className="text-xs text-muted-foreground">
                  {transaction.date}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
