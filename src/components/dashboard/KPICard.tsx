import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "danger";
}

export function KPICard({ title, value, change, changeLabel, icon: Icon, variant = "default" }: KPICardProps) {
  const isPositive = change >= 0;

  const variantStyles = {
    default: "border-border",
    success: "border-success/30 glow-success",
    warning: "border-warning/30",
    danger: "border-danger/30",
  };

  const iconBgStyles = {
    default: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    danger: "bg-danger/10 text-danger",
  };

  return (
    <div
      className={cn(
        "glass-card group relative overflow-hidden rounded-xl border p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-lg",
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                isPositive
                  ? "bg-success/10 text-success"
                  : "bg-danger/10 text-danger"
              )}
            >
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(change)}%
            </span>
            <span className="text-xs text-muted-foreground">{changeLabel}</span>
          </div>
        </div>
        <div className={cn("rounded-xl p-3", iconBgStyles[variant])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>

      {/* Decorative gradient */}
      <div
        className={cn(
          "absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40",
          variant === "success" && "bg-success",
          variant === "warning" && "bg-warning",
          variant === "danger" && "bg-danger",
          variant === "default" && "bg-primary"
        )}
      />
    </div>
  );
}
