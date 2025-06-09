import { useState, useMemo, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Clock, Search, Filter, Grid3X3, List } from "lucide-react";
import { ReservasStats } from "./components/ReservasStats";
import { AddReservaDialog } from "./components/AddReservaDialog";
import { ReservasFilters } from "./components/ReservasFilters";
import { ReservaCard } from "./components/ReservaCard";
import { useReservas } from "./hooks/useReservas";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function Reservas() {
  const { reservas, isLoading, updateReservaStatus, deleteReserva } = useReservas();
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [quickSearch, setQuickSearch] = useState('');
  const [showFiltersDialog, setShowFiltersDialog] = useState(false);
  const [showStickyActions, setShowStickyActions] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    forma_pagamento: 'all',
    cliente_vip: 'all',
    search: ''
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Controle da barra de ações fixa baseado no scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const shouldShow = scrollTop > 200; // Mostra após 200px de scroll
      setShowStickyActions(shouldShow);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredReservas = useMemo(() => {
    return reservas.filter(reserva => {
      // Filtro por status
      if (filters.status !== 'all' && reserva.status !== filters.status) {
        return false;
      }

      // Filtro por forma de pagamento
      if (filters.forma_pagamento !== 'all' && reserva.forma_pagamento !== filters.forma_pagamento) {
        return false;
      }

      // Filtro por Cliente VIP
      if (filters.cliente_vip !== 'all') {
        if (filters.cliente_vip === 'vip' && !reserva.cliente_vip) {
          return false;
        }
        if (filters.cliente_vip === 'regular' && reserva.cliente_vip) {
          return false;
        }
      }

      // Filtro por busca rápida
      const searchTerm = quickSearch || filters.search;
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          reserva.cliente_nome.toLowerCase().includes(searchLower) ||
          reserva.produtos.some(produto => 
            produto.nome.toLowerCase().includes(searchLower) ||
            produto.codigo.toLowerCase().includes(searchLower)
          ) ||
          reserva.cliente_cpf.includes(searchTerm)
        );
      }

      return true;
    });
  }, [reservas, filters, quickSearch]);

  const reservasByStatus = useMemo(() => {
    return {
      ativas: filteredReservas.filter(r => r.status === 'ativa'),
      expiradas: filteredReservas.filter(r => r.status === 'expirada'),
      convertidas: filteredReservas.filter(r => r.status === 'convertida'),
      canceladas: filteredReservas.filter(r => r.status === 'cancelada'),
    };
  }, [filteredReservas]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Reservas"
          description="Gerenciamento inteligente de reservas"
          icon={Clock}
          iconColor="text-green-600"
        />
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Barra de ações fixa no topo (aparece no scroll) */}
      <div
        className={`fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b transition-all duration-300 ${
          showStickyActions && !isMobile ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
      >
        <div className="w-full px-4 py-3">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-foreground">Reservas</span>
              <Badge variant="secondary" className="text-xs">
                {filteredReservas.length}
              </Badge>
            </div>
            <AddReservaDialog variant="default" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Header aprimorado com posicionamento estratégico do botão */}
        <div className={`relative`}>
          <PageHeader
            title="Reservas"
            description="Gerenciamento inteligente de reservas de produtos"
            icon={Clock}
            iconColor="text-green-600"
            fullWidthActionsOnMobile={true}
            actions={
              <div className={`flex gap-3 ${isMobile ? 'flex-col w-full' : 'flex-col sm:flex-row items-center'}`}>
                {/* Botão principal no header - mais proeminente */}
                <AddReservaDialog 
                  variant="prominent" 
                  className={isMobile ? 'order-1' : ''} 
                />
                
                {/* Controles de visualização no desktop */}
                {!isMobile && (
                  <div className="flex gap-2 order-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="h-10"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="h-10"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            }
          />
        </div>

        {/* Estatísticas modernas */}
        <ReservasStats />

        {/* Barra de busca rápida e filtros mobile */}
        <div className={`flex flex-col items-stretch gap-4`}>
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Buscar por cliente, produto ou código..."
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              className={`pl-12 rounded-xl border-0 shadow-md bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm placeholder:text-gray-400 dark:placeholder:text-gray-400 dark:text-white ${
                isMobile ? 'h-11 text-base' : 'h-12'
              }`}
            />
          </div>

          <div className={`flex items-center ${isMobile ? 'flex-col gap-2' : 'gap-3 justify-end'}`}>
            {/* Filtros mobile */}
            {isMobile ? (
              <Dialog open={showFiltersDialog} onOpenChange={setShowFiltersDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full h-11 px-6 rounded-xl shadow-md text-base">
                    <Filter className="h-5 w-5 mr-3" />
                    Filtros
                    {(filters.status !== 'all' || filters.forma_pagamento !== 'all' || filters.cliente_vip !== 'all') && (
                      <Badge variant="secondary" className="ml-3 h-6 w-6 p-0 flex items-center justify-center text-sm font-bold">
                        !
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-md">
                  <DialogHeader>
                    <DialogTitle>Filtros</DialogTitle>
                    <DialogDescription>
                      Refine sua busca por reservas
                    </DialogDescription>
                  </DialogHeader>
                  <div className="mt-6">
                    <ReservasFilters filters={filters} onFilterChange={handleFilterChange} />
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="h-12 px-6 rounded-xl shadow-md"
                onClick={() => {
                  const filtersCard = document.getElementById('filters-card');
                  filtersCard?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            )}

            {/* Badge com total de resultados */}
            <Badge variant="secondary" className={`rounded-xl font-medium ${
              isMobile ? 'w-full h-11 px-4 text-base flex items-center justify-center' : 'h-12 px-4 text-sm'
            }`}>
              {filteredReservas.length} {filteredReservas.length === 1 ? 'reserva' : 'reservas'}
            </Badge>
          </div>
        </div>

        {/* Layout principal responsivo */}
        <div className={`grid gap-8 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-4'}`}>
          {/* Filtros desktop - sidebar elegante */}
          {!isMobile && (
            <div className="lg:col-span-1">
              <div id="filters-card" className="sticky top-4">
                <ReservasFilters filters={filters} onFilterChange={handleFilterChange} />
              </div>
            </div>
          )}

          {/* Área principal de conteúdo */}
          <div className={`${isMobile ? '' : 'lg:col-span-3'}`}>
            {filteredReservas.length === 0 ? (
              <div className={`text-center py-20`}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20 dark:from-green-600/40 dark:to-green-500/40 blur-3xl rounded-full"></div>
                  <Clock className={`relative text-green-400 dark:text-green-400 mx-auto mb-6 h-20 w-20`} />
                </div>
                <h3 className={`font-bold mb-3 bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-green-300 bg-clip-text text-transparent text-2xl`}>
                  Nenhuma reserva encontrada
                </h3>
                <p className={`text-muted-foreground mb-8 mx-auto max-w-md`}>
                  {quickSearch || filters.search || filters.status !== 'all' || filters.forma_pagamento !== 'all' || filters.cliente_vip !== 'all'
                    ? 'Tente ajustar os filtros ou o termo de busca para encontrar reservas.'
                    : 'Comece criando sua primeira reserva e transforme leads em vendas.'}
                </p>
              </div>
            ) :
              <div className={isMobile ? 'space-y-6' : 'space-y-8'}>
                {/* Visualização por abas no mobile */}
                {isMobile ? (
                  <div className="px-0">
                    <Tabs defaultValue="all" className="w-full">
                      <TabsList className="grid w-full grid-cols-3 mb-4 h-12 rounded-xl p-1">
                        <TabsTrigger value="all" className="rounded-lg text-sm font-medium h-10">
                          Todas ({filteredReservas.length})
                        </TabsTrigger>
                        <TabsTrigger value="ativas" className="rounded-lg text-sm font-medium h-10">
                          Ativas ({reservasByStatus.ativas.length})
                        </TabsTrigger>
                        <TabsTrigger value="outras" className="rounded-lg text-sm font-medium h-10">
                          Outras ({reservasByStatus.expiradas.length + reservasByStatus.convertidas.length + reservasByStatus.canceladas.length})
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="all">
                        <div className="grid grid-cols-2 gap-3">
                          {filteredReservas.map((reserva) => (
                            <ReservaCard 
                              key={reserva.id} 
                              reserva={reserva} 
                              onUpdateStatus={updateReservaStatus}
                              onDelete={deleteReserva}
                            />
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="ativas">
                        <div className="grid grid-cols-2 gap-3">
                          {reservasByStatus.ativas.map((reserva) => (
                            <ReservaCard 
                              key={reserva.id} 
                              reserva={reserva} 
                              onUpdateStatus={updateReservaStatus}
                              onDelete={deleteReserva}
                            />
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="outras">
                        <div className="grid grid-cols-2 gap-3">
                          {[...reservasByStatus.expiradas, ...reservasByStatus.convertidas, ...reservasByStatus.canceladas].map((reserva) => (
                            <ReservaCard 
                              key={reserva.id} 
                              reserva={reserva} 
                              onUpdateStatus={updateReservaStatus}
                              onDelete={deleteReserva}
                            />
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                ) : (
                  /* Visualização desktop responsiva */
                  <div className={`grid gap-6 ${
                    viewMode === 'grid' 
                      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5' 
                      : 'grid-cols-1 max-w-6xl mx-auto'
                  }`}>
                    {filteredReservas.map((reserva) => (
                      <ReservaCard 
                        key={reserva.id} 
                        reserva={reserva} 
                        onUpdateStatus={updateReservaStatus}
                        onDelete={deleteReserva}
                      />
                    ))}
                  </div>
                )}
              </div>
            }
          </div>
        </div>
      </div>
    </>
  );
}
