import * as React from "react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UploadCloud, AlertCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface FileInputZoneProps {
  onFileSelect: (file: File | null) => void;
  allowedTypes?: string[]; // e.g., ['application/pdf', 'image/jpeg']
  maxSize?: number; // in bytes
  isUploading?: boolean;
  progress?: number;
  externalError?: string | null;
  clearExternalError?: () => void;
}

export function FileInputZone({
  onFileSelect,
  allowedTypes = ["application/pdf", "image/*"],
  maxSize = 10 * 1024 * 1024, // 10MB default
  isUploading = false,
  progress = 0,
  externalError,
  clearExternalError,
}: FileInputZoneProps) {
  const [internalError, setInternalError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const currentError = externalError || internalError;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalError(null);
    if (clearExternalError) clearExternalError();
    const file = e.target.files && e.target.files[0];

    if (!file) {
      setSelectedFile(null);
      onFileSelect(null);
      return;
    }

    // Validate file type
    const fileTypeIsValid = allowedTypes.some(type => {
      if (type.endsWith("/*")) { // wildcard for images like image/*
        return file.type.startsWith(type.slice(0, -2));
      }
      return file.type === type;
    });

    if (!fileTypeIsValid) {
      setInternalError(`Tipo de arquivo inválido. Permitidos: ${allowedTypes.join(", ")}`);
      setSelectedFile(null);
      onFileSelect(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      setInternalError(`O arquivo excede o tamanho máximo de ${maxSize / (1024 * 1024)}MB.`);
      setSelectedFile(null);
      onFileSelect(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const clearFile = () => {
    setSelectedFile(null);
    onFileSelect(null);
    setInternalError(null);
    if (clearExternalError) clearExternalError();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs sm:text-sm">Cupom Fiscal (PDF ou Imagem)</Label>
      {currentError && (
        <Alert variant="destructive" className="text-xs sm:text-sm">
          <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
          <AlertDescription>{currentError}</AlertDescription>
        </Alert>
      )}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-4 sm:p-6 flex flex-col items-center justify-center cursor-pointer",
          currentError && "border-destructive"
        )}
        onClick={!selectedFile ? triggerFileInput : undefined} // Only trigger if no file selected, to allow clearing
      >
        {selectedFile ? (
          <div className="text-center">
            <p className="text-xs sm:text-sm font-medium">Arquivo selecionado:</p>
            <p className="text-xs sm:text-sm text-muted-foreground truncate mb-2">{selectedFile.name}</p>
            <Button variant="outline" size="sm" onClick={clearFile} type="button" className="text-xs sm:text-sm h-7 sm:h-8">
              Remover Arquivo
            </Button>
          </div>
        ) : (
          <>
            <UploadCloud className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground mb-3 sm:mb-4" />
            <p className="text-xs sm:text-sm text-center text-muted-foreground mb-2">
              {isMobile
                ? "Toque para selecionar um arquivo"
                : "Clique para selecionar ou arraste um arquivo"}
            </p>
            <Input
              ref={fileInputRef}
              type="file"
              accept={allowedTypes.join(",")}
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              variant="outline"
              className="cursor-pointer w-full sm:w-auto text-xs sm:text-sm h-7 sm:h-10"
              onClick={(e) => {
                e.stopPropagation(); // Prevent click on parent div if it has an action
                triggerFileInput();
              }}
              type="button"
            >
              Selecionar arquivo
            </Button>
          </>
        )}
      </div>

      {isUploading && (
        <div className="mt-2 space-y-2">
          <p className="text-xs sm:text-sm font-medium">Progresso: {progress}%</p>
          <Progress value={progress} className="h-2" />
        </div>
      )}
    </div>
  );
} 