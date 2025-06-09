
import { useState, useMemo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Clock } from "lucide-react";
import { ReservasStats } from "./components/ReservasStats";
import { AddReservaDialog } from "./components/AddReservaDialog";
import { ReservasFilters } from "./components/ReservasFilters";
import { ReservaCard } from "./components/ReservaCard";
import { useReservas } from "./hooks/useReservas";
import { useIsMobile } from "@/hooks/use-mobile";

export function Reservas() {
  const { reservas, isLoading, updateReservaStatus, deleteReserva } = useReservas();
  const isMobile = useIsMobile();
  const [filters, setFilters] = useState({
    status: 'all',
    forma_pagamento: 'all',
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

      // Filtro por busca
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          reserva.cliente_nome.toLowerCase().includes(searchLower) ||
          reserva.produtos.some(produto => 
            produto.nome.toLowerCase().includes(searchLower) ||
            produto.codigo.toLowerCase().includes(searchLower)
          ) ||
          reserva.cliente_cpf.includes(filters.search)
        );
      }

      return true;
    });
  }, [reservas, filters]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Reservas"
          description="Gerenciamento de reservas de produtos de moda"
          icon={Clock}
          iconColor="text-purple-600"
        />
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reservas"
        description="Gerenciamento de reservas de produtos de moda"
        icon={Clock}
        iconColor="text-purple-600"
        actions={<AddReservaDialog />}
      />

      <ReservasStats />

      <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-4'}`}>
        {/* Filtros */}
        <div className={isMobile ? 'order-2' : 'lg:col-span-1'}>
          <ReservasFilters filters={filters} onFilterChange={handleFilterChange} />
        </div>

        {/* Lista de Reservas */}
        <div className={`${isMobile ? 'order-1' : 'lg:col-span-3'}`}>
          {filteredReservas.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma reserva encontrada</h3>
              <p className="text-muted-foreground mb-4">
                {filters.search || filters.status !== 'all' || filters.forma_pagamento !== 'all'
                  ? 'Tente ajustar os filtros para encontrar reservas.'
                  : 'Comece criando sua primeira reserva.'}
              </p>
              <AddReservaDialog />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
      </div>
    </div>
  );
}
