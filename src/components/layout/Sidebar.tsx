import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  TrendingUp,
  BarChart3,
  Upload,
  AlertTriangle,
  Users,
  Settings,
  ChevronLeft,
  Activity,
  Database,
  FileText,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "forecasting", label: "Forecasting", icon: TrendingUp },
  { id: "anomalies", label: "Anomalies", icon: AlertTriangle },
  { id: "customers", label: "Customers", icon: Users },
  { id: "upload", label: "Data Upload", icon: Upload },
];

const secondaryItems = [
  { id: "reports", label: "Reports", icon: FileText },
  { id: "settings", label: "Settings", icon: Settings },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-sidebar-border bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Activity className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-foreground">SalesIQ</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 transition-transform duration-300",
                collapsed && "rotate-180"
              )}
            />
          </button>
        </div>

        {/* Primary Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          <div className="mb-2">
            {!collapsed && (
              <span className="px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Main
              </span>
            )}
          </div>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                activeTab === item.id
                  ? "bg-primary/10 text-primary glow-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5 flex-shrink-0", activeTab === item.id && "text-primary")} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          ))}

          <div className="my-4 border-t border-sidebar-border" />

          <div className="mb-2">
            {!collapsed && (
              <span className="px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                System
              </span>
            )}
          </div>
          {secondaryItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                activeTab === item.id
                  ? "bg-primary/10 text-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Status */}
        {!collapsed && (
          <div className="border-t border-sidebar-border p-4">
            <div className="glass-card rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-success" />
                <span className="text-xs text-muted-foreground">System Online</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Last sync: 2 mins ago
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
