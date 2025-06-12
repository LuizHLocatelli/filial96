
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MetaCategoria, MetaMensalForm } from "../../types/metasTypes";

interface MetaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoria: MetaCategoria | null;
  onSubmit: (data: MetaMensalForm, metaId?: string) => Promise<boolean>;
  isLoading: boolean;
}

export function MetaDialog({ 
  open, 
  onOpenChange, 
  categoria, 
  onSubmit, 
  isLoading 
}: MetaDialogProps) {
  const [formData, setFormData] = useState<MetaMensalForm>({
    categoria_id: categoria?.id || '',
    valor_meta: categoria?.valor_meta_mensal || 0,
    descricao: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoria) return;
    
    const success = await onSubmit(formData, categoria.meta_mensal_id || undefined);
    if (success) {
      onOpenChange(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (!categoria) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {categoria.meta_mensal_id ? 'Editar' : 'Definir'} Meta - {categoria.nome}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="valor_meta">Valor da Meta Mensal</Label>
            <div className="space-y-1">
              <Input
                id="valor_meta"
                type="number"
                step="0.01"
                min="0"
                value={formData.valor_meta}
                onChange={(e) => setFormData(prev => ({ ...prev, valor_meta: parseFloat(e.target.value) || 0 }))}
                placeholder="0,00"
                required
              />
              <p className="text-sm text-muted-foreground">
                Valor formatado: {formatCurrency(formData.valor_meta)}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição (opcional)</Label>
            <Textarea
              id="descricao"
              value={formData.descricao || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Descrição da meta..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Salvando..." : categoria.meta_mensal_id ? "Atualizar Meta" : "Definir Meta"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
