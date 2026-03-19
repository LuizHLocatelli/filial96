import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, AlertCircle, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { File } from "lucide-react";
import { useDiretorio } from "../hooks/useDiretorio";
import { RenameFilesDialog, FileWithCustomName } from "./dialogs/RenameFilesDialog";
import { ACCEPTED_FILE_TYPES } from "../constants";
import { generateFileId, getFileExtension, getFileNameWithoutExtension } from "../lib/utils";

interface UploadZoneProps {
  pastaAtualId: string | null;
  pastaAtualNome?: string | null;
}

export function UploadZone({ pastaAtualId, pastaAtualNome }: UploadZoneProps) {
  const { uploads, uploadFiles } = useDiretorio();
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [showRenameDialog, setShowRenameDialog] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setPendingFiles(acceptedFiles);
      setShowRenameDialog(true);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
  });

  const handleConfirmUpload = async (fileEntries: FileWithCustomName[]) => {
    const filesToUpload = fileEntries.map((entry) => ({
      file: entry.file,
      customName: entry.customName,
    }));
    await uploadFiles(filesToUpload, pastaAtualId);
    setShowRenameDialog(false);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Preparando...";
      case "uploading":
        return "Enviando...";
      case "analyzing":
        return "Analisando com IA...";
      case "completed":
        return "Concluído";
      case "error":
        return "Erro";
      default:
        return status;
    }
  };

  return (
    <>
      <div className="w-full space-y-4">
        <div
          {...getRootProps()}
          className={cn(
            "glass-panel border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300",
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-border/50 hover:border-primary/50",
            isDragReject && "border-destructive bg-destructive/5"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-4">
            <div
              className={cn(
                "p-4 rounded-full bg-background/50",
                isDragActive && "bg-primary/20 text-primary",
                isDragReject && "bg-destructive/20 text-destructive"
              )}
            >
              {isDragReject ? (
                <AlertCircle className="w-8 h-8" />
              ) : (
                <UploadCloud className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">
                {isDragActive
                  ? "Solte os arquivos aqui..."
                  : "Arraste e solte arquivos aqui, ou clique para selecionar"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Suporta PDF, Imagens (PNG, JPG), Word (DOCX) e Excel (XLSX)
              </p>
              {pastaAtualNome && (
                <div className="flex items-center justify-center space-x-1 mt-2 text-xs text-primary">
                  <FolderOpen className="w-3 h-3" />
                  <span>Destino: {pastaAtualNome}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {uploads.length > 0 && (
          <div className="space-y-3 mt-4">
            {uploads.map((upload) => (
              <div
                key={upload.id}
                className="glass-panel p-3 rounded-lg flex items-center space-x-4"
              >
                <File className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-medium truncate">
                      {upload.customName}
                    </p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {getStatusText(upload.status)}
                    </span>
                  </div>
                  <Progress value={upload.progress} className="h-1.5" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <RenameFilesDialog
        open={showRenameDialog}
        onOpenChange={setShowRenameDialog}
        files={pendingFiles}
        onConfirm={handleConfirmUpload}
      />
    </>
  );
}
