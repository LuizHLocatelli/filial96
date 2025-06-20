
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useMobileDialog } from "@/hooks/useMobileDialog";

interface CardDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
  isMobile: boolean;
}

export function CardDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
  isMobile
}: CardDeleteDialogProps) {
  const { getMobileDialogProps, getMobileFooterProps } = useMobileDialog();

  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent {...getMobileDialogProps("default")}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Excluir Card
          </DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir este card promocional? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <div {...getMobileFooterProps()}>
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
          >
            {isLoading ? 'Excluindo...' : 'Excluir'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
