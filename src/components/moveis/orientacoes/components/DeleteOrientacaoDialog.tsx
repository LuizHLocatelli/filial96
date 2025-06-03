
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, X } from "lucide-react";
import { Orientacao } from "../types";
import { useOrientacoesCrud } from "../hooks/useOrientacoesCrud";

interface DeleteOrientacaoDialogProps {
  orientacao: Orientacao;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteOrientacaoDialog({
  orientacao,
  open,
  onOpenChange,
  onSuccess
}: DeleteOrientacaoDialogProps) {
  const { deleteOrientacao, isLoading } = useOrientacoesCrud();

  const handleDelete = async () => {
    const success = await deleteOrientacao(orientacao.id);
    if (success) {
      onOpenChange(false);
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Excluir {orientacao.tipo === 'vm' ? 'VM' : 'Informativo'}
          </DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir "{orientacao.titulo}"? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isLoading ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
