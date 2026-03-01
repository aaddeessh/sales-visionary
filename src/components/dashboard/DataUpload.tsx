import { useState, useRef, useCallback } from "react";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ALLOWED_TYPES = [
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
const ALLOWED_EXTENSIONS = [".csv", ".xls", ".xlsx"];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

interface UploadedFile {
  name: string;
  size: string;
  status: "uploading" | "processing" | "complete" | "error";
  progress: number;
  errorMessage?: string;
  rows?: number;
  columns?: number;
  parsedData?: string[][];
  headers?: string[];
}

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = lines[0].split(",").map((h) => h.trim());
  const rows = lines.slice(1).map((line) => line.split(",").map((c) => c.trim()));
  return { headers, rows };
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function validateFile(file: File): string | null {
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext) && !ALLOWED_TYPES.includes(file.type)) {
    return `Unsupported file type. Please upload CSV, XLS, or XLSX files.`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `File too large (${formatFileSize(file.size)}). Maximum size is 50MB.`;
  }
  if (file.size === 0) {
    return `File is empty.`;
  }
  return null;
}

export function DataUpload() {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pipelineStep, setPipelineStep] = useState(0);

  const processFile = useCallback(async (file: File) => {
    const error = validateFile(file);
    const newFile: UploadedFile = {
      name: file.name,
      size: formatFileSize(file.size),
      status: error ? "error" : "uploading",
      progress: 0,
      errorMessage: error || undefined,
    };

    setFiles((prev) => [newFile, ...prev]);

    if (error) {
      toast.error(error);
      return;
    }

    // Simulate upload progress
    const fileIndex = 0; // new file is prepended
    for (let p = 0; p <= 100; p += 20) {
      await new Promise((r) => setTimeout(r, 150));
      setFiles((prev) =>
        prev.map((f, i) => (i === fileIndex ? { ...f, progress: p, status: p < 100 ? "uploading" : "processing" } : f))
      );
    }

    setPipelineStep(1);

    // Parse CSV
    if (file.name.endsWith(".csv")) {
      try {
        const text = await file.text();
        const { headers, rows } = parseCSV(text);

        setPipelineStep(2);
        await new Promise((r) => setTimeout(r, 400));

        // Validate data
        setPipelineStep(3);
        const emptyRows = rows.filter((r) => r.every((c) => c === "")).length;
        const mismatchedRows = rows.filter((r) => r.length !== headers.length).length;
        await new Promise((r) => setTimeout(r, 300));

        setPipelineStep(4);
        await new Promise((r) => setTimeout(r, 200));

        setFiles((prev) =>
          prev.map((f, i) =>
            i === fileIndex
              ? {
                  ...f,
                  status: "complete",
                  progress: 100,
                  rows: rows.length,
                  columns: headers.length,
                  parsedData: rows.slice(0, 100), // keep first 100 rows for preview
                  headers,
                }
              : f
          )
        );

        const warnings: string[] = [];
        if (emptyRows > 0) warnings.push(`${emptyRows} empty rows removed`);
        if (mismatchedRows > 0) warnings.push(`${mismatchedRows} rows with column mismatch`);

        toast.success(
          `${file.name} processed: ${rows.length} rows × ${headers.length} columns` +
            (warnings.length > 0 ? `. ${warnings.join(", ")}` : "")
        );
      } catch {
        setFiles((prev) =>
          prev.map((f, i) =>
            i === fileIndex ? { ...f, status: "error", errorMessage: "Failed to parse CSV" } : f
          )
        );
        toast.error("Failed to parse CSV file");
      }
    } else {
      // For non-CSV, mark complete without parsing
      await new Promise((r) => setTimeout(r, 800));
      setPipelineStep(4);
      setFiles((prev) =>
        prev.map((f, i) => (i === fileIndex ? { ...f, status: "complete", progress: 100 } : f))
      );
      toast.success(`${file.name} uploaded successfully`);
    }
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    droppedFiles.forEach(processFile);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach(processFile);
      e.target.value = "";
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
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

  const pipelineSteps = ["Upload", "Clean", "Transform", "Validate", "Store"];

  return (
    <div className="glass-card rounded-xl border border-border p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Data Ingestion</h3>
          <p className="text-sm text-muted-foreground">
            Upload CSV or Excel files for analysis
          </p>
        </div>
        <a href="/sample_sales_data.csv" download>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Sample CSV
          </Button>
        </a>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xls,.xlsx"
        multiple
        className="hidden"
        onChange={handleFileInput}
      />

      {/* Upload Zone */}
      <div
        className={cn(
          "relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all",
          dragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-secondary/30"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
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
              <span className="text-primary hover:underline">browse</span>
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
              key={`${file.name}-${index}`}
              className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <FileSpreadsheet className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {file.size}
                    {file.rows !== undefined && ` · ${file.rows} rows × ${file.columns} cols`}
                    {file.errorMessage && (
                      <span className="ml-1 text-danger">— {file.errorMessage}</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {(file.status === "uploading" || file.status === "processing") && (
                  <div className="w-24">
                    <div className="h-1.5 overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                    <p className="mt-1 text-right text-[10px] text-muted-foreground">
                      {file.status === "processing" ? "Processing…" : `${file.progress}%`}
                    </p>
                  </div>
                )}
                {file.status === "complete" && file.parsedData && (
                  <button
                    onClick={() => setPreviewFile(file)}
                    className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    title="Preview data"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
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
          {pipelineSteps.map((step, index) => (
            <div key={step} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors",
                    index <= pipelineStep
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
                    "mx-1 h-0.5 w-8 transition-colors",
                    index < pipelineStep ? "bg-success" : "bg-border"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Data Preview Dialog */}
      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              {previewFile?.name}
              <span className="text-sm font-normal text-muted-foreground">
                ({previewFile?.rows} rows × {previewFile?.columns} columns)
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-auto flex-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">#</TableHead>
                  {previewFile?.headers?.map((h, i) => (
                    <TableHead key={i}>{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewFile?.parsedData?.slice(0, 20).map((row, ri) => (
                  <TableRow key={ri}>
                    <TableCell className="text-center text-muted-foreground text-xs">
                      {ri + 1}
                    </TableCell>
                    {row.map((cell, ci) => (
                      <TableCell key={ci} className="text-sm">
                        {cell}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {(previewFile?.parsedData?.length ?? 0) > 20 && (
              <p className="p-3 text-center text-xs text-muted-foreground">
                Showing first 20 of {previewFile?.rows} rows
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
