import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useMobileDialog } from "@/hooks/useMobileDialog";

interface RegistrarVendaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produtoNome: string;
  onSubmit: (vendaData: any) => Promise<void>;
}

export function RegistrarVendaDialog({ 
  open, 
  onOpenChange, 
  produtoNome, 
  onSubmit 
}: RegistrarVendaDialogProps) {
  const { getMobileDialogProps, getMobileFooterProps } = useMobileDialog();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    cliente_nome: '',
    cliente_telefone: '',
    valor_venda: '',
    forma_pagamento: '',
    observacoes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cliente_nome.trim() || !formData.valor_venda.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit({
        ...formData,
        valor_venda: parseFloat(formData.valor_venda)
      });
      
      // Reset form
      setFormData({
        cliente_nome: '',
        cliente_telefone: '',
        valor_venda: '',
        forma_pagamento: '',
        observacoes: ''
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao registrar venda:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent {...getMobileDialogProps("medium")}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              Registrar Venda
            </div>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Registre uma nova venda para o produto <strong>{produtoNome}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cliente_nome">Nome do Cliente *</Label>
              <Input
                id="cliente_nome"
                value={formData.cliente_nome}
                onChange={(e) => setFormData(prev => ({ ...prev, cliente_nome: e.target.value }))}
                placeholder="Nome completo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cliente_telefone">Telefone</Label>
              <Input
                id="cliente_telefone"
                value={formData.cliente_telefone}
                onChange={(e) => setFormData(prev => ({ ...prev, cliente_telefone: e.target.value }))}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="valor_venda">Valor da Venda *</Label>
              <Input
                id="valor_venda"
                type="number"
                step="0.01"
                min="0"
                value={formData.valor_venda}
                onChange={(e) => setFormData(prev => ({ ...prev, valor_venda: e.target.value }))}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="forma_pagamento">Forma de Pagamento</Label>
              <Input
                id="forma_pagamento"
                value={formData.forma_pagamento}
                onChange={(e) => setFormData(prev => ({ ...prev, forma_pagamento: e.target.value }))}
                placeholder="Ex: Cartão, Dinheiro, PIX"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Observações adicionais sobre a venda..."
              rows={3}
              className="resize-none"
            />
          </div>

          <div {...getMobileFooterProps()}>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="px-6"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.cliente_nome.trim() || !formData.valor_venda.trim()}
              variant="success"
            >
              {isSubmitting ? "Registrando..." : "Registrar Venda"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 