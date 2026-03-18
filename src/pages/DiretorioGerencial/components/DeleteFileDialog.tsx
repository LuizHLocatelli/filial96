import React from 'react';
import { FileText, Trash2, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArquivoGerencial } from '../types';

interface DeleteFileDialogProps {
  arquivo: ArquivoGerencial | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (arquivo: ArquivoGerencial) => void;
  isLoading?: boolean;
}

export const DeleteFileDialog = ({
  arquivo,
  isOpen,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: DeleteFileDialogProps) => {
  const handleConfirm = () => {
    if (arquivo) {
      onConfirm(arquivo);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0" hideCloseButton>
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="w-5 h-5" />
            Excluir Arquivo
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-destructive/10 rounded-lg">
              <FileText className="w-8 h-8 text-destructive" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {arquivo?.nome_arquivo || 'Arquivo'}
              </p>
              <p className="text-sm text-muted-foreground">
                {arquivo ? formatSize(arquivo.tamanho_bytes) : ''}
              </p>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Atenção
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  Esta ação não pode ser desfeita. O arquivo será permanentemente excluído do sistema.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {isLoading ? 'Excluindo...' : 'Excluir Arquivo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
