import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ModaReserva, ProdutoReserva } from "../types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save, X, Trash2, Plus, Crown, Edit } from "lucide-react";
import { useMobileDialog } from '@/hooks/useMobileDialog';

interface EditReservaDialogProps {
  reserva: ModaReserva;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditReservaDialog({ reserva, open, onOpenChange, onSuccess }: EditReservaDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    produtos: reserva.produtos,
    cliente_nome: reserva.cliente_nome,
    cliente_cpf: reserva.cliente_cpf,
    cliente_vip: reserva.cliente_vip,
    forma_pagamento: reserva.forma_pagamento,
    observacoes: reserva.observacoes || "",
  });

  const { getMobileDialogProps, getMobileFooterProps } = useMobileDialog();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('moda_reservas')
        .update({
          produtos: formData.produtos as any, // Cast to any to satisfy Json type
          cliente_nome: formData.cliente_nome,
          cliente_cpf: formData.cliente_cpf,
          cliente_vip: formData.cliente_vip,
          forma_pagamento: formData.forma_pagamento,
          observacoes: formData.observacoes,
          updated_at: new Date().toISOString()
        })
        .eq('id', reserva.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Reserva atualizada com sucesso!",
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erro ao atualizar reserva:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a reserva",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateProduto = (index: number, produto: ProdutoReserva) => {
    const novosProdutos = [...formData.produtos];
    novosProdutos[index] = produto;
    setFormData(prev => ({ ...prev, produtos: novosProdutos }));
  };

  const removeProduto = (index: number) => {
    if (formData.produtos.length > 1) {
      const novosProdutos = formData.produtos.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, produtos: novosProdutos }));
    }
  };

  const addProduto = () => {
    const novoProduto: ProdutoReserva = {
      nome: "",
      codigo: "",
      tamanho: "",
      quantidade: 1,
    };
    setFormData(prev => ({ 
      ...prev, 
      produtos: [...prev.produtos, novoProduto] 
    }));
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent {...getMobileDialogProps("default")} className="flex flex-col max-h-[85vh]">
        <DialogHeader className="flex-shrink-0 border-b pb-4">
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center">
              <Edit className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            Editar Reserva
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto py-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Produtos */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Produtos</Label>
            {formData.produtos.map((produto, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Produto {index + 1}</h4>
                  {formData.produtos.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProduto(index)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nome do Produto *</Label>
                    <Input
                      value={produto.nome}
                      onChange={(e) => updateProduto(index, { ...produto, nome: e.target.value })}
                      placeholder="Nome do produto"
                    />
                  </div>

                  <div>
                    <Label>Código do Produto *</Label>
                    <Input
                      value={produto.codigo}
                      onChange={(e) => updateProduto(index, { ...produto, codigo: e.target.value })}
                      placeholder="Código"
                    />
                  </div>

                  <div>
                    <Label>Tamanho</Label>
                    <Input
                      value={produto.tamanho || ""}
                      onChange={(e) => updateProduto(index, { ...produto, tamanho: e.target.value })}
                      placeholder="Ex: M, G, 42"
                    />
                  </div>

                  <div>
                    <Label>Quantidade *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={produto.quantidade}
                      onChange={(e) => updateProduto(index, { ...produto, quantidade: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addProduto}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Produto
            </Button>
          </div>

          {/* Dados do Cliente */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nome do Cliente *</Label>
              <Input
                value={formData.cliente_nome}
                onChange={(e) => setFormData(prev => ({ ...prev, cliente_nome: e.target.value }))}
                placeholder="Nome completo"
                required
              />
            </div>

            <div>
              <Label>CPF do Cliente *</Label>
              <Input
                value={formData.cliente_cpf}
                onChange={(e) => setFormData(prev => ({ ...prev, cliente_cpf: formatCPF(e.target.value) }))}
                placeholder="000.000.000-00"
                maxLength={14}
                required
              />
            </div>
          </div>

          {/* Cliente VIP */}
          <div className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base flex items-center gap-2">
                <Crown className="h-4 w-4 text-yellow-600" />
                Cliente VIP
              </Label>
              <p className="text-sm text-muted-foreground">
                Clientes VIP não possuem limite de tempo para reservas (padrão é 3 dias)
              </p>
            </div>
            <Switch
              checked={formData.cliente_vip}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, cliente_vip: checked }))}
            />
          </div>

          {/* Forma de Pagamento */}
          <div>
            <Label>Forma de Pagamento *</Label>
            <Select 
              value={formData.forma_pagamento} 
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, forma_pagamento: value }))}
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

          {/* Observações */}
          <div>
            <Label>Observações</Label>
            <Textarea
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Informações adicionais sobre a reserva..."
              rows={3}
            />
          </div>

          <div {...getMobileFooterProps()}>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="px-6">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              variant="success"
            >
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
