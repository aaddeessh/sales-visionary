import { useState } from "react";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UploadedFile {
  name: string;
  size: string;
  status: "uploading" | "processing" | "complete" | "error";
  progress: number;
}

export function DataUpload() {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([
    { name: "sales_q4_2024.csv", size: "2.4 MB", status: "complete", progress: 100 },
    { name: "customers_export.xlsx", size: "1.8 MB", status: "processing", progress: 65 },
  ]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const getStatusIcon = (status: UploadedFile["status"]) => {
    switch (status) {
      case "complete":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-danger" />;
      default:
        return (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        );
    }
  };

  return (
    <div className="glass-card rounded-xl border border-border p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Data Ingestion</h3>
        <p className="text-sm text-muted-foreground">
          Upload CSV or Excel files for analysis
        </p>
      </div>

      {/* Upload Zone */}
      <div
        className={cn(
          "relative rounded-xl border-2 border-dashed p-8 text-center transition-all",
          dragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-secondary/30"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrag}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className={cn(
              "rounded-xl p-4 transition-colors",
              dragActive ? "bg-primary/20" : "bg-secondary"
            )}
          >
            <Upload
              className={cn(
                "h-8 w-8 transition-colors",
                dragActive ? "text-primary" : "text-muted-foreground"
              )}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              Drop files here or{" "}
              <button className="text-primary hover:underline">browse</button>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Supports CSV, XLSX, XLS (max 50MB)
            </p>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-6 space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Recent uploads</p>
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <FileSpreadsheet className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{file.size}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {file.status === "processing" && (
                  <div className="w-24">
                    <div className="h-1.5 overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                    <p className="mt-1 text-right text-[10px] text-muted-foreground">
                      {file.progress}%
                    </p>
                  </div>
                )}
                {getStatusIcon(file.status)}
                <button
                  onClick={() => removeFile(index)}
                  className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Processing Pipeline */}
      <div className="mt-6 rounded-lg bg-secondary/30 p-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Processing Pipeline
        </p>
        <div className="flex items-center justify-between">
          {["Upload", "Clean", "Transform", "Validate", "Store"].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium",
                    index < 3
                      ? "bg-success text-success-foreground"
                      : "bg-secondary text-muted-foreground"
                  )}
                >
                  {index + 1}
                </div>
                <span className="mt-1 text-[10px] text-muted-foreground">{step}</span>
              </div>
              {index < 4 && (
                <div
                  className={cn(
                    "mx-1 h-0.5 w-8",
                    index < 2 ? "bg-success" : "bg-border"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <Button className="mt-6 w-full" variant="default">
        Process & Analyze Data
      </Button>
    </div>
  );
}
