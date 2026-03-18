import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogScrollableContainer } from "@/components/ui/dialog-scrollable-container";
import { StandardDialogHeader, StandardDialogFooter } from "@/components/ui/standard-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gift } from "@/components/ui/emoji-icons";
import { AniversarianteFormData } from "@/types/aniversariantes";

interface AniversarianteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AniversarianteFormData) => void;
  isSubmitting?: boolean;
}

export function AniversarianteFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting
}: AniversarianteFormDialogProps) {
  const [formData, setFormData] = useState<AniversarianteFormData>({
    nome: "",
    filial: "",
    data_aniversario: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    if (!isSubmitting) {
      setFormData({ nome: "", filial: "", data_aniversario: "" });
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setFormData({ nome: "", filial: "", data_aniversario: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[75dvh] sm:max-h-[75vh] overflow-hidden flex flex-col p-0" hideCloseButton>
        <StandardDialogHeader 
          icon={Gift} 
          title="Novo Aniversariante" 
          onClose={handleClose} 
        />
        
        <DialogScrollableContainer>
          <form id="aniversariante-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                required
                placeholder="Ex: João da Silva"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="filial">Filial</Label>
              <Input
                id="filial"
                required
                placeholder="Ex: Filial 96 - Capão da Canoa"
                value={formData.filial}
                onChange={(e) => setFormData({ ...formData, filial: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="data_aniversario">Data de Aniversário</Label>
              <Input
                id="data_aniversario"
                type="date"
                required
                value={formData.data_aniversario}
                onChange={(e) => setFormData({ ...formData, data_aniversario: e.target.value })}
              />
            </div>
          </form>
        </DialogScrollableContainer>

        <StandardDialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            form="aniversariante-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Salvando..." : "Salvar"}
          </Button>
        </StandardDialogFooter>
      </DialogContent>
    </Dialog>
  );
}
