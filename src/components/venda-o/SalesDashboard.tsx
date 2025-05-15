
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VendaO, statusOptions } from "@/types/vendaO";
import { SalesList } from "./SalesList";
import { Loader2 } from "lucide-react";

interface SalesDashboardProps {
  sales: VendaO[];
  isLoading: boolean;
  onStatusChange: (id: string, status: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export function SalesDashboard({ sales, isLoading, onStatusChange, onDelete }: SalesDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>("all");
  
  const filteredSales = activeTab === "all" 
    ? sales 
    : sales.filter(sale => sale.status === activeTab);
  
  const counts = {
    all: sales.length,
    aguardando_produto: sales.filter(s => s.status === 'aguardando_produto').length,
    aguardando_cliente: sales.filter(s => s.status === 'aguardando_cliente').length,
    pendente: sales.filter(s => s.status === 'pendente').length,
    concluida: sales.filter(s => s.status === 'concluida').length,
  };

  const getTitleByStatus = (status: string): string => {
    switch(status) {
      case 'aguardando_produto': return 'Aguardando Produto';
      case 'aguardando_cliente': return 'Aguardando Cliente';
      case 'pendente': return 'Pendentes';
      case 'concluida': return 'Concluídas';
      default: return 'Todas Vendas';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center items-center min-h-[300px]">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard de Vendas O</CardTitle>
        <CardDescription>
          Visão geral das vendas realizadas por outras filiais
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <Card className="bg-slate-50">
            <CardContent className="p-3 sm:p-4">
              <div className="text-xs sm:text-sm font-medium text-muted-foreground">Produtos</div>
              <div className="text-xl sm:text-2xl font-bold">{counts.aguardando_produto}</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-50">
            <CardContent className="p-3 sm:p-4">
              <div className="text-xs sm:text-sm font-medium text-muted-foreground">Clientes</div>
              <div className="text-xl sm:text-2xl font-bold">{counts.aguardando_cliente}</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-50">
            <CardContent className="p-3 sm:p-4">
              <div className="text-xs sm:text-sm font-medium text-muted-foreground">Pendentes</div>
              <div className="text-xl sm:text-2xl font-bold">{counts.pendente}</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-50">
            <CardContent className="p-3 sm:p-4">
              <div className="text-xs sm:text-sm font-medium text-muted-foreground">Concluídas</div>
              <div className="text-xl sm:text-2xl font-bold">{counts.concluida}</div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 w-full grid grid-cols-2 sm:flex sm:flex-wrap">
            <TabsTrigger className="text-xs sm:text-sm" value="all">Todas ({counts.all})</TabsTrigger>
            <TabsTrigger className="text-xs sm:text-sm" value="aguardando_produto">Aguardando Produto ({counts.aguardando_produto})</TabsTrigger>
            <TabsTrigger className="text-xs sm:text-sm" value="aguardando_cliente">Aguardando Cliente ({counts.aguardando_cliente})</TabsTrigger>
            <TabsTrigger className="text-xs sm:text-sm" value="pendente">Pendente ({counts.pendente})</TabsTrigger>
            <TabsTrigger className="text-xs sm:text-sm" value="concluida">Concluída ({counts.concluida})</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab}>
            <SalesList 
              sales={filteredSales} 
              title={getTitleByStatus(activeTab)}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
