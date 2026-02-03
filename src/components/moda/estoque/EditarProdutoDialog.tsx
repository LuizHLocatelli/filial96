import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Edit2, Package, User, Baby } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  StandardDialogHeader,
  StandardDialogContent,
  StandardDialogFooter,
} from "@/components/ui/standard-dialog";

interface Produto {
  id: string;
  codigo_produto: string;
  setor: "masculino" | "feminino" | "infantil";
  quantidade: number;
}

interface EditarProdutoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produto: Produto | null;
  onProdutoAtualizado: () => void;
  contagemId: string;
}

const setores = [
  { value: "masculino", label: "Masculino", icon: User },
  { value: "feminino", label: "Feminino", icon: User },
  { value: "infantil", label: "Infantil", icon: Baby }
];

export function EditarProdutoDialog({ 
  open, 
  onOpenChange, 
  produto,
  onProdutoAtualizado,
  contagemId
}: EditarProdutoDialogProps) {
  const isMobile = useIsMobile();
  const [codigoProduto, setCodigoProduto] = useState("");
  const [setor, setSetor] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (produto) {
      setCodigoProduto(produto.codigo_produto);
      setSetor(produto.setor);
      setQuantidade(produto.quantidade);
    }
  }, [produto]);

  const formatarCodigo = (valor: string) => {
    // Remove tudo que não for número
    const numero = valor.replace(/\D/g, "");
    // Limita a 9 dígitos
    return numero.slice(0, 9);
  };

  const validarCodigo = (codigo: string) => {
    // Valida se o código tem exatamente 6 ou 9 dígitos
    return codigo.length === 6 || codigo.length === 9;
  };

  const handleCodigoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormatado = formatarCodigo(e.target.value);
    setCodigoProduto(valorFormatado);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!produto || !codigoProduto || !setor || quantidade < 1) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    // Validação do código do produto
    if (!validarCodigo(codigoProduto)) {
      toast({
        title: "Código inválido",
        description: "O código do produto deve ter exatamente 6 ou 9 dígitos.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Verificar se já existe outro produto com o mesmo código e setor na mesma contagem
      const { data: existingProduct, error: checkError } = await supabase
        .from("moda_estoque_produtos")
        .select("id, quantidade")
        .eq("contagem_id", contagemId)
        .eq("codigo_produto", codigoProduto)
        .eq("setor", setor)
        .neq("id", produto.id)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingProduct) {
        // Se existe, somar as quantidades e deletar o produto atual
        const novaQuantidade = existingProduct.quantidade + quantidade;
        
        // Atualizar o produto existente com a soma das quantidades
        const { error: updateError } = await supabase
          .from("moda_estoque_produtos")
          .update({
            quantidade: novaQuantidade,
            updated_at: new Date().toISOString()
          })
          .eq("id", existingProduct.id);

        if (updateError) throw updateError;

        // Deletar o produto que estava sendo editado
        const { error: deleteError } = await supabase
          .from("moda_estoque_produtos")
          .delete()
          .eq("id", produto.id);

        if (deleteError) throw deleteError;

        const setorLabel = setores.find(s => s.value === setor)?.label || setor;
        
        toast({
          title: "Produtos unificados!",
          description: `${codigoProduto} · ${novaQuantidade} unidade(s) · ${setorLabel} (quantidades somadas)`
        });
      } else {
        // Se não existe, apenas atualizar normalmente
        const { error } = await supabase
          .from("moda_estoque_produtos")
          .update({
            codigo_produto: codigoProduto,
            setor: setor,
            quantidade: quantidade,
            updated_at: new Date().toISOString()
          })
          .eq("id", produto.id);

        if (error) throw error;

        const setorLabel = setores.find(s => s.value === setor)?.label || setor;
        
        toast({
          title: "Produto atualizado!",
          description: `${codigoProduto} · ${quantidade} unidade(s) · ${setorLabel}`
        });
      }

      onProdutoAtualizado();
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o produto.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!produto) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`${isMobile ? 'w-[calc(100%-2rem)] max-w-full p-0' : 'sm:max-w-[500px] p-0'} overflow-hidden`}
        hideCloseButton
      >
        <StandardDialogHeader
          icon={Edit2}
          iconColor="primary"
          title="Editar Produto"
          description="Altere as informações do produto conforme necessário."
          onClose={() => onOpenChange(false)}
          loading={loading}
        />
        
        <StandardDialogContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="codigo-edit">Código do Produto *</Label>
                <Input
                  id="codigo-edit"
                  placeholder="123456789"
                  value={codigoProduto}
                  onChange={handleCodigoChange}
                  required
                  maxLength={9}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Máximo 9 dígitos • Apenas números
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="setor-edit">Setor *</Label>
                <Select value={setor} onValueChange={setSetor} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o setor" />
                  </SelectTrigger>
                  <SelectContent>
                    {setores.map((setorOption) => {
                      const Icon = setorOption.icon;
                      return (
                        <SelectItem key={setorOption.value} value={setorOption.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {setorOption.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantidade-edit">Quantidade *</Label>
              <Input
                id="quantidade-edit"
                type="number"
                min="1"
                value={quantidade}
                onChange={(e) => setQuantidade(Number(e.target.value))}
                required
                disabled={loading}
                className="w-32"
              />
            </div>

            {/* Preview do produto */}
            {codigoProduto && setor && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {codigoProduto}
                  </Badge>
                  <Badge>
                    {setores.find(s => s.value === setor)?.label}
                  </Badge>
                  <span className="text-sm">
                    {quantidade} unidade{quantidade > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            )}
          </form>
        </StandardDialogContent>

        <StandardDialogFooter className={isMobile ? 'flex-col gap-2' : 'flex-row gap-3'}>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className={isMobile ? 'w-full h-10' : ''}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!codigoProduto || !setor || quantidade < 1 || loading}
            className={isMobile ? 'w-full h-10' : ''}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Salvando...
              </>
            ) : (
              <>
                <Package className="h-4 w-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </StandardDialogFooter>
      </DialogContent>
    </Dialog>
  );
}
