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
import { ProdutoFocoWithImages } from '../types';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onRegistrarVenda({
        ...formData,
        produto_foco_id: produto.id,
        produto_nome: produto.nome_produto,
        produto_codigo: produto.codigo_produto,
        quantidade: parseInt(formData.quantidade) || 1,
        valor_total: parseFloat(formData.valor_total) || 0,
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Venda - {produto.nome_produto}</DialogTitle>
          <DialogDescription>
            Registre uma nova venda deste produto foco
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="cliente_nome" className="text-sm">Nome do Cliente *</Label>
            <Input
              id="cliente_nome"
              value={formData.cliente_nome}
              onChange={(e) => setFormData(prev => ({ ...prev, cliente_nome: e.target.value }))}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="cliente_telefone" className="text-sm">Telefone do Cliente</Label>
            <Input
              id="cliente_telefone"
              value={formData.cliente_telefone}
              onChange={(e) => setFormData(prev => ({ ...prev, cliente_telefone: e.target.value }))}
              placeholder="(00) 00000-0000"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="quantidade" className="text-sm">Quantidade *</Label>
              <Input
                id="quantidade"
                type="number"
                min="1"
                value={formData.quantidade}
                onChange={(e) => setFormData(prev => ({ ...prev, quantidade: e.target.value }))}
                required
                className="mt-1"
                placeholder="1"
              />
            </div>
            <div>
              <Label htmlFor="valor_total" className="text-sm">Valor Total (R$) *</Label>
              <Input
                id="valor_total"
                type="number"
                step="0.01"
                min="0"
                value={formData.valor_total}
                onChange={(e) => setFormData(prev => ({ ...prev, valor_total: e.target.value }))}
                required
                className="mt-1"
                placeholder="0,00"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm">Data da Venda *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal mt-1">
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
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="observacoes" className="text-sm">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              rows={2}
              className="mt-1 resize-none"
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Registrando...' : 'Registrar Venda'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
