import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { StandardDialogHeader, StandardDialogFooter } from "@/components/ui/standard-dialog";
import { DialogScrollableContainer } from "@/components/ui/dialog-scrollable-container";
import { useIsMobile } from "@/hooks/use-mobile";

interface DeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  title: string;
  description: string;
  itemName?: string;
  isLoading?: boolean;
  itemType: "pasta" | "arquivo";
}

export function DeleteDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  title,
  description,
  itemName,
  isLoading,
  itemType = "pasta",
}: DeleteDialogProps) {
  const isMobile = useIsMobile();

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className={`
          ${isMobile ? "w-[calc(100%-2rem)] max-w-full p-0" : "sm:max-w-[500px] p-0"}
          max-h-[75dvh] sm:max-h-[75vh] overflow-hidden flex flex-col
        `}
        hideCloseButton
      >
        <StandardDialogHeader
          icon={AlertTriangle}
          iconColor="red"
          title={title}
          onClose={() => onOpenChange(false)}
          loading={isLoading}
        />

        <DialogScrollableContainer>
          <p className="text-muted-foreground">
            Tem certeza que deseja excluir {itemType === "pasta" ? "a pasta" : "o arquivo"}{" "}
            <strong>"{itemName}"</strong>?
          </p>
          <p className="text-sm text-muted-foreground mt-2">{description}</p>
        </DialogScrollableContainer>

        <StandardDialogFooter
          className={isMobile ? "flex-col gap-2" : "flex-row gap-3"}
        >
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className={isMobile ? "w-full h-10" : ""}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            disabled={isLoading}
            onClick={handleConfirm}
            className={`gap-2 ${isMobile ? "w-full h-10" : ""}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Excluir {itemType === "pasta" ? "Pasta" : "Arquivo"}
              </>
            )}
          </Button>
        </StandardDialogFooter>
      </DialogContent>
    </Dialog>
  );
}
