
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
import { Save, X, Trash2, Plus } from "lucide-react";

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-gray-900/95 border-green-200/50 dark:border-green-700/50">
        <DialogHeader>
          <DialogTitle className="text-green-800 dark:text-green-200">
            Editar Reserva
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Produtos */}
          <div className="space-y-4">
            <Label className="text-green-700 dark:text-green-300 font-semibold">
              Produtos
            </Label>
            {formData.produtos.map((produto, index) => (
              <div key={index} className="p-4 border border-green-200/50 dark:border-green-600/30 rounded-lg bg-green-50/30 dark:bg-green-900/10 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-sm text-green-700 dark:text-green-300">Produto {index + 1}</h4>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs text-green-600 dark:text-green-400">Nome do Produto</Label>
                    <Input
                      value={produto.nome}
                      onChange={(e) => updateProduto(index, { ...produto, nome: e.target.value })}
                      placeholder="Nome do produto"
                      className="h-9 border-green-200/50 dark:border-green-600/30 focus:ring-green-500/80"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-green-600 dark:text-green-400">Código do Produto</Label>
                    <Input
                      value={produto.codigo}
                      onChange={(e) => updateProduto(index, { ...produto, codigo: e.target.value })}
                      placeholder="Código"
                      className="h-9 border-green-200/50 dark:border-green-600/30 focus:ring-green-500/80"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs text-green-600 dark:text-green-400">Tamanho</Label>
                    <Input
                      value={produto.tamanho || ""}
                      onChange={(e) => updateProduto(index, { ...produto, tamanho: e.target.value })}
                      placeholder="Ex: M, G, 42"
                      className="h-9 border-green-200/50 dark:border-green-600/30 focus:ring-green-500/80"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-green-600 dark:text-green-400">Quantidade</Label>
                    <Input
                      type="number"
                      min="1"
                      value={produto.quantidade}
                      onChange={(e) => updateProduto(index, { ...produto, quantidade: parseInt(e.target.value) || 1 })}
                      className="h-9 border-green-200/50 dark:border-green-600/30 focus:ring-green-500/80"
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addProduto}
              className="w-full border-green-300/50 dark:border-green-600/30 text-green-700 dark:text-green-300 hover:bg-green-50/80 dark:hover:bg-green-900/20"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Produto
            </Button>
          </div>

          {/* Dados do Cliente */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-green-700 dark:text-green-300">
                Nome do Cliente
              </Label>
              <Input
                value={formData.cliente_nome}
                onChange={(e) => setFormData(prev => ({ ...prev, cliente_nome: e.target.value }))}
                required
                className="border-green-200/50 dark:border-green-600/30 focus:ring-green-500/80 dark:focus:ring-green-400/80"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-green-700 dark:text-green-300">
                CPF do Cliente
              </Label>
              <Input
                value={formData.cliente_cpf}
                onChange={(e) => setFormData(prev => ({ ...prev, cliente_cpf: e.target.value }))}
                required
                className="border-green-200/50 dark:border-green-600/30 focus:ring-green-500/80 dark:focus:ring-green-400/80"
              />
            </div>
          </div>

          {/* VIP e Forma de Pagamento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.cliente_vip}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, cliente_vip: checked }))}
              />
              <Label className="text-green-700 dark:text-green-300">
                Cliente VIP
              </Label>
            </div>

            <div className="space-y-2">
              <Label className="text-green-700 dark:text-green-300">
                Forma de Pagamento
              </Label>
              <Select 
                value={formData.forma_pagamento} 
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, forma_pagamento: value }))}
              >
                <SelectTrigger className="border-green-200/50 dark:border-green-600/30 focus:ring-green-500/80 dark:focus:ring-green-400/80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="crediario">🏪 Crediário</SelectItem>
                  <SelectItem value="cartao_credito">💳 Cartão de Crédito</SelectItem>
                  <SelectItem value="cartao_debito">💰 Cartão de Débito</SelectItem>
                  <SelectItem value="pix">⚡ PIX</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label className="text-green-700 dark:text-green-300">
              Observações
            </Label>
            <Textarea
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Observações adicionais..."
              className="border-green-200/50 dark:border-green-600/30 focus:ring-green-500/80 dark:focus:ring-green-400/80"
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-green-300/50 dark:border-green-600/30 text-green-700 dark:text-green-300 hover:bg-green-50/80 dark:hover:bg-green-900/20"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
