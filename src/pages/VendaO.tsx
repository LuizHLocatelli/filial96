
import { useState } from "react";
import { SaleUploader } from "@/components/venda-o/SaleUploader";
import { SalesDashboard } from "@/components/venda-o/SalesDashboard";
import { useVendaO } from "@/hooks/useVendaO";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VendaOProduct } from "@/types/vendaO";
import { ShoppingCart, BarChart3, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function VendaO() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const { 
    sales, 
    isLoading, 
    isUploading, 
    progress,
    addSale, 
    updateSaleStatus, 
    deleteSale 
  } = useVendaO();

  const handleSaleUpload = async (
    data: {
      filial: string;
      data_venda: string;
      nome_cliente: string;
      telefone?: string;
      produtos: VendaOProduct[];
      previsao_chegada?: string;
      tipo_entrega: 'frete' | 'retirada';
      status: 'aguardando_produto' | 'aguardando_cliente' | 'pendente' | 'concluida';
      observacoes?: string;
    },
    file: File
  ) => {
    const success = await addSale(data, file);
    if (success) {
      setActiveTab("dashboard");
    }
    return success;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
        {/* Header aprimorado */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg">
                  <ShoppingCart className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                    Venda O
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Gerenciamento de vendas de outras filiais com entrega ou retirada na nossa filial
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 shadow-sm">
                <TrendingUp className="h-3 w-3 mr-1" />
                Sistema Ativo
              </Badge>
            </div>
          </div>

          {/* Tabs aprimoradas */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex flex-col space-y-6">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-12 bg-muted/30 p-1 rounded-xl shadow-sm">
                <TabsTrigger 
                  value="dashboard" 
                  className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                  <span className="sm:hidden">Painel</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="nova" 
                  className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span className="hidden sm:inline">Nova Venda</span>
                  <span className="sm:hidden">Criar</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="space-y-0">
                <SalesDashboard 
                  sales={sales} 
                  isLoading={isLoading} 
                  onStatusChange={updateSaleStatus}
                  onDelete={deleteSale}
                />
              </TabsContent>

              <TabsContent value="nova" className="space-y-0">
                <SaleUploader 
                  isUploading={isUploading} 
                  progress={progress}
                  onUpload={handleSaleUpload} 
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
