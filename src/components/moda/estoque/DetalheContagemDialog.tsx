import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Download } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ProdutoForm } from "./ProdutoForm";
import { ProdutosList } from "./ProdutosList";
import { PDFExportEstoqueDialog } from "./PDFExportEstoqueDialog";
import { useEstoquePDFExport } from "./hooks/useEstoquePDFExport";
import { supabase } from "@/integrations/supabase/client";

interface Produto {
  id: string;
  codigo_produto: string;
  setor: "masculino" | "feminino" | "infantil";
  quantidade: number;
  created_at: string;
}

interface Contagem {
  id: string;
  nome: string;
  status: "em_andamento" | "finalizada";
  created_at: string;
  created_by: string;
  produtos_count?: number;
}

interface DetalheContagemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contagem: Contagem;
  onContagemAtualizada: () => void;
}

export function DetalheContagemDialog({ 
  open, 
  onOpenChange, 
  contagem,
  onContagemAtualizada
}: DetalheContagemDialogProps) {
  const [activeTab, setActiveTab] = useState("produtos");
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loadingProdutos, setLoadingProdutos] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { exportToPDF } = useEstoquePDFExport();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "em_andamento":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "finalizada":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "em_andamento":
        return "Em Andamento";
      case "finalizada":
        return "Finalizada";
      default:
        return status;
    }
  };

  const carregarProdutos = async () => {
    if (!contagem?.id) return;
    
    try {
      setLoadingProdutos(true);
      const { data, error } = await supabase
        .from("moda_estoque_produtos")
        .select("*")
        .eq("contagem_id", contagem.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const produtosFormatados = data?.map(produto => ({
        ...produto,
        setor: produto.setor as "masculino" | "feminino" | "infantil"
      })) || [];

      setProdutos(produtosFormatados);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    } finally {
      setLoadingProdutos(false);
    }
  };

  useEffect(() => {
    if (open && contagem) {
      carregarProdutos();
    }
  }, [open, contagem]);

  const handleExportPDF = async (options: any) => {
    setIsExporting(true);
    try {
      await exportToPDF(contagem, produtos, options);
      setExportDialogOpen(false);
    } finally {
      setIsExporting(false);
    }
  };

  const handleProdutoAtualizado = () => {
    carregarProdutos();
    onContagemAtualizada();
  };

  const handleProdutoAdicionado = () => {
    carregarProdutos();
    onContagemAtualizada();
    // Manter na aba "Adicionar Produto" para agilizar o fluxo de contagem
    // setActiveTab("produtos"); // Comentado para manter na aba atual
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[96vw] max-w-none sm:max-w-4xl h-[95vh] max-h-none p-0 gap-0 flex flex-col overflow-hidden">
          {/* Header com padding controlado */}
          <DialogHeader className="flex-shrink-0 p-4 sm:p-6 border-b border-border/10">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Package className="h-5 w-5 text-primary flex-shrink-0" />
                <div className="min-w-0">
                  <DialogTitle className="text-lg sm:text-xl truncate">{contagem.nome}</DialogTitle>
                  <DialogDescription className="text-xs sm:text-sm">
                    Criada {formatDistanceToNow(new Date(contagem.created_at), {
                      addSuffix: true,
                      locale: ptBR
                    })}
                  </DialogDescription>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge className={getStatusColor(contagem.status)} variant="outline">
                  <span className="hidden sm:inline">{getStatusText(contagem.status)}</span>
                  <span className="sm:hidden">{contagem.status === "em_andamento" ? "Em And." : "Final."}</span>
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExportDialogOpen(true)}
                  disabled={produtos.length === 0}
                  className="gap-1 text-xs sm:text-sm px-2 sm:px-3"
                >
                  <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Exportar PDF</span>
                  <span className="sm:hidden">PDF</span>
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Conteúdo principal com scroll controlado */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              {/* Tabs header */}
              <div className="flex-shrink-0 px-4 sm:px-6 pt-2">
                <TabsList className="grid w-full grid-cols-2 h-9">
                  <TabsTrigger value="produtos" className="text-xs sm:text-sm px-2">
                    <span className="hidden sm:inline">Produtos</span>
                    <span className="sm:hidden">Produtos</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="adicionar" 
                    disabled={contagem.status === "finalizada"} 
                    className="text-xs sm:text-sm px-2"
                  >
                    <span className="hidden sm:inline">Adicionar Produto</span>
                    <span className="sm:hidden">Adicionar</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Conteúdo das tabs com scroll independente */}
              <TabsContent value="produtos" className="flex-1 mt-0 overflow-hidden">
                <div className="h-full overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-4">
                  <ProdutosList 
                    contagemId={contagem.id} 
                    contagemStatus={contagem.status}
                    onProdutoAtualizado={handleProdutoAtualizado}
                  />
                </div>
              </TabsContent>

              <TabsContent value="adicionar" className="flex-1 mt-0 overflow-hidden">
                <div className="h-full overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-4">
                  <ProdutoForm 
                    contagemId={contagem.id}
                    onProdutoAdicionado={handleProdutoAdicionado}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      <PDFExportEstoqueDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        contagem={contagem}
        produtos={produtos}
        onExport={handleExportPDF}
        isExporting={isExporting}
      />
    </>
  );
}