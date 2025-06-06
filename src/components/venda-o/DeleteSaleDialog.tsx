
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
  const { getMobileButtonProps } = useMobileDialog();
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[calc(100%-2rem)] max-w-[calc(100%-2rem)] sm:max-w-[500px] mx-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base sm:text-lg">Confirmar exclusão</AlertDialogTitle>
          <AlertDialogDescription className="text-sm">
            Tem certeza que deseja excluir {itemName}? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col gap-2 sm:flex-row sm:gap-0">
          <AlertDialogCancel {...getMobileButtonProps()}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirmDelete} 
            {...getMobileButtonProps()}
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
