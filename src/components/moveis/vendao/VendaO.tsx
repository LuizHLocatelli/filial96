
import { useState } from "react";
import { SaleUploader } from "@/components/venda-o/SaleUploader";
import { SalesDashboard } from "@/components/venda-o/SalesDashboard";
import { useVendaO } from "@/hooks/useVendaO";
import { VendaOProduct } from "@/types/vendaO";
import { ShoppingCart, BarChart3, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
      {/* Header melhorado */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Vendas O</h2>
            <p className="text-muted-foreground">
              Gerencie vendas de outras filiais com entrega ou retirada na nossa loja
            </p>
          </div>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 w-fit">
            <TrendingUp className="h-4 w-4 mr-2" />
            {sales.length} vendas cadastradas
          </Badge>
        </div>

        {/* Navegação redesenhada */}
        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto sm:mx-0">
          <Card 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
              activeTab === "dashboard" 
                ? 'border-primary bg-primary/5 shadow-md' 
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => setActiveTab("dashboard")}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  activeTab === "dashboard" 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}>
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-base">Dashboard</h3>
                  <p className="text-xs text-muted-foreground">Visualizar vendas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
              activeTab === "nova" 
                ? 'border-primary bg-primary/5 shadow-md' 
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => setActiveTab("nova")}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  activeTab === "nova" 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}>
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-base">Nova Venda</h3>
                  <p className="text-xs text-muted-foreground">Cadastrar venda</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Conteúdo baseado na aba ativa */}
      <div className="mt-6">
        {activeTab === "dashboard" ? (
          <SalesDashboard 
            sales={sales} 
            isLoading={isLoading} 
            onStatusChange={updateSaleStatus}
            onDelete={deleteSale}
          />
        ) : (
          <SaleUploader 
            isUploading={isUploading} 
            progress={progress}
            onUpload={handleSaleUpload} 
          />
        )}
      </div>
    </div>
  );
}
