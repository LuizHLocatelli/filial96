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
import { Trash2, AlertTriangle } from "lucide-react";
import { useMobileDialog } from "@/hooks/useMobileDialog";

interface DeleteSaleDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirmDelete: () => void;
  itemName?: string;
}

export function DeleteSaleDialog({
  isOpen,
  onOpenChange,
  onConfirmDelete,
  itemName = "esta venda",
}: DeleteSaleDialogProps) {
  const { getMobileAlertDialogProps, getMobileButtonProps } = useMobileDialog();

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent {...getMobileAlertDialogProps("medium")}>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Confirmar Exclusão
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm">
            Tem certeza que deseja excluir <strong>{itemName}</strong>? 
            <br />
            <span className="text-red-600 font-medium text-xs">Esta ação não pode ser desfeita.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
          <AlertDialogCancel {...getMobileButtonProps()} className="rounded-lg">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirmDelete} 
            {...getMobileButtonProps()}
            className="bg-red-600 hover:bg-red-700 rounded-lg"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir Venda
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
