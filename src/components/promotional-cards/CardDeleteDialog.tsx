import { Dialog, DialogContent, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";
import { StandardDialogHeader, StandardDialogFooter } from "@/components/ui/standard-dialog";
import { useIsMobile } from "@/hooks/use-mobile";

interface CardDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export function CardDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: CardDeleteDialogProps) {
  const isMobile = useIsMobile();

  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

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
          title="Excluir Card"
          onClose={() => onOpenChange(false)}
          loading={isLoading}
        />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <DialogDescription className="text-center leading-relaxed px-1">
            Tem certeza que deseja excluir este card promocional? <br />
            <span className="text-red-600 font-medium text-sm">
              Esta ação não pode ser desfeita.
            </span>
          </DialogDescription>
        </div>

        <StandardDialogFooter className={isMobile ? 'flex-col gap-2' : 'flex-row gap-3'}>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className={isMobile ? 'w-full h-10' : ''}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
            className={`gap-2 ${isMobile ? 'w-full h-10' : ''}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              'Excluir'
            )}
          </Button>
        </StandardDialogFooter>
      </DialogContent>
    </Dialog>
  );
}
