import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File, AlertCircle, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useArquivosGerenciais } from '../hooks/useArquivosGerenciais';
import { RenameFilesDialog, FileWithCustomName } from './RenameFilesDialog';

interface UploadZoneProps {
  pastaAtualId?: string | null;
  pastaAtualNome?: string | null;
}

interface UploadingFile {
  progress: number;
  status: string;
  customName: string;
}

export const UploadZone = ({ pastaAtualId, pastaAtualNome }: UploadZoneProps) => {
  const [uploadingFiles, setUploadingFiles] = useState<{ [key: string]: UploadingFile }>({});
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const { uploadFile } = useArquivosGerenciais(pastaAtualId);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setPendingFiles(acceptedFiles);
      setShowRenameDialog(true);
    }
  }, []);

  const handleConfirmUpload = async (fileEntries: FileWithCustomName[]) => {
    // Start uploading each file with its custom name
    fileEntries.forEach(async (entry) => {
      const fileId = entry.id;
      
      setUploadingFiles((prev) => ({
        ...prev,
        [fileId]: { 
          progress: 0, 
          status: 'Preparando...',
          customName: entry.customName + entry.extension
        }
      }));

      try {
        await uploadFile(
          entry.file, 
          pastaAtualId || null, 
          (status, progress) => {
            let statusText = 'Enviando...';
            if (status === 'analyzing') statusText = 'Analisando com IA...';
            if (status === 'completed') statusText = 'Concluído';
            if (status === 'error') statusText = 'Erro';

            setUploadingFiles((prev) => ({
              ...prev,
              [fileId]: { 
                ...prev[fileId],
                progress, 
                status: statusText 
              }
            }));

            if (status === 'completed' || status === 'error') {
              setTimeout(() => {
                setUploadingFiles((prev) => {
                  const newObj = { ...prev };
                  delete newObj[fileId];
                  return newObj;
                });
              }, 3000);
            }
          },
          entry.customName // Pass custom name without extension
        );
      } catch (error) {
         setUploadingFiles((prev) => ({
           ...prev,
           [fileId]: { 
             ...prev[fileId],
             progress: 0, 
             status: 'Erro no upload' 
           }
         }));
      }
    });
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    }
  });

  return (
    <>
      <div className="w-full space-y-4">
        <div
          {...getRootProps()}
          className={cn(
            "glass-panel border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300",
            isDragActive ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/50",
            isDragReject && "border-destructive bg-destructive/5"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className={cn(
              "p-4 rounded-full bg-background/50",
              isDragActive && "bg-primary/20 text-primary",
              isDragReject && "bg-destructive/20 text-destructive"
            )}>
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

        {/* Upload Progress Queue */}
        {Object.keys(uploadingFiles).length > 0 && (
          <div className="space-y-3 mt-4">
            {Object.entries(uploadingFiles).map(([id, info]) => (
              <div key={id} className="glass-panel p-3 rounded-lg flex items-center space-x-4">
                <File className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-medium truncate">{info.customName}</p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {info.status}
                    </span>
                  </div>
                  <Progress value={info.progress} className="h-1.5" />
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
};
