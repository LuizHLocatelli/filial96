
import React from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon, Upload } from "lucide-react";

interface FilePreviewProps {
  file: File;
  onUpload: () => void;
  isUploading: boolean;
}

export function FilePreview({ file, onUpload, isUploading }: FilePreviewProps) {
  return (
    <div className="border rounded-md p-3 bg-slate-50">
      <div className="flex items-center">
        <ImageIcon className="h-6 w-6 text-blue-500 mr-2" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {file.name}
          </p>
          <p className="text-xs text-gray-500">
            {(file.size / 1024).toFixed(1)} KB
          </p>
        </div>
        <Button 
          onClick={onUpload} 
          disabled={isUploading}
          size="sm"
          className="gap-1"
        >
          {isUploading ? "Enviando..." : (
            <>
              <Upload className="h-4 w-4" />
              Enviar
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
