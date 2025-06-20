import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle } from 'lucide-react';
import { useMobileDialog } from '@/hooks/useMobileDialog';

interface DeleteFileDialogProps {
  fileName: string;
  isDeleting: boolean;
  onConfirm: () => void;
  trigger?: React.ReactNode;
}

export function DeleteFileDialog({ 
  fileName, 
  isDeleting, 
  onConfirm,
  trigger
}: DeleteFileDialogProps) {
  const { getMobileAlertDialogProps, getMobileButtonProps } = useMobileDialog();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button 
            variant="outline" 
            size="sm"
            className="hover:bg-red-100 hover:text-red-700 hover:border-red-300"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Excluir
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent {...getMobileAlertDialogProps("medium")}>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Confirmar Exclusão
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm">
            Tem certeza que deseja excluir o arquivo <strong>"{fileName}"</strong>?
            <br />
            <span className="text-red-600 font-medium text-xs">Esta ação não pode ser desfeita.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
          <AlertDialogCancel {...getMobileButtonProps()} className="rounded-lg">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            {...getMobileButtonProps()}
            className="bg-red-600 hover:bg-red-700 rounded-lg"
          >
            {isDeleting ? "Excluindo..." : "Excluir Arquivo"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
