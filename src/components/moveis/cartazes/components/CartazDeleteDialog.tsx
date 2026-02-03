import { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2 } from "lucide-react";
import { CartazItem } from "../hooks/useCartazes";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  StandardDialogHeader,
  StandardDialogContent,
  StandardDialogFooter,
} from "@/components/ui/standard-dialog";

interface CartazDeleteDialogProps {
  cartaz: CartazItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (id: string) => Promise<boolean>;
}

export function CartazDeleteDialog({
  cartaz,
  open,
  onOpenChange,
  onDelete
}: CartazDeleteDialogProps) {
  const isMobile = useIsMobile();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(cartaz.id);
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting cartaz:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`${isMobile ? 'w-[calc(100%-2rem)] max-w-full p-0' : 'sm:max-w-[500px] p-0'} overflow-hidden`}
        hideCloseButton
      >
        <StandardDialogHeader
          icon={AlertTriangle}
          iconColor="red"
          title="Excluir Cartaz"
          description={
            <>
              Tem certeza que deseja excluir o cartaz <strong>"{cartaz.title}"</strong>?
              <br />
              <span className="text-red-600 font-medium text-xs">Esta ação não pode ser desfeita.</span>
            </>
          }
          onClose={() => onOpenChange(false)}
          loading={isDeleting}
        />

        <StandardDialogContent>
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-800 dark:text-red-200">
              O arquivo será permanentemente removido do sistema.
            </p>
          </div>
        </StandardDialogContent>

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
            onClick={handleDelete} 
            disabled={isDeleting}
            className={`bg-red-600 hover:bg-red-700 ${isMobile ? 'w-full h-10' : ''}`}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? "Excluindo..." : "Excluir"}
          </Button>
        </StandardDialogFooter>
      </DialogContent>
    </Dialog>
  );
}
