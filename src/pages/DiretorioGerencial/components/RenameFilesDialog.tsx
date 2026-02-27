import React, { useState, useEffect } from 'react';
import { FileText, X, Edit3 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface FileWithCustomName {
  id: string;
  file: File;
  customName: string;
  extension: string;
}

interface RenameFilesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  files: File[];
  onConfirm: (files: FileWithCustomName[]) => void;
}

export const RenameFilesDialog = ({
  open,
  onOpenChange,
  files,
  onConfirm,
}: RenameFilesDialogProps) => {
  const [fileEntries, setFileEntries] = useState<FileWithCustomName[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (open && files.length > 0) {
      const entries = files.map((file) => {
        const lastDotIndex = file.name.lastIndexOf('.');
        const nameWithoutExt = lastDotIndex > 0 ? file.name.substring(0, lastDotIndex) : file.name;
        const extension = lastDotIndex > 0 ? file.name.substring(lastDotIndex) : '';
        
        return {
          id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file,
          customName: nameWithoutExt,
          extension,
        };
      });
      setFileEntries(entries);
    }
  }, [open, files]);

  const handleNameChange = (id: string, newName: string) => {
    setFileEntries((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, customName: newName } : entry
      )
    );
  };

  const handleRemoveFile = (id: string) => {
    setFileEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const handleConfirm = () => {
    onConfirm(fileEntries);
    onOpenChange(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return 'PDF';
    if (type.includes('image')) return 'IMG';
    if (type.includes('word') || type.includes('document')) return 'DOC';
    if (type.includes('excel') || type.includes('sheet')) return 'XLS';
    return 'FILE';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto flex flex-col p-0 sm:max-w-lg" hideCloseButton>
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-primary" />
            Nomear Arquivos
          </DialogTitle>
          <DialogDescription>
            Revise e edite os nomes dos arquivos antes de enviar. Clique no nome para editar.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {fileEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum arquivo selecionado
            </div>
          ) : (
            fileEntries.map((entry) => (
              <div
                key={entry.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border bg-card transition-colors",
                  editingId === entry.id && "border-primary ring-1 ring-primary"
                )}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {getFileIcon(entry.file.type)}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  {editingId === entry.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={entry.customName}
                        onChange={(e) => handleNameChange(entry.id, e.target.value)}
                        className="h-8 text-sm"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setEditingId(null);
                          }
                        }}
                        onBlur={() => setEditingId(null)}
                      />
                      <span className="text-sm text-muted-foreground flex-shrink-0">
                        {entry.extension}
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingId(entry.id)}
                      className="text-left w-full group"
                    >
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {entry.customName}
                        <span className="text-muted-foreground">{entry.extension}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(entry.file.size)} • Clique para editar
                      </p>
                    </button>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemoveFile(entry.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={fileEntries.length === 0}
            className="gap-2"
          >
            <FileText className="w-4 h-4" />
            Enviar {fileEntries.length > 0 && `(${fileEntries.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export type { FileWithCustomName };
