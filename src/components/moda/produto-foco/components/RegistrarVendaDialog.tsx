import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingBag, Loader2 } from "lucide-react";
import { useState } from "react";
import { StandardDialogHeader, StandardDialogContent, StandardDialogFooter } from "@/components/ui/standard-dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatPhoneNumber } from "@/utils/phoneFormatter";

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
  const isMobile = useIsMobile();
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
      <DialogContent 
        className={`
          ${isMobile ? 'w-[calc(100%-2rem)] max-w-full p-0' : 'sm:max-w-2xl p-0'}
          overflow-hidden
        `}
        hideCloseButton
      >
        <StandardDialogHeader
          icon={ShoppingBag}
          iconColor="primary"
          title="Registrar Venda"
          description={`Registre uma nova venda para o produto ${produtoNome}`}
          onClose={() => onOpenChange(false)}
        />

        <StandardDialogContent>
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
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value);
                    setFormData(prev => ({ ...prev, cliente_telefone: formatted }));
                  }}
                  placeholder="(51) 99156-8395"
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
          </form>
        </StandardDialogContent>

        <StandardDialogFooter className={isMobile ? 'flex-col gap-2' : 'flex-row gap-3'}>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className={isMobile ? 'w-full h-10' : ''}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !formData.cliente_nome.trim() || !formData.valor_venda.trim()}
            onClick={handleSubmit}
            className={`gap-2 ${isMobile ? 'w-full h-10' : ''}`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Registrando...
              </>
            ) : (
              'Registrar Venda'
            )}
          </Button>
        </StandardDialogFooter>
      </DialogContent>
    </Dialog>
  );
}
