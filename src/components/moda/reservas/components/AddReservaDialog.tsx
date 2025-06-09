
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useReservas } from "../hooks/useReservas";
import { ReservaFormData } from "../types";

export function AddReservaDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<ReservaFormData>({
    produto_nome: '',
    produto_codigo: '',
    tamanho: '',
    quantidade: 1,
    cliente_nome: '',
    cliente_cpf: '',
    forma_pagamento: 'crediario',
    observacoes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createReserva } = useReservas();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const success = await createReserva(formData);
    
    if (success) {
      setOpen(false);
      setFormData({
        produto_nome: '',
        produto_codigo: '',
        tamanho: '',
        quantidade: 1,
        cliente_nome: '',
        cliente_cpf: '',
        forma_pagamento: 'crediario',
        observacoes: ''
      });
    }
    
    setIsSubmitting(false);
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Reserva
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Criar Nova Reserva</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="produto_nome">Nome do Produto *</Label>
              <Input
                id="produto_nome"
                value={formData.produto_nome}
                onChange={(e) => setFormData({ ...formData, produto_nome: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="produto_codigo">Código do Produto *</Label>
              <Input
                id="produto_codigo"
                value={formData.produto_codigo}
                onChange={(e) => setFormData({ ...formData, produto_codigo: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tamanho">Tamanho</Label>
              <Input
                id="tamanho"
                value={formData.tamanho}
                onChange={(e) => setFormData({ ...formData, tamanho: e.target.value })}
                placeholder="Ex: M, G, 42, etc."
              />
            </div>
            <div>
              <Label htmlFor="quantidade">Quantidade *</Label>
              <Input
                id="quantidade"
                type="number"
                min="1"
                value={formData.quantidade}
                onChange={(e) => setFormData({ ...formData, quantidade: parseInt(e.target.value) || 1 })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cliente_nome">Nome do Cliente *</Label>
              <Input
                id="cliente_nome"
                value={formData.cliente_nome}
                onChange={(e) => setFormData({ ...formData, cliente_nome: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="cliente_cpf">CPF do Cliente *</Label>
              <Input
                id="cliente_cpf"
                value={formData.cliente_cpf}
                onChange={(e) => setFormData({ ...formData, cliente_cpf: formatCPF(e.target.value) })}
                placeholder="000.000.000-00"
                maxLength={14}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="forma_pagamento">Forma de Pagamento *</Label>
            <Select
              value={formData.forma_pagamento}
              onValueChange={(value: any) => setFormData({ ...formData, forma_pagamento: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="crediario">Crediário</SelectItem>
                <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Informações adicionais sobre a reserva..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Criando...' : 'Criar Reserva'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
