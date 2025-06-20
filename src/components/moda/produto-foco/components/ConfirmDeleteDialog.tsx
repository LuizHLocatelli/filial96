import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useMobileDialog } from "@/hooks/useMobileDialog";

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  productName: string;
  isDeleting?: boolean;
}

export function ConfirmDeleteDialog({ 
  open, 
  onOpenChange, 
  onConfirm, 
  productName,
  isDeleting = false 
}: ConfirmDeleteDialogProps) {
  const { getMobileAlertDialogProps, getMobileFooterProps } = useMobileDialog();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent {...getMobileAlertDialogProps()}>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Confirmar Exclusão
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm">
            Tem certeza que deseja excluir o produto <strong>"{productName}"</strong>?
            <br />
            <span className="text-red-600 font-medium text-xs">Esta ação não pode ser desfeita.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter {...getMobileFooterProps()}>
          <AlertDialogCancel disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isDeleting ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 