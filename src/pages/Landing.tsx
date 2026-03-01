import { Activity, BarChart3, TrendingUp, Shield, Zap, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const features = [
  { icon: BarChart3, title: "Real-time Analytics", desc: "Interactive dashboards with live sales data visualization and KPI tracking." },
  { icon: TrendingUp, title: "ML Forecasting", desc: "Predict future demand using machine learning models with confidence intervals." },
  { icon: Shield, title: "Anomaly Detection", desc: "Automated outlier monitoring with instant alerts on unusual patterns." },
  { icon: Users, title: "Customer Intelligence", desc: "Segmentation, lifetime value analysis, and churn prediction." },
  { icon: Zap, title: "Fast Data Processing", desc: "Upload CSV/Excel files and get cleaned, transformed data in seconds." },
  { icon: Activity, title: "Executive Reports", desc: "Generate comprehensive reports for stakeholder presentations." },
];

const stats = [
  { value: "96.2%", label: "Model Accuracy" },
  { value: "2.4M+", label: "Data Points Processed" },
  { value: "<500ms", label: "Query Response Time" },
  { value: "99.9%", label: "Uptime SLA" },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">SalesIQ</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate("/auth")}>
              Log in
            </Button>
            <Button onClick={() => navigate("/auth?tab=signup")}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(190_95%_45%/0.12),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 text-center lg:py-36">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm text-muted-foreground mb-6">
            <Zap className="h-3.5 w-3.5 text-primary" />
            ML-Powered Sales Intelligence
          </div>
          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Transform Your Sales Data Into{" "}
            <span className="gradient-text">Actionable Intelligence</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Upload your data, get instant analytics, forecast demand with ML models, and detect anomalies — all in one powerful platform.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button size="lg" onClick={() => navigate("/auth?tab=signup")} className="gap-2">
              Start Free <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-secondary/30">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-12 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold gradient-text">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold">Everything You Need for Sales Analytics</h2>
          <p className="mt-3 text-muted-foreground">Built for data analysts and business leaders who want answers, not dashboards.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="glass-card rounded-xl p-6 transition-all duration-300 hover:border-primary/30 hover:glow-primary">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-24 text-center">
          <h2 className="text-3xl font-bold">Ready to unlock your sales insights?</h2>
          <p className="mt-3 text-muted-foreground">Get started for free. No credit card required.</p>
          <Button size="lg" className="mt-8 gap-2" onClick={() => navigate("/auth?tab=signup")}>
            Create Your Account <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/20 px-6 py-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="h-4 w-4 text-primary" />
            SalesIQ © 2026
          </div>
          <p className="text-xs text-muted-foreground">Intelligent Sales Analytics & Forecasting Platform</p>
        </div>
      </footer>
    </div>
  );
}
