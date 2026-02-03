import { useState } from "react";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import { StandardDialogHeader, StandardDialogContent, StandardDialogFooter } from "@/components/ui/standard-dialog";
import { useIsMobile } from "@/hooks/use-mobile";

interface DeleteSaleDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirmDelete: () => Promise<void> | void;
  itemName?: string;
}

export function DeleteSaleDialog({
  isOpen,
  onOpenChange,
  onConfirmDelete,
  itemName = "esta venda",
}: DeleteSaleDialogProps) {
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onConfirmDelete();
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting sale:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className={`
          ${isMobile ? "w-[calc(100%-2rem)] max-w-full p-0" : "sm:max-w-[420px] p-0"}
          overflow-hidden
        `}
        hideCloseButton
      >
        <StandardDialogHeader
          icon={AlertTriangle}
          iconColor="red"
          title="Confirmar Exclusão"
          onClose={() => onOpenChange(false)}
          loading={loading}
        />

        <StandardDialogContent className="space-y-6">
          <div
            className={`
              flex items-center gap-3
              ${isMobile ? "p-3" : "p-4"}
              rounded-xl bg-muted/50
            `}
          >
            <div className="text-2xl">🗑️</div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{itemName}</p>
              <p className="text-sm text-muted-foreground">Item selecionado</p>
            </div>
          </div>

          <DialogDescription
            className={`
              ${isMobile ? "text-sm" : "text-base"}
              text-center leading-relaxed px-1
            `}
          >
            Tem certeza que deseja excluir <strong>{itemName}</strong>? Esta ação
            não pode ser desfeita.
          </DialogDescription>
        </StandardDialogContent>

        <StandardDialogFooter
          className={isMobile ? "flex-col gap-2" : "flex-row gap-3"}
        >
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className={isMobile ? "w-full h-10" : "flex-1"}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            className={`
              ${isMobile ? "w-full h-10" : "flex-1"}
              gap-2
            `}
          >
            {loading ? (
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
