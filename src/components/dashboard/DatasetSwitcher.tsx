import { FileSpreadsheet, ChevronDown, X } from "lucide-react";
import { useCsvData } from "@/hooks/useCsvData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function DatasetSwitcher() {
  const { datasets, activeDatasetId, switchDataset, removeDataset } = useCsvData();

  if (datasets.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
      <Select value={activeDatasetId ?? undefined} onValueChange={switchDataset}>
        <SelectTrigger className="h-8 w-[200px] text-xs">
          <SelectValue placeholder="Select dataset" />
        </SelectTrigger>
        <SelectContent>
          {datasets.map((ds) => (
            <SelectItem key={ds.id} value={ds.id} className="text-xs">
              <div className="flex items-center gap-2">
                <span className="truncate">{ds.fileName}</span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {ds.rawRows.length} rows
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {datasets.length > 1 && activeDatasetId && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => removeDataset(activeDatasetId)}
          title="Remove this dataset"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
      <Badge variant="outline" className="text-[10px]">
        {datasets.length} file{datasets.length !== 1 ? "s" : ""}
      </Badge>
    </div>
  );
}
