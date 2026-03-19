import { useCallback, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { UploadCloud, AlertCircle, FolderOpen, Sparkles, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useDiretorio } from "../hooks/useDiretorio";
import { RenameFilesDialog, FileWithCustomName } from "./dialogs/RenameFilesDialog";
import { ACCEPTED_FILE_TYPES } from "../constants";
import { motion, AnimatePresence } from "framer-motion";
import { UploadStatus } from "../types";

interface UploadZoneProps {
  pastaAtualId: string | null;
  pastaAtualNome?: string | null;
}

interface StatusConfig {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  label: string;
  animate?: boolean;
}

const statusConfig: Record<UploadStatus, StatusConfig> = {
  pending: { icon: Loader2, color: "text-muted-foreground", bg: "bg-muted", label: "Preparando..." },
  uploading: { icon: Loader2, color: "text-blue-500", bg: "bg-blue-500/10", label: "Enviando...", animate: true },
  analyzing: { icon: Sparkles, color: "text-primary", bg: "bg-primary/10", label: "Analisando com IA...", animate: true },
  completed: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10", label: "Concluído" },
  error: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", label: "Erro" },
};

export function UploadZone({ pastaAtualId, pastaAtualNome }: UploadZoneProps) {
  const { uploads, uploadFiles } = useDiretorio();
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isDragReject, setIsDragReject] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    setIsDragActive(false);
    setIsDragReject(false);
    if (acceptedFiles.length > 0) {
      setPendingFiles(acceptedFiles);
      setShowRenameDialog(true);
    }
    if (fileRejections.length > 0) {
      setIsDragReject(true);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  });

  const handleConfirmUpload = async (fileEntries: FileWithCustomName[]) => {
    const filesToUpload = fileEntries.map((entry) => ({
      file: entry.file,
      customName: entry.customName,
    }));
    await uploadFiles(filesToUpload, pastaAtualId);
    setShowRenameDialog(false);
  };

  const getStatusIcon = (status: UploadStatus) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    return (
      <Icon
        className={cn(
          "w-5 h-5 flex-shrink-0",
          config.color,
          config.animate && "animate-spin"
        )}
      />
    );
  };

  const completedCount = uploads.filter((u) => u.status === "completed").length;
  const totalProgress = uploads.length > 0
    ? uploads.reduce((acc, u) => acc + u.progress, 0) / uploads.length
    : 0;

  return (
    <>
      <div className="w-full space-y-4">
        <div
          {...getRootProps()}
          className={cn(
            "glass-panel border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 relative overflow-hidden",
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-border/50 hover:border-primary/50",
            isDragReject && "border-destructive bg-destructive/5"
          )}
        >
          {isDragActive && (
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 animate-gradient-shift" />
          )}
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-4 relative z-10">
            <motion.div
              animate={isDragActive ? { y: -5 } : { y: 0 }}
              className={cn(
                "p-4 rounded-full transition-colors duration-300",
                isDragActive ? "bg-primary/20 text-primary" : "bg-background/50 text-muted-foreground",
                isDragReject && "bg-destructive/20 text-destructive"
              )}
            >
              {isDragReject ? (
                <AlertCircle className="w-8 h-8" />
              ) : (
                <UploadCloud className="w-8 h-8" />
              )}
            </motion.div>
            <div>
              <p className="text-sm font-semibold">
                {isDragActive
                  ? "Solte os arquivos aqui..."
                  : "Arraste e solte arquivos aqui, ou clique para selecionar"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF, Imagens (PNG, JPG), Word (DOCX) e Excel (XLSX)
              </p>
              {pastaAtualNome && (
                <div className="flex items-center justify-center space-x-1 mt-2 text-xs text-primary font-medium">
                  <FolderOpen className="w-3 h-3" />
                  <span>Destino: {pastaAtualNome}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {uploads.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {completedCount}/{uploads.length} arquivos
                  </span>
                  {completedCount === uploads.length && completedCount > 0 && (
                    <span className="text-xs text-green-500 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Concluído
                    </span>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {Math.round(totalProgress)}%
                </span>
              </div>

              <div className="glass-panel p-4 rounded-xl space-y-3">
                <Progress value={totalProgress} className="h-2" />

                {uploads.map((upload, index) => {
                  const config = statusConfig[upload.status];
                  return (
                    <motion.div
                      key={upload.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-lg",
                        config.bg
                      )}
                    >
                      {getStatusIcon(upload.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-sm font-medium truncate">
                            {upload.customName}
                          </p>
                          <span className={cn("text-xs ml-2", config.color)}>
                            {config.label}
                          </span>
                        </div>
                        {upload.status === "uploading" && (
                          <Progress value={upload.progress} className="h-1" />
                        )}
                        {upload.status === "error" && upload.error && (
                          <p className="text-xs text-destructive truncate">{upload.error}</p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
