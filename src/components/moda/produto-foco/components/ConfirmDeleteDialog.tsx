import { Dialog, DialogContent, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";
import { StandardDialogHeader, StandardDialogFooter } from "@/components/ui/standard-dialog";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`
          ${isMobile ? 'w-[calc(100%-2rem)] max-w-full p-0' : 'sm:max-w-[420px] p-0'}
          max-h-[85vh] overflow-y-auto flex flex-col
        `}
        hideCloseButton
      >
        <StandardDialogHeader
          icon={AlertTriangle}
          iconColor="red"
          title="Confirmar Exclusão"
          onClose={() => onOpenChange(false)}
          loading={isDeleting}
        />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <div className={`flex items-center gap-3 ${isMobile ? 'p-3' : 'p-4'} rounded-xl bg-muted/50`}>
            <div className="text-2xl">📦</div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{productName}</p>
              <p className="text-sm text-muted-foreground">Produto selecionado</p>
            </div>
          </div>

          <DialogDescription className="text-center leading-relaxed px-1">
            Tem certeza que deseja excluir o produto <strong>"{productName}"</strong>?
            <br />
            <span className="text-red-600 font-medium text-sm">
              Esta ação não pode ser desfeita.
            </span>
          </DialogDescription>
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
            variant="destructive"
            className={`gap-2 ${isMobile ? 'w-full h-10' : ''}`}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Excluir
              </>
            )}
          </Button>
        </StandardDialogFooter>
      </DialogContent>
    </Dialog>
  );
}
