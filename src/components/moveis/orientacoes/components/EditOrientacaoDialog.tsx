
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit2, Save, X } from "lucide-react";
import { Orientacao } from "../types";
import { useOrientacoesCrud } from "../hooks/useOrientacoesCrud";
import { useMobileDialog } from "@/hooks/useMobileDialog";

interface EditOrientacaoDialogProps {
  orientacao: Orientacao;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditOrientacaoDialog({
  orientacao,
  open,
  onOpenChange,
  onSuccess
}: EditOrientacaoDialogProps) {
  const { updateOrientacao, isLoading } = useOrientacoesCrud();
  const { getMobileDialogProps, getMobileButtonProps, getMobileFormProps } = useMobileDialog();
  const [formData, setFormData] = useState({
    titulo: orientacao.titulo,
    descricao: orientacao.descricao,
    tipo: orientacao.tipo
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await updateOrientacao(orientacao.id, formData);
    if (success) {
      onOpenChange(false);
      onSuccess();
    }
  };

  const handleCancel = () => {
    setFormData({
      titulo: orientacao.titulo,
      descricao: orientacao.descricao,
      tipo: orientacao.tipo
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent {...getMobileDialogProps("lg", "80vh")} className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Edit2 className="h-5 w-5" />
            Editar {formData.tipo === 'vm' ? 'VM' : 'Informativo'}
          </DialogTitle>
          <DialogDescription className="text-sm">
            Altere as informações da orientação conforme necessário.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} {...getMobileFormProps()}>
          <div className="space-y-4 max-h-[50vh] overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="titulo" className="text-sm font-medium">Título</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                required
                className="text-base sm:text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao" className="text-sm font-medium">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                rows={3}
                required
                className="text-base sm:text-sm resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo" className="text-sm font-medium">Tipo</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger className="text-base sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vm">VM - Visual Merchandising</SelectItem>
                  <SelectItem value="informativo">Informativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              {...getMobileButtonProps()}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              {...getMobileButtonProps()}
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
