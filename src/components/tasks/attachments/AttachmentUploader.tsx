
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Upload, X } from "lucide-react";

interface AttachmentUploaderProps {
  onUpload: (file: File) => Promise<any>;
  isUploading: boolean;
  progress: number;
}

export function AttachmentUploader({ onUpload, isUploading, progress }: AttachmentUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      await onUpload(selectedFile);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClearSelection = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            disabled={isUploading}
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="cursor-pointer"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Formatos aceitos: JPG, PNG, WebP, PDF (máx 5MB)
          </p>
        </div>
        <div className="flex gap-2">
          {selectedFile && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleClearSelection}
              disabled={isUploading}
              type="button"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="whitespace-nowrap"
            type="button"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? "Enviando..." : "Anexar"}
          </Button>
        </div>
      </div>

      {isUploading && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-center text-muted-foreground">
            Enviando: {progress}%
          </p>
        </div>
      )}
    </div>
  );
}
