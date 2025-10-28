import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ProdutoFocoWithImages } from '@/types/produto-foco';
import { useMobileDialog } from '@/hooks/useMobileDialog';
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { formatPhoneNumber } from "@/utils/phoneFormatter";

interface RegistroVendaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  produto: ProdutoFocoWithImages;
  onRegistrarVenda: (dadosVenda: any) => Promise<void>;
}

export function RegistroVendaDialog({ 
  isOpen, 
  onClose, 
  produto, 
  onRegistrarVenda 
}: RegistroVendaDialogProps) {
  const [formData, setFormData] = useState({
    cliente_nome: '',
    cliente_telefone: '',
    quantidade: '',
    valor_total: '',
    data_venda: new Date(),
    observacoes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getMobileDialogProps, getMobileButtonProps, getMobileFormProps, getMobileFooterProps } = useMobileDialog();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.valor_total || !formData.cliente_nome) {
      toast.error("Preencha todos os campos");
      return;
    }

    const valorNumerico = parseFloat(formData.valor_total.replace(',', '.'));
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      toast.error("Digite um valor válido");
      return;
    }

    setIsSubmitting(true);

    try {
      await onRegistrarVenda({
        ...formData,
        produto_foco_id: produto.id,
        produto_nome: produto.nome_produto,
        produto_codigo: produto.codigo_produto,
        quantidade: parseInt(formData.quantidade) || 1,
        valor_total: valorNumerico,
        data_venda: formData.data_venda.toISOString().split('T')[0]
      });
      
      // Reset form
      setFormData({
        cliente_nome: '',
        cliente_telefone: '',
        quantidade: '',
        valor_total: '',
        data_venda: new Date(),
        observacoes: ''
      });
      
      onClose();
    } catch (error) {
      toast.error("Erro ao registrar venda");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent {...getMobileDialogProps("default")}>
        {/* Fixed Header */}
        <div className="flex-shrink-0 p-3 md:p-5 lg:p-6 pb-0">
          <DialogHeader className="pr-8">
            <DialogTitle className="text-base md:text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-4 w-4 md:h-5 md:w-5 text-green-600 dark:text-green-400" />
              </div>
              Registrar Venda
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3 md:p-5 lg:p-6 pt-3">
          <div className="space-y-4">
          {/* Informações do produto */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">{produto.nome_produto}</h3>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {produto.categoria}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Meta:</span>
                <p className="font-medium">{produto.vendas_objetivo} vendas</p>
              </div>
              <div>
                <span className="text-muted-foreground">Atual:</span>
                <p className="font-medium">{produto.vendas_atual} vendas</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} {...getMobileFormProps()} className="space-y-4">
            <div>
              <Label htmlFor="cliente_nome" className="text-sm font-medium">Nome do Cliente *</Label>
              <Input
                id="cliente_nome"
                value={formData.cliente_nome}
                onChange={(e) => setFormData(prev => ({ ...prev, cliente_nome: e.target.value }))}
                required
                className="mt-1 text-base sm:text-sm"
              />
            </div>

            <div>
              <Label htmlFor="cliente_telefone" className="text-sm font-medium">Telefone do Cliente</Label>
              <Input
                id="cliente_telefone"
                value={formData.cliente_telefone}
                onChange={(e) => {
                  const formatted = formatPhoneNumber(e.target.value);
                  setFormData(prev => ({ ...prev, cliente_telefone: formatted }));
                }}
                placeholder="(51) 99156-8395"
                className="mt-1 text-base sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="quantidade" className="text-sm font-medium">Quantidade *</Label>
                <Input
                  id="quantidade"
                  type="number"
                  min="1"
                  value={formData.quantidade}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantidade: e.target.value }))}
                  required
                  className="mt-1 text-base sm:text-sm"
                  placeholder="1"
                />
              </div>
              <div>
                <Label htmlFor="valor_total" className="text-sm font-medium">Valor Total (R$) *</Label>
                <Input
                  id="valor_total"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valor_total}
                  onChange={(e) => setFormData(prev => ({ ...prev, valor_total: e.target.value }))}
                  required
                  className="mt-1 text-base sm:text-sm"
                  placeholder="0,00"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Data da Venda *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal mt-1 text-base sm:text-sm">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.data_venda, 'dd/MM/yyyy', { locale: ptBR })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.data_venda}
                    onSelect={(date) => date && setFormData(prev => ({ ...prev, data_venda: date }))}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="observacoes" className="text-sm font-medium">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                rows={2}
                className="mt-1 resize-none text-base sm:text-sm"
              />
            </div>
          </form>
          </div>
        </div>

        {/* Fixed Footer */}
        <div {...getMobileFooterProps()}>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            {...getMobileButtonProps()}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            onClick={handleSubmit}
            {...getMobileButtonProps()}
          >
            {isSubmitting ? 'Registrando...' : 'Registrar Venda'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
