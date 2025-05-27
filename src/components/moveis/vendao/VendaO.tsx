
import { useState } from "react";
import { SaleUploader } from "@/components/venda-o/SaleUploader";
import { SalesDashboard } from "@/components/venda-o/SalesDashboard";
import { useVendaO } from "@/hooks/useVendaO";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VendaOProduct } from "@/types/vendaO";
import { ShoppingCart, BarChart3 } from "lucide-react";

export function VendaO() {
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
    <div className="space-y-6 max-w-7xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col space-y-4">
          <TabsList className="grid w-full grid-cols-2 h-12 bg-muted/30 p-1 rounded-xl">
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

          <TabsContent value="dashboard" className="mt-6 space-y-0">
            <SalesDashboard 
              sales={sales} 
              isLoading={isLoading} 
              onStatusChange={updateSaleStatus}
              onDelete={deleteSale}
            />
          </TabsContent>

          <TabsContent value="nova" className="mt-6 space-y-0">
            <SaleUploader 
              isUploading={isUploading} 
              progress={progress}
              onUpload={handleSaleUpload} 
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
