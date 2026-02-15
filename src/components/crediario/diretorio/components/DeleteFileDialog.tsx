import { useState } from 'react';
import {
  Dialog,
  DialogContent
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  StandardDialogHeader,
  StandardDialogFooter,
} from "@/components/ui/standard-dialog";

interface DeleteFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  fileName?: string;
  isDeleting?: boolean;
}

export function DeleteFileDialog({ 
  open, 
  onOpenChange, 
  onConfirm, 
  fileName = "arquivo", 
  isDeleting = false
}: DeleteFileDialogProps) {
  const isMobile = useIsMobile();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`${isMobile ? 'w-[calc(100%-2rem)] max-w-full p-0' : 'sm:max-w-[500px] p-0'} max-h-[85vh] overflow-y-auto flex flex-col`}
        hideCloseButton
      >
        <StandardDialogHeader
          icon={AlertTriangle}
          iconColor="red"
          title="Confirmar Exclusão"
          description={
            <>
              Tem certeza que deseja excluir o arquivo <strong>"{fileName}"</strong>?
              <br />
              <span className="text-red-600 font-medium text-xs">Esta ação não pode ser desfeita.</span>
            </>
          }
          onClose={() => onOpenChange(false)}
          loading={isDeleting}
        />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-800 dark:text-red-200">
              O arquivo será permanentemente removido do sistema.
            </p>
          </div>
        </div>

        <StandardDialogFooter className={isMobile ? 'flex-col gap-2' : 'flex-row gap-3'}>
          <Button 
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className={isMobile ? 'w-full h-10' : ''}
          >
            Cancelar
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={isDeleting}
            className={`bg-red-600 hover:bg-red-700 ${isMobile ? 'w-full h-10' : ''}`}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isDeleting ? "Excluindo..." : "Excluir"}
          </Button>
        </StandardDialogFooter>
      </DialogContent>
    </Dialog>
  );
}
