
import { useState } from "react";
import { SaleUploader } from "@/components/venda-o/SaleUploader";
import { SalesDashboard } from "@/components/venda-o/SalesDashboard";
import { useVendaO } from "@/hooks/useVendaO";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VendaOProduct } from "@/types/vendaO";

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
    <div className="container py-4 sm:py-6 space-y-4 sm:space-y-6 px-2 sm:px-6">
      <div className="flex flex-col">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Venda O</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Gerenciamento de vendas de outras filiais com entrega ou retirada na nossa filial
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Improved tab triggers for mobile */}
        <div className="relative">
          <TabsList className="w-full grid grid-cols-2 gap-1 mb-2">
            <TabsTrigger value="dashboard" className="px-2">Dashboard</TabsTrigger>
            <TabsTrigger value="nova" className="px-2">Nova Venda</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="dashboard" className="pt-2 sm:pt-4">
          <SalesDashboard 
            sales={sales} 
            isLoading={isLoading} 
            onStatusChange={updateSaleStatus}
            onDelete={deleteSale}
          />
        </TabsContent>

        <TabsContent value="nova" className="pt-2 sm:pt-4">
          <SaleUploader 
            isUploading={isUploading} 
            progress={progress}
            onUpload={handleSaleUpload} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
