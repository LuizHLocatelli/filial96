
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ModaReserva, ProdutoReserva } from "../types";
import { ProdutoReservaInput } from "./ProdutoReservaInput";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save, X } from "lucide-react";

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
          produtos: formData.produtos,
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
              <ProdutoReservaInput
                key={index}
                produto={produto}
                onChange={(updatedProduto) => updateProduto(index, updatedProduto)}
                onRemove={() => removeProduto(index)}
                canRemove={formData.produtos.length > 1}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addProduto}
              className="w-full border-green-300/50 dark:border-green-600/30 text-green-700 dark:text-green-300 hover:bg-green-50/80 dark:hover:bg-green-900/20"
            >
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
