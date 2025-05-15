
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VendaO, statusOptions } from "@/types/vendaO";
import { SalesList } from "./SalesList";
import { Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SalesDashboardProps {
  sales: VendaO[];
  isLoading: boolean;
  onStatusChange: (id: string, status: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export function SalesDashboard({ sales, isLoading, onStatusChange, onDelete }: SalesDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const isMobile = useIsMobile();
  
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
        <CardTitle className="text-xl sm:text-2xl text-foreground">Dashboard de Vendas O</CardTitle>
        <CardDescription className="text-muted-foreground">
          Visão geral das vendas realizadas por outras filiais
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <Card className="bg-slate-50 dark:bg-slate-900">
            <CardContent className="p-3 sm:p-4">
              <div className="text-xs sm:text-sm font-medium text-muted-foreground">Produtos</div>
              <div className="text-xl sm:text-2xl font-bold text-foreground">{counts.aguardando_produto}</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-50 dark:bg-slate-900">
            <CardContent className="p-3 sm:p-4">
              <div className="text-xs sm:text-sm font-medium text-muted-foreground">Clientes</div>
              <div className="text-xl sm:text-2xl font-bold text-foreground">{counts.aguardando_cliente}</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-50 dark:bg-slate-900">
            <CardContent className="p-3 sm:p-4">
              <div className="text-xs sm:text-sm font-medium text-muted-foreground">Pendentes</div>
              <div className="text-xl sm:text-2xl font-bold text-foreground">{counts.pendente}</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-50 dark:bg-slate-900">
            <CardContent className="p-3 sm:p-4">
              <div className="text-xs sm:text-sm font-medium text-muted-foreground">Concluídas</div>
              <div className="text-xl sm:text-2xl font-bold text-foreground">{counts.concluida}</div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          {/* Improved TabsList layout for mobile */}
          <div className="overflow-x-auto -mx-2 pb-2">
            <TabsList className="mb-4 w-full min-w-max flex">
              <TabsTrigger className="flex-1 text-xs sm:text-sm whitespace-nowrap px-2 sm:px-3" value="all">Todas ({counts.all})</TabsTrigger>
              <TabsTrigger className="flex-1 text-xs sm:text-sm whitespace-nowrap px-2 sm:px-3" value="aguardando_produto">Produtos ({counts.aguardando_produto})</TabsTrigger>
              <TabsTrigger className="flex-1 text-xs sm:text-sm whitespace-nowrap px-2 sm:px-3" value="aguardando_cliente">Clientes ({counts.aguardando_cliente})</TabsTrigger>
              <TabsTrigger className="flex-1 text-xs sm:text-sm whitespace-nowrap px-2 sm:px-3" value="pendente">Pendentes ({counts.pendente})</TabsTrigger>
              <TabsTrigger className="flex-1 text-xs sm:text-sm whitespace-nowrap px-2 sm:px-3" value="concluida">Concluídas ({counts.concluida})</TabsTrigger>
            </TabsList>
          </div>
          
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
