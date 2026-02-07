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
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  BarChart3,
  AlertTriangle,
  Upload,
} from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6 animate-fade-in">
            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KPICard
                title="Total Revenue"
                value="$847,234"
                change={12.5}
                changeLabel="vs last month"
                icon={DollarSign}
                variant="success"
              />
              <KPICard
                title="Total Orders"
                value="12,847"
                change={8.2}
                changeLabel="vs last month"
                icon={ShoppingCart}
                variant="default"
              />
              <KPICard
                title="Active Customers"
                value="4,392"
                change={-2.4}
                changeLabel="vs last month"
                icon={Users}
                variant="warning"
              />
              <KPICard
                title="Conversion Rate"
                value="3.24%"
                change={15.3}
                changeLabel="vs last month"
                icon={TrendingUp}
                variant="success"
              />
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <SalesChart />
              </div>
              <ProductPerformance />
            </div>

            {/* Bottom Row */}
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
            <div className="grid gap-4 sm:grid-cols-3">
              <KPICard
                title="Active Alerts"
                value="7"
                change={-25}
                changeLabel="vs last week"
                icon={AlertTriangle}
                variant="warning"
              />
              <KPICard
                title="Resolved Today"
                value="12"
                change={40}
                changeLabel="vs yesterday"
                icon={BarChart3}
                variant="success"
              />
              <KPICard
                title="Model Accuracy"
                value="96.2%"
                change={2.1}
                changeLabel="improvement"
                icon={TrendingUp}
                variant="default"
              />
            </div>
            <AnomalyIndicator />
          </div>
        );

      case "customers":
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KPICard
                title="Total Customers"
                value="24,847"
                change={5.2}
                changeLabel="vs last month"
                icon={Users}
                variant="default"
              />
              <KPICard
                title="New This Month"
                value="1,234"
                change={12.8}
                changeLabel="vs last month"
                icon={TrendingUp}
                variant="success"
              />
              <KPICard
                title="Avg. Lifetime Value"
                value="$2,847"
                change={8.4}
                changeLabel="vs last quarter"
                icon={DollarSign}
                variant="success"
              />
              <KPICard
                title="Churn Rate"
                value="2.4%"
                change={-15}
                changeLabel="vs last month"
                icon={Users}
                variant="success"
              />
            </div>
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
              <p className="mt-1 text-sm text-muted-foreground">
                This module is coming soon
              </p>
            </div>
          </div>
        );
    }
  };

  const getPageTitle = () => {
    const titles: Record<string, { title: string; subtitle: string }> = {
      dashboard: { title: "Executive Dashboard", subtitle: "Real-time business intelligence overview" },
      analytics: { title: "Analytics", subtitle: "Deep dive into your sales data" },
      forecasting: { title: "Demand Forecasting", subtitle: "ML-powered sales predictions" },
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
    <div className="min-h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="pl-16 lg:pl-64">
        <Header />
        
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">{pageInfo.title}</h1>
            <p className="text-sm text-muted-foreground">{pageInfo.subtitle}</p>
          </div>
          
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
