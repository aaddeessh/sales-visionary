import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { KPICard } from "@/components/dashboard/KPICard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { ProductPerformance } from "@/components/dashboard/ProductPerformance";
import { AnomalyIndicator } from "@/components/dashboard/AnomalyIndicator";
import { RegionalHeatmap } from "@/components/dashboard/RegionalHeatmap";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { ForecastingPanel } from "@/components/dashboard/ForecastingPanel";
import { DataUpload } from "@/components/dashboard/DataUpload";
import { ReportsPanel } from "@/components/dashboard/ReportsPanel";
import { SettingsPanel } from "@/components/dashboard/SettingsPanel";
import { DatasetSwitcher } from "@/components/dashboard/DatasetSwitcher";
import { CsvDataProvider, useCsvData, deriveKPIs } from "@/hooks/useCsvData";
import {
  IndianRupee,
  ShoppingCart,
  Users,
  TrendingUp,
  BarChart3,
  AlertTriangle,
} from "lucide-react";

function DashboardKPIs() {
  const { rows } = useCsvData();
  const kpis = deriveKPIs(rows);

  if (!kpis) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Total Revenue" value="—" change={0} changeLabel="Upload CSV" icon={IndianRupee} variant="default" />
        <KPICard title="Total Orders" value="—" change={0} changeLabel="Upload CSV" icon={ShoppingCart} variant="default" />
        <KPICard title="Unique Customers" value="—" change={0} changeLabel="Upload CSV" icon={Users} variant="default" />
        <KPICard title="Avg Order Value" value="—" change={0} changeLabel="Upload CSV" icon={TrendingUp} variant="default" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KPICard title="Total Revenue" value={`₹${kpis.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} change={0} changeLabel={`${kpis.totalOrders} orders`} icon={IndianRupee} variant="success" />
      <KPICard title="Total Orders" value={kpis.totalOrders.toLocaleString()} change={0} changeLabel="from CSV" icon={ShoppingCart} variant="default" />
      <KPICard title="Unique Customers" value={kpis.uniqueCustomers.toLocaleString()} change={0} changeLabel="from CSV" icon={Users} variant="default" />
      <KPICard title="Avg Order Value" value={`₹${kpis.avgOrderValue.toFixed(2)}`} change={0} changeLabel="per order" icon={TrendingUp} variant="success" />
    </div>
  );
}

function DashboardContent({ activeTab }: { activeTab: string }) {
  switch (activeTab) {
    case "dashboard":
      return (
        <div className="space-y-6 animate-fade-in">
          <DashboardKPIs />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2"><SalesChart /></div>
            <ProductPerformance />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <RecentTransactions />
            <RegionalHeatmap />
          </div>
        </div>
      );
    case "analytics":
      return (
        <div className="space-y-6 animate-fade-in">
          <div className="grid gap-6 lg:grid-cols-2">
            <SalesChart />
            <ProductPerformance />
          </div>
          <RegionalHeatmap />
        </div>
      );
    case "forecasting":
      return (
        <div className="space-y-6 animate-fade-in">
          <ForecastingPanel />
          <div className="grid gap-6 lg:grid-cols-2">
            <SalesChart />
            <AnomalyIndicator />
          </div>
        </div>
      );
    case "anomalies":
      return (
        <div className="space-y-6 animate-fade-in">
          <AnomalyIndicator />
        </div>
      );
    case "customers":
      return (
        <div className="space-y-6 animate-fade-in">
          <DashboardKPIs />
          <div className="grid gap-6 lg:grid-cols-2">
            <RecentTransactions />
            <RegionalHeatmap />
          </div>
        </div>
      );
    case "upload":
      return (
        <div className="max-w-3xl animate-fade-in">
          <DataUpload />
        </div>
      );
    default:
      return (
        <div className="flex h-96 items-center justify-center animate-fade-in">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">This module is coming soon</p>
          </div>
        </div>
      );
  }
}

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const getPageTitle = () => {
    const titles: Record<string, { title: string; subtitle: string }> = {
      dashboard: { title: "Executive Dashboard", subtitle: "Real-time business intelligence overview" },
      analytics: { title: "Analytics", subtitle: "Deep dive into your sales data" },
      forecasting: { title: "Demand Forecasting", subtitle: "Trend-based sales predictions" },
      anomalies: { title: "Anomaly Detection", subtitle: "Automated outlier monitoring" },
      customers: { title: "Customer Intelligence", subtitle: "Segmentation and lifetime value analysis" },
      upload: { title: "Data Upload", subtitle: "Import and process your datasets" },
      database: { title: "Database", subtitle: "Manage your data warehouse" },
      reports: { title: "Reports", subtitle: "Generate and export analytics reports" },
      settings: { title: "Settings", subtitle: "Configure your analytics platform" },
    };
    return titles[activeTab] || { title: "Dashboard", subtitle: "" };
  };

  const pageInfo = getPageTitle();

  return (
    <CsvDataProvider>
      <div className="min-h-screen bg-background">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="pl-16 lg:pl-64">
          <Header />
          <main className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{pageInfo.title}</h1>
                <p className="text-sm text-muted-foreground">{pageInfo.subtitle}</p>
              </div>
              <DatasetSwitcher />
            </div>
            <DashboardContent activeTab={activeTab} />
          </main>
        </div>
      </div>
    </CsvDataProvider>
  );
};

export default Index;
