import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { StandardDialogHeader, StandardDialogFooter } from "@/components/ui/standard-dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { PastaGerencial } from "../types";

interface DeleteFolderDialogProps {
  pasta: PastaGerencial | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export function DeleteFolderDialog({ pasta, isOpen, onOpenChange, onConfirm, isLoading }: DeleteFolderDialogProps) {
  const isMobile = useIsMobile();

  const handleConfirm = async () => {
    if (!pasta) return;
    await onConfirm(pasta.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`
          ${isMobile ? 'w-[calc(100%-2rem)] max-w-full p-0' : 'sm:max-w-[500px] p-0'}
          max-h-[85vh] overflow-y-auto flex flex-col
        `}
        hideCloseButton
      >
        <StandardDialogHeader
          icon={AlertTriangle}
          iconColor="red"
          title="Excluir Pasta"
          onClose={() => onOpenChange(false)}
          loading={isLoading}
        />
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <p className="text-muted-foreground">
            Tem certeza que deseja excluir a pasta <strong>"{pasta?.nome}"</strong>?
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Esta ação não pode ser desfeita. Todos os arquivos dentro desta pasta serão movidos para a pasta atual.
          </p>
        </div>

        <StandardDialogFooter className={isMobile ? 'flex-col gap-2' : 'flex-row gap-3'}>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className={isMobile ? 'w-full h-10' : ''}
          >
            Cancelar
          </Button>
          <Button 
            variant="destructive"
            disabled={isLoading}
            onClick={handleConfirm}
            className={`gap-2 ${isMobile ? 'w-full h-10' : ''}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Excluir Pasta
              </>
            )}
          </Button>
        </StandardDialogFooter>
      </DialogContent>
    </Dialog>
  );
}
