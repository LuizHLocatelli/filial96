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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <div>
                  <DialogTitle className="text-xl">{contagem.nome}</DialogTitle>
                  <DialogDescription>
                    Criada {formatDistanceToNow(new Date(contagem.created_at), {
                      addSuffix: true,
                      locale: ptBR
                    })}
                  </DialogDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(contagem.status)} variant="outline">
                  {getStatusText(contagem.status)}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExportDialogOpen(true)}
                  disabled={produtos.length === 0}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Exportar PDF
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="produtos">Produtos</TabsTrigger>
                <TabsTrigger value="adicionar" disabled={contagem.status === "finalizada"}>
                  Adicionar Produto
                </TabsTrigger>
              </TabsList>

              <TabsContent value="produtos" className="mt-4 flex-1 overflow-y-auto">
                <ProdutosList 
                  contagemId={contagem.id} 
                  contagemStatus={contagem.status}
                  onProdutoAtualizado={handleProdutoAtualizado}
                />
              </TabsContent>

              <TabsContent value="adicionar" className="mt-4">
                <ProdutoForm 
                  contagemId={contagem.id}
                  onProdutoAdicionado={handleProdutoAtualizado}
                />
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