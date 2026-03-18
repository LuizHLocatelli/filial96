import { useState } from "react";
import { 
  FileText, 
  Plus, 
  Trash2, 
  User, 
  Calendar, 
  MessageSquare, 
  Download,
  AlertCircle,
  List
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { parseBrazilianNumber, formatBrazilianCurrency } from "@/utils/numberFormatter";
import { OrcamentoItem, ClienteOrcamento, OrcamentoData } from "./types";
import { generateOrcamentoPdf } from "./utils/pdfGenerator";
import { useOrcamentos } from "./hooks/useOrcamentos";
import { ListaOrcamentos } from "./ListaOrcamentos";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";

export function Orcamentos() {
  const { createOrcamento } = useOrcamentos();
  
  // Estado do Cliente
  const [cliente, setCliente] = useState<ClienteOrcamento>({
    nome: "",
    documento: "",
    telefone: "",
    email: "",
    endereco: ""
  });

  // Estado das Configurações do Orçamento
  const [validade, setValidade] = useState("7 dias");
  const [observacoes, setObservacoes] = useState("");
  const [consultor, setConsultor] = useState("");

  // Estado dos Itens
  const [itens, setItens] = useState<OrcamentoItem[]>([]);
  
  // Estado do Novo Item (Formulário)
  const [novoItemNome, setNovoItemNome] = useState("");
  const [novoItemQuantidade, setNovoItemQuantidade] = useState("1");
  const [novoItemValor, setNovoItemValor] = useState("");
  const [errorItem, setErrorItem] = useState("");

  // Cálculo do Total
  const valorTotal = itens.reduce((acc, item) => acc + item.valorTotal, 0);

  // --- Funções de Manipulação ---

  const handleAddQuantidade = () => {
    const qtd = parseInt(novoItemQuantidade) || 0;
    setNovoItemQuantidade((qtd + 1).toString());
  };

  const handleSubQuantidade = () => {
    const qtd = parseInt(novoItemQuantidade) || 0;
    if (qtd > 1) {
      setNovoItemQuantidade((qtd - 1).toString());
    }
  };

  const handleAdicionarItem = () => {
    setErrorItem("");
    
    // Validações básicas
    if (!novoItemNome.trim()) {
      setErrorItem("O nome do produto é obrigatório.");
      return;
    }
    
    const qtd = parseInt(novoItemQuantidade);
    if (isNaN(qtd) || qtd <= 0) {
      setErrorItem("A quantidade deve ser maior que zero.");
      return;
    }

    const valorUn = parseBrazilianNumber(novoItemValor);
    if (valorUn <= 0) {
      setErrorItem("O valor unitário deve ser maior que zero.");
      return;
    }

    // Criar novo item
    const newItem: OrcamentoItem = {
      id: Math.random().toString(36).substring(2, 9),
      nome: novoItemNome.trim(),
      quantidade: qtd,
      valorUnitario: valorUn,
      valorTotal: valorUn * qtd
    };

    setItens([...itens, newItem]);
    
    // Limpar formulário de item
    setNovoItemNome("");
    setNovoItemQuantidade("1");
    setNovoItemValor("");
  };

  const handleRemoverItem = (id: string) => {
    setItens(itens.filter(item => item.id !== id));
  };

  const handleGerarPdf = async () => {
    if (itens.length === 0) {
      alert("Adicione pelo menos um item para gerar o orçamento.");
      return;
    }

    const data: OrcamentoData = {
      cliente,
      itens,
      validade,
      observacoes,
      consultor,
      valorTotal,
      dataCriacao: new Date()
    };

    try {
      generateOrcamentoPdf(data);
      
      const orcamentoId = await createOrcamento({
        cliente,
        itens,
        validade,
        observacoes,
        consultor,
        valor_total: valorTotal
      });
      
      if (orcamentoId) {
        toast({
          title: "Orçamento salvo",
          description: "O orçamento foi salvo e está disponível para consulta.",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Ocorreu um erro ao gerar o PDF. Verifique os dados e tente novamente.");
    }
  };

  return (
    <div className="w-full mx-auto animate-fade-in px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5 max-w-7xl">
      <Tabs defaultValue="criar" className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Gerador de Orçamentos
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Crie orçamentos profissionais em PDF para seus clientes PF ou PJ.
            </p>
          </div>
          <TabsList>
            <TabsTrigger value="criar" className="gap-2">
              <Plus className="h-4 w-4" />
              Criar
            </TabsTrigger>
            <TabsTrigger value="salvos" className="gap-2">
              <List className="h-4 w-4" />
              Salvos
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="criar" className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUNA ESQUERDA: Formulários (Ocupa 7 colunas em telas grandes) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card: Dados do Cliente */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-4 bg-muted/5 dark:bg-muted/10 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                Dados do Cliente
              </CardTitle>
              <CardDescription>
                Informações opcionais que sairão impressas no documento.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cliente-nome">Nome / Razão Social</Label>
                  <Input 
                    id="cliente-nome" 
                    placeholder="Ex: João Silva ou Empresa XYZ" 
                    value={cliente.nome}
                    onChange={(e) => setCliente({...cliente, nome: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cliente-doc">CPF / CNPJ</Label>
                  <Input 
                    id="cliente-doc" 
                    placeholder="Somente números" 
                    value={cliente.documento}
                    onChange={(e) => setCliente({...cliente, documento: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cliente-tel">Telefone / WhatsApp</Label>
                  <Input 
                    id="cliente-tel" 
                    placeholder="(51) 99999-9999" 
                    value={cliente.telefone}
                    onChange={(e) => setCliente({...cliente, telefone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cliente-email">E-mail</Label>
                  <Input 
                    id="cliente-email" 
                    type="email"
                    placeholder="contato@cliente.com" 
                    value={cliente.email}
                    onChange={(e) => setCliente({...cliente, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cliente-end">Endereço Completo</Label>
                <Input 
                  id="cliente-end" 
                  placeholder="Rua, Número, Bairro, Cidade - Estado" 
                  value={cliente.endereco}
                  onChange={(e) => setCliente({...cliente, endereco: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Card: Adicionar Produto */}
          <Card className="border-primary/20 shadow-sm overflow-hidden">
            <CardHeader className="pb-4 bg-primary/5 dark:bg-primary/10 rounded-t-xl">
              <CardTitle className="text-lg flex items-center gap-2 text-primary">
                <Plus className="h-5 w-5" />
                Adicionar Produto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {errorItem && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errorItem}</AlertDescription>
                </Alert>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                {/* Quantidade */}
                <div className="sm:col-span-3 space-y-2">
                  <Label htmlFor="item-qtd">Quantidade</Label>
                  <div className="flex">
                    <Button 
                      variant="outline" 
                      className="px-3 rounded-r-none border-r-0 dark:border-primary/20"
                      onClick={handleSubQuantidade}
                    >
                      -
                    </Button>
                    <Input 
                      id="item-qtd" 
                      className="rounded-none text-center focus-visible:ring-0 dark:border-primary/20" 
                      value={novoItemQuantidade}
                      onChange={(e) => setNovoItemQuantidade(e.target.value.replace(/\D/g, ''))}
                    />
                    <Button 
                      variant="outline" 
                      className="px-3 rounded-l-none border-l-0 dark:border-primary/20"
                      onClick={handleAddQuantidade}
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Nome do Produto */}
                <div className="sm:col-span-9 space-y-2">
                  <Label htmlFor="item-nome">Descrição do Produto</Label>
                  <Input 
                    id="item-nome" 
                    placeholder="Ex: Sofá Retrátil 3 Lugares Suede" 
                    value={novoItemNome}
                    onChange={(e) => setNovoItemNome(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                {/* Valor Unitário */}
                <div className="sm:col-span-5 space-y-2">
                  <Label htmlFor="item-valor">Valor Unitário (R$)</Label>
                  <CurrencyInput 
                    id="item-valor" 
                    value={novoItemValor}
                    onChange={setNovoItemValor}
                    className="font-medium"
                  />
                </div>

                {/* Valor Total Previsto (Apenas Visual) */}
                <div className="sm:col-span-4 space-y-2">
                  <Label className="text-muted-foreground">Total do Item</Label>
                  <div className="h-10 flex items-center px-3 border rounded-md bg-muted/50 dark:bg-muted/20 font-semibold text-foreground/90">
                    {formatBrazilianCurrency((parseBrazilianNumber(novoItemValor) || 0) * (parseInt(novoItemQuantidade) || 0))}
                  </div>
                </div>

                {/* Botão Adicionar */}
                <div className="sm:col-span-3">
                  <Button 
                    className="w-full" 
                    onClick={handleAdicionarItem}
                  >
                    Adicionar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card: Configurações Finais */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-4 bg-muted/5 dark:bg-muted/10 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                Configurações Finais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orcamento-consultor" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Nome do Consultor
                  </Label>
                  <Input 
                    id="orcamento-consultor" 
                    placeholder="Seu nome" 
                    value={consultor}
                    onChange={(e) => setConsultor(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orcamento-validade" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Validade do Orçamento
                  </Label>
                  <Input 
                    id="orcamento-validade" 
                    placeholder="Ex: 7 dias, 15 dias, ou 30/12/2023" 
                    value={validade}
                    onChange={(e) => setValidade(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orcamento-obs">Observações (Impressas no PDF)</Label>
                <Textarea 
                  id="orcamento-obs" 
                  placeholder="Ex: Valor não inclui montagem. Frete grátis para o centro. Pagamento em até 10x sem juros..." 
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  className="resize-none min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

        </div>

        {/* COLUNA DIREITA: Resumo e PDF (Ocupa 5 colunas) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="sticky top-6 flex flex-col h-[calc(100vh-8rem)] overflow-hidden">
            <CardHeader className="pb-4 bg-muted/20 dark:bg-muted/40 rounded-t-xl border-b">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Resumo do Orçamento</span>
                <span className="bg-primary/20 dark:bg-primary/30 text-primary dark:text-primary-foreground border border-primary/30 dark:border-primary/50 text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  {itens.length} {itens.length === 1 ? 'item' : 'itens'}
                </span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-auto p-0 scrollbar-thin">
              {itens.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center space-y-3">
                  <FileText className="h-12 w-12 opacity-20" />
                  <p>Nenhum produto adicionado ainda.</p>
                  <p className="text-sm">Preencha os dados ao lado e clique em Adicionar.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {itens.map((item, index) => (
                    <div key={item.id} className="p-4 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm line-clamp-2">{item.nome}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span>{item.quantidade}x</span>
                            <span>{formatBrazilianCurrency(item.valorUnitario)}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="font-semibold text-sm">
                            {formatBrazilianCurrency(item.valorTotal)}
                          </span>
                          <button 
                            onClick={() => handleRemoverItem(item.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors p-1"
                            title="Remover item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>

            <div className="p-4 bg-muted/5 dark:bg-muted/10 border-t mt-auto">
              <div className="flex justify-between items-end mb-4">
                <span className="text-sm font-medium text-muted-foreground">Total Geral:</span>
                <span className="text-2xl font-bold text-primary">
                  {formatBrazilianCurrency(valorTotal)}
                </span>
              </div>
              
              <Button 
                size="lg" 
                className="w-full gap-2 font-semibold"
                disabled={itens.length === 0}
                onClick={handleGerarPdf}
              >
                <Download className="h-5 w-5" />
                Gerar PDF do Orçamento
              </Button>
            </div>
          </Card>
        </div>

      </div>
        </TabsContent>

        <TabsContent value="salvos">
          <ListaOrcamentos />
        </TabsContent>
      </Tabs>
    </div>
  );
}