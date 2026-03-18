
import { Upload, FileText, FileImage } from "lucide-react";
import { Label } from "@/components/ui/label";

interface FileUploadZoneProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
}

export function FileUploadZone({ file, onFileChange, disabled }: FileUploadZoneProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileChange(selectedFile);
    }
  };

  return (
    <div>
      <Label htmlFor="file">Arquivo</Label>
      <div className="mt-2">
        <label htmlFor="file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {file ? (
              <>
                {file.type.startsWith('image/') ? (
                  <FileImage className="w-8 h-8 mb-2 text-primary" />
                ) : (
                  <FileText className="w-8 h-8 mb-2 text-primary" />
                )}
                <p className="text-sm text-foreground font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Clique para selecionar arquivo
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, JPG, PNG, GIF ou WebP (máx. 10MB)
                </p>
              </>
            )}
          </div>
          <input
            id="file"
            type="file"
            className="hidden"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            disabled={disabled}
          />
        </label>
      </div>
    </div>
  );
}
