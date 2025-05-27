
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { VendaO, statusOptions } from "@/types/vendaO";
import { SalesList } from "./SalesList";
import { Loader2, Search, Package, Users, Clock, CheckCircle, TrendingUp } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";

interface SalesDashboardProps {
  sales: VendaO[];
  isLoading: boolean;
  onStatusChange: (id: string, status: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export function SalesDashboard({ sales, isLoading, onStatusChange, onDelete }: SalesDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const isMobile = useIsMobile();
  
  // Filtrar vendas por busca
  const filteredSalesBySearch = sales.filter(sale => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      sale.nome_cliente.toLowerCase().includes(searchLower) ||
      sale.filial.toLowerCase().includes(searchLower) ||
      (sale.telefone && sale.telefone.toLowerCase().includes(searchLower)) ||
      sale.id.toLowerCase().includes(searchLower) ||
      (Array.isArray(sale.produtos) && sale.produtos.some(produto => 
        produto.nome.toLowerCase().includes(searchLower) || 
        produto.codigo.toLowerCase().includes(searchLower)
      ))
    );
  });
  
  // Filtrar por status
  const filteredSales = activeTab === "all" 
    ? filteredSalesBySearch 
    : filteredSalesBySearch.filter(sale => sale.status === activeTab);
  
  const counts = {
    all: filteredSalesBySearch.length,
    aguardando_produto: filteredSalesBySearch.filter(s => s.status === 'aguardando_produto').length,
    aguardando_cliente: filteredSalesBySearch.filter(s => s.status === 'aguardando_cliente').length,
    pendente: filteredSalesBySearch.filter(s => s.status === 'pendente').length,
    concluida: filteredSalesBySearch.filter(s => s.status === 'concluida').length,
  };

  const getTitleByStatus = (status: string): string => {
    switch(status) {
      case 'aguardando_produto': return 'Aguardando Produto';
      case 'aguardando_cliente': return 'Aguardando Cliente';
      case 'pendente': return 'Pendentes';
      case 'concluida': return 'Concluídas';
      default: return 'Todas as Vendas';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'aguardando_produto': return Package;
      case 'aguardando_cliente': return Users;
      case 'pendente': return Clock;
      case 'concluida': return CheckCircle;
      default: return TrendingUp;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'aguardando_produto': return 'from-blue-500 to-blue-600';
      case 'aguardando_cliente': return 'from-amber-500 to-amber-600';
      case 'pendente': return 'from-red-500 to-red-600';
      case 'concluida': return 'from-green-500 to-green-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Carregando vendas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard de Vendas O</h2>
            <p className="text-muted-foreground">
              Gerencie vendas de outras filiais com entrega ou retirada na nossa loja
            </p>
          </div>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 w-fit">
            <TrendingUp className="h-4 w-4 mr-2" />
            {sales.length} vendas cadastradas
          </Badge>
        </div>

        {/* Campo de pesquisa */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente, filial, produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 border-border/60 focus:border-primary bg-background/50"
          />
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { key: 'aguardando_produto', label: 'Aguardando Produto', count: counts.aguardando_produto },
            { key: 'aguardando_cliente', label: 'Aguardando Cliente', count: counts.aguardando_cliente },
            { key: 'pendente', label: 'Pendentes', count: counts.pendente },
            { key: 'concluida', label: 'Concluídas', count: counts.concluida },
          ].map((stat) => {
            const Icon = getStatusIcon(stat.key);
            const colorClass = getStatusColor(stat.key);
            
            return (
              <Card 
                key={stat.key} 
                className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onClick={() => setActiveTab(stat.key)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-5 group-hover:opacity-10 transition-opacity`} />
                <CardContent className="p-4 sm:p-6 relative">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="text-2xl sm:text-3xl font-bold">{stat.count}</p>
                    </div>
                    <div className={`p-2 sm:p-3 rounded-full bg-gradient-to-br ${colorClass} shadow-lg`}>
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Resultado da pesquisa */}
      {searchTerm && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Search className="h-4 w-4" />
          <span>
            {filteredSalesBySearch.length} resultado(s) encontrado(s) para "{searchTerm}"
          </span>
          {filteredSalesBySearch.length !== sales.length && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-primary hover:underline ml-2"
            >
              Limpar filtros
            </button>
          )}
        </div>
      )}
        
      {/* Tabs de filtros */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto pb-2">
          <TabsList className="grid w-full min-w-max grid-cols-5 h-14 bg-muted/30 p-1 rounded-xl">
            <TabsTrigger 
              value="all" 
              className="flex flex-col gap-1 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all px-2 sm:px-4"
            >
              <span className="text-xs sm:text-sm font-medium">Todas</span>
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                {counts.all}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="aguardando_produto" 
              className="flex flex-col gap-1 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all px-2 sm:px-4"
            >
              <span className="text-xs sm:text-sm font-medium whitespace-nowrap">Produtos</span>
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                {counts.aguardando_produto}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="aguardando_cliente" 
              className="flex flex-col gap-1 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all px-2 sm:px-4"
            >
              <span className="text-xs sm:text-sm font-medium whitespace-nowrap">Clientes</span>
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                {counts.aguardando_cliente}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="pendente" 
              className="flex flex-col gap-1 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all px-2 sm:px-4"
            >
              <span className="text-xs sm:text-sm font-medium whitespace-nowrap">Pendentes</span>
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                {counts.pendente}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="concluida" 
              className="flex flex-col gap-1 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all px-2 sm:px-4"
            >
              <span className="text-xs sm:text-sm font-medium whitespace-nowrap">Concluídas</span>
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                {counts.concluida}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value={activeTab} className="mt-6">
          <SalesList 
            sales={filteredSales} 
            title={getTitleByStatus(activeTab)}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
