
import { useState, useMemo } from "react";
import { useReservas } from "./hooks/useReservas";
import { useIsMobile } from "@/hooks/use-mobile";
import { PageLayout } from "@/components/layout/PageLayout";
import { ReservasHeader } from "./components/ReservasHeader";
import { ReservasStats } from "./components/ReservasStats";
import { ReservasSearchBar } from "./components/ReservasSearchBar";
import { ReservasContent } from "./components/ReservasContent";
import { ReservasFilters } from "./components/ReservasFilters";

export function Reservas() {
  const { reservas, isLoading, updateReservaStatus, deleteReserva } = useReservas();
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [quickSearch, setQuickSearch] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    forma_pagamento: 'all',
    cliente_vip: 'all',
    search: ''
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

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

      // Filtro por busca
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

  if (isLoading) {
    return (
      <PageLayout spacing="normal" maxWidth="full">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl"></div>
          <div className="h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout spacing="normal" maxWidth="full">
      <div className="space-y-6">
        {/* Header */}
        <ReservasHeader totalReservas={filteredReservas.length} />

        {/* Estatísticas */}
        <ReservasStats />

        {/* Layout responsivo */}
        <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-4'}`}>
          {/* Filtros desktop - sidebar */}
          {!isMobile && (
            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <ReservasFilters filters={filters} onFilterChange={handleFilterChange} />
              </div>
            </div>
          )}

          {/* Área principal */}
          <div className={`${isMobile ? '' : 'lg:col-span-3'}`}>
            <div className="space-y-6">
              {/* Barra de busca */}
              <ReservasSearchBar
                searchTerm={quickSearch}
                onSearchChange={setQuickSearch}
                filters={filters}
                onFilterChange={handleFilterChange}
                totalResults={filteredReservas.length}
              />

              {/* Conteúdo das reservas */}
              <ReservasContent
                reservas={filteredReservas}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onUpdateStatus={updateReservaStatus}
                onDelete={deleteReserva}
              />
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
