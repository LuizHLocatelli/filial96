import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Download, Edit2, Plus, Box, LayoutList } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ProdutoForm } from "./ProdutoForm";
import { ProdutosList } from "./ProdutosList";
import { PDFExportEstoqueDialog } from "./PDFExportEstoqueDialog";
import { EditarNomeContagemDialog } from "./EditarNomeContagemDialog";
import { useEstoquePDFExport } from "./hooks/useEstoquePDFExport";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  StandardDialogHeader,
} from "@/components/ui/standard-dialog";

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
  setor: string;
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
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("produtos");
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loadingProdutos, setLoadingProdutos] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [editarNomeOpen, setEditarNomeOpen] = useState(false);
  const { exportToPDF } = useEstoquePDFExport();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "em_andamento":
        return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30";
      case "finalizada":
        return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
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

      const produtosFormatados = (data || []).map(produto => ({
        ...produto,
        setor: produto.setor as "masculino" | "feminino" | "infantil"
      }));

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, contagem]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          className={`${isMobile ? 'w-[calc(100%-2rem)] max-w-full p-0' : 'max-w-4xl p-0'} max-h-[85vh] overflow-y-auto flex flex-col glass-overlay border-none`}
          hideCloseButton
        >
          <StandardDialogHeader
            icon={Package}
            iconColor={contagem.status === 'em_andamento' ? "amber" : "green"}
            title={
              <div className="flex items-center gap-2">
                <span>{contagem.nome}</span>
                {contagem.status === "em_andamento" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditarNomeOpen(true)}
                    className="h-6 w-6 p-0 hover:bg-muted/50 rounded-full flex-shrink-0 opacity-50 hover:opacity-100"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            }
            description={<>
              Criada {formatDistanceToNow(new Date(contagem.created_at), {
                addSuffix: true,
                locale: ptBR
              })}
              <span className="mx-2 text-muted-foreground/50">•</span>
              <Badge className={`${getStatusColor(contagem.status)} text-[10px] sm:text-xs px-2 py-0.5 rounded-full`} variant="outline">
                {getStatusText(contagem.status)}
              </Badge>
            </>}
            onClose={() => onOpenChange(false)}
            loading={false}
            className="border-b bg-card/50 backdrop-blur-md"
          >
            <div className="flex items-center gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExportDialogOpen(true)}
                disabled={produtos.length === 0}
                className="gap-2 text-xs px-3 h-8 shadow-sm bg-background/50 backdrop-blur-md hover:bg-primary hover:text-primary-foreground border-primary/20 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Exportar Relatório</span>
                <span className="sm:hidden">Exportar</span>
              </Button>
            </div>
          </StandardDialogHeader>

          <div className="flex-1 overflow-y-auto p-0 flex flex-col bg-background/40">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              {/* Tabs header */}
              <div className="flex-shrink-0 px-4 sm:px-6 pt-4 pb-2 border-b bg-card/30 backdrop-blur-sm sticky top-0 z-10">
                <TabsList className="grid w-full sm:max-w-md grid-cols-2 h-11 bg-background/50 p-1">
                  <TabsTrigger value="produtos" className="text-sm px-3 gap-2 rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm">
                    <LayoutList className="h-4 w-4" />
                    <span className="hidden sm:inline">Lista de Produtos</span>
                    <span className="sm:hidden">Produtos</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="adicionar"
                    disabled={contagem.status === "finalizada"}
                    className="text-sm px-3 gap-2 rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-primary"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Adicionar Novo</span>
                    <span className="sm:hidden">Adicionar</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Conteúdo das tabs com scroll */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">
                <TabsContent value="produtos" className="mt-0 h-full animate-in fade-in slide-in-from-bottom-2 duration-300" asChild>
                  <div className="h-full">
                    <ProdutosList
                      contagemId={contagem.id}
                      contagemStatus={contagem.status}
                      onProdutoAtualizado={handleProdutoAtualizado}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="adicionar" className="mt-0 h-full animate-in fade-in slide-in-from-bottom-2 duration-300" asChild>
                  <div className="h-full max-w-2xl mx-auto">
                    <ProdutoForm
                      contagemId={contagem.id}
                      contagemSetor={contagem.setor}
                      onProdutoAdicionado={handleProdutoAdicionado}
                    />
                  </div>
                </TabsContent>
              </div>
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

      <EditarNomeContagemDialog
        open={editarNomeOpen}
        onOpenChange={setEditarNomeOpen}
        contagem={contagem}
        onContagemAtualizada={onContagemAtualizada}
      />
    </>
  );
}
