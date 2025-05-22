
import { Progress } from "@/components/ui/progress";

interface UploadProgressProps {
  isUploading: boolean;
  progress: number;
}

export function UploadProgress({ isUploading, progress }: UploadProgressProps) {
  if (!isUploading || progress === undefined) {
    return null;
  }
  
  return (
    <div className="space-y-2">
      <Progress value={progress} className="h-2" />
      <p className="text-xs text-muted-foreground">
        Enviando... {progress}%
      </p>
    </div>
  );
}
