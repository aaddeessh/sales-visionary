import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCsvData, deriveKPIs } from "@/hooks/useCsvData";
import { FileText, Download, Calendar, BarChart3, TrendingUp, Users, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReportTemplate {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  category: string;
}

const reportTemplates: ReportTemplate[] = [
  { id: "sales-summary", title: "Sales Summary", description: "Overview of revenue, orders, and trends for a selected period.", icon: BarChart3, category: "Sales" },
  { id: "product-performance", title: "Product Performance", description: "Breakdown of sales by product category with rankings.", icon: TrendingUp, category: "Products" },
  { id: "customer-insights", title: "Customer Insights", description: "Unique customers, repeat rates, and segmentation overview.", icon: Users, category: "Customers" },
  { id: "monthly-trends", title: "Monthly Trends", description: "Month-over-month comparison of key business metrics.", icon: Calendar, category: "Trends" },
];

export function ReportsPanel() {
  const { rows } = useCsvData();
  const kpis = deriveKPIs(rows);
  const { toast } = useToast();
  const [generating, setGenerating] = useState<string | null>(null);

  const handleGenerate = (report: ReportTemplate) => {
    if (!rows.length) {
      toast({ title: "No data available", description: "Please upload a CSV dataset first.", variant: "destructive" });
      return;
    }

    setGenerating(report.id);

    // Simulate report generation and create a CSV download
    setTimeout(() => {
      try {
        let csvContent = "";

        if (report.id === "sales-summary" && kpis) {
          csvContent = `Metric,Value\nTotal Revenue,₹${kpis.totalRevenue.toLocaleString("en-IN")}\nTotal Orders,${kpis.totalOrders}\nUnique Customers,${kpis.uniqueCustomers}\nAvg Order Value,₹${kpis.avgOrderValue.toFixed(2)}\n`;
        } else if (report.id === "product-performance") {
          const categories: Record<string, number> = {};
          rows.forEach((r) => {
            const cat = r["Product Category"] || r["Category"] || "Unknown";
            const sales = parseFloat(r["Total Price"] || r["Sales"] || r["Revenue"] || "0");
            categories[cat] = (categories[cat] || 0) + sales;
          });
          csvContent = "Category,Revenue\n" + Object.entries(categories).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k},₹${v.toLocaleString("en-IN")}`).join("\n") + "\n";
        } else if (report.id === "customer-insights" && kpis) {
          csvContent = `Metric,Value\nUnique Customers,${kpis.uniqueCustomers}\nTotal Orders,${kpis.totalOrders}\nOrders Per Customer,${(kpis.totalOrders / kpis.uniqueCustomers).toFixed(2)}\nAvg Spend Per Customer,₹${(kpis.totalRevenue / kpis.uniqueCustomers).toFixed(2)}\n`;
        } else if (report.id === "monthly-trends") {
          const months: Record<string, number> = {};
          rows.forEach((r) => {
            const date = r["Order Date"] || r["Date"] || "";
            const month = date.substring(0, 7) || "Unknown";
            const sales = parseFloat(r["Total Price"] || r["Sales"] || r["Revenue"] || "0");
            months[month] = (months[month] || 0) + sales;
          });
          csvContent = "Month,Revenue\n" + Object.entries(months).sort().map(([k, v]) => `${k},₹${v.toLocaleString("en-IN")}`).join("\n") + "\n";
        }

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${report.id}-report.csv`;
        a.click();
        URL.revokeObjectURL(url);

        toast({ title: "Report generated", description: `${report.title} has been downloaded.` });
      } catch {
        toast({ title: "Error", description: "Failed to generate report.", variant: "destructive" });
      } finally {
        setGenerating(null);
      }
    }, 800);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            Report Templates
          </CardTitle>
          <CardDescription>Generate and download reports from your uploaded data.</CardDescription>
        </CardHeader>
        <CardContent>
          {!rows.length && (
            <div className="mb-4 rounded-lg border border-warning/30 bg-warning/5 p-3 text-sm text-warning">
              Upload a CSV dataset first to generate reports.
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {reportTemplates.map((report) => (
              <Card key={report.id} className="border-border bg-secondary/30 transition-colors hover:bg-secondary/50">
                <CardContent className="flex items-start gap-4 p-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <report.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-foreground">{report.title}</h4>
                      <Badge variant="secondary" className="text-xs">{report.category}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{report.description}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      disabled={!rows.length || generating === report.id}
                      onClick={() => handleGenerate(report)}
                    >
                      {generating === report.id ? (
                        <><Loader2 className="h-3 w-3 animate-spin" /> Generating...</>
                      ) : (
                        <><Download className="h-3 w-3" /> Generate</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
