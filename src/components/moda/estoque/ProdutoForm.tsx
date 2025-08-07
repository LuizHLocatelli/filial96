import { useState } from "react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, User, Baby } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { BarcodeScanner } from "./scanner/BarcodeScanner";

interface ProdutoFormProps {
  contagemId: string;
  onProdutoAdicionado: () => void;
}

const setores = [
  { value: "masculino", label: "Masculino", icon: User },
  { value: "feminino", label: "Feminino", icon: User },
  { value: "infantil", label: "Infantil", icon: Baby }
];

export function ProdutoForm({ contagemId, onProdutoAdicionado }: ProdutoFormProps) {
  const [codigoProduto, setCodigoProduto] = useState("");
  const [setor, setSetor] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [loading, setLoading] = useState(false);
const { toast } = useToast();
  const [scannerEnabled, setScannerEnabled] = useState(false);
  const [autoAddOnScan, setAutoAddOnScan] = useState(true);

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

  const addProduto = async (codigo: string, setorValue: string, qtd: number) => {
    if (!codigo || !setorValue || qtd < 1) return false;
    if (!validarCodigo(codigo)) {
      toast({
        title: "Código inválido",
        description: "O código do produto deve ter exatamente 6 ou 9 dígitos.",
        variant: "destructive",
      });
      return false;
    }
    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast({ title: "Erro", description: "Usuário não autenticado.", variant: "destructive" });
        return false;
      }
      const { error: rpcError } = await supabase.rpc("upsert_moda_estoque_produto", {
        p_contagem_id: contagemId,
        p_codigo_produto: codigo,
        p_setor: setorValue,
        p_quantidade: qtd,
        p_created_by: user.user.id,
      });
      if (rpcError) throw rpcError;

      const { data: produtoInfo, error: infoError } = await supabase
        .from("moda_estoque_produtos")
        .select("quantidade")
        .eq("contagem_id", contagemId)
        .eq("codigo_produto", codigo)
        .eq("setor", setorValue)
        .single();
      if (infoError) throw infoError;

      const quantidadeAnterior = (produtoInfo?.quantidade ?? 0) - qtd;
      const setorLabel = setores.find((s) => s.value === setorValue)?.label || setorValue;
      if (quantidadeAnterior > 0) {
        toast({
          title: "✅ Produto somado!",
          description: `${qtd} + ${quantidadeAnterior} = ${produtoInfo?.quantidade} unidades (${setorLabel})`,
        });
      } else {
        toast({ title: "✅ Produto adicionado!", description: `${qtd} unidade(s) · ${codigo} · ${setorLabel}` });
      }

      // limpar campos e focar
      setCodigoProduto("");
      setQuantidade(1);
      setTimeout(() => {
        const codigoInput = document.getElementById("codigo") as HTMLInputElement | null;
        codigoInput?.focus();
      }, 80);

      onProdutoAdicionado();
      return true;
    } catch (err) {
      console.error("Erro ao adicionar produto:", err);
      toast({ title: "Erro", description: "Não foi possível adicionar o produto.", variant: "destructive" });
      return false;
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!codigoProduto || !setor || quantidade < 1) {
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

    await addProduto(codigoProduto, setor, quantidade);
  };

  const handleScan = async (code: string) => {
    setCodigoProduto(code);
    if (!setor) {
      toast({
        title: "Selecione o setor",
        description: "Escolha o setor antes de adicionar pelo leitor.",
        variant: "destructive",
      });
      return;
    }
    if (autoAddOnScan) {
      await addProduto(code, setor, 1);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
          Adicionar Produto
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Cadastre produtos na contagem. Se o código já existir no mesmo setor, 
          as quantidades serão somadas automaticamente.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4 sm:space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="codigo" className="text-sm sm:text-base">Código do Produto *</Label>
              <Input
                id="codigo"
                placeholder="123456789"
                value={codigoProduto}
                onChange={handleCodigoChange}
                required
                maxLength={9}
                disabled={loading}
                className="font-mono h-10 sm:h-11 text-sm sm:text-base"
              />
              <p className="text-xs sm:text-sm text-muted-foreground">
                Máximo 9 dígitos • Apenas números
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="setor" className="text-sm sm:text-base">Setor *</Label>
              <Select value={setor} onValueChange={setSetor} disabled={loading}>
                <SelectTrigger className="h-10 sm:h-11 text-sm sm:text-base">
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
            <Label htmlFor="quantidade" className="text-sm sm:text-base">Quantidade *</Label>
            <Input
              id="quantidade"
              type="number"
              min="1"
              value={quantidade}
              onChange={(e) => setQuantidade(Number(e.target.value))}
              required
              disabled={loading}
              className="w-32 h-10 sm:h-11 text-sm sm:text-base"
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

          {/* Leitor com câmera */}
          <div className="glass-card p-3 sm:p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Leitor com Câmera</div>
              <Switch checked={scannerEnabled} onCheckedChange={setScannerEnabled} />
            </div>
            <p className="text-xs text-muted-foreground">
              Selecione o setor acima e aponte a câmera para o código (6 ou 9 dígitos).
              Cada leitura adiciona 1 unidade automaticamente.
            </p>
            {scannerEnabled && (
              <BarcodeScanner
                enabled={scannerEnabled}
                onEnabledChange={setScannerEnabled}
                onDetected={handleScan}
                allowedLengths={[6, 9]}
              />
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={!codigoProduto || !setor || quantidade < 1 || loading}
              className="gap-2 h-10 sm:h-11 text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                  <span className="hidden sm:inline">Adicionando...</span>
                  <span className="sm:hidden">Adicionando</span>
                </>
              ) : (
                <>
                  <Package className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Adicionar Produto</span>
                  <span className="sm:hidden">Adicionar</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}