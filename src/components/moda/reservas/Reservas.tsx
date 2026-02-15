import { useState, useMemo } from "react";
import { PlusCircle, Clock, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useReservas } from "./hooks/useReservas";
import { useIsMobile } from "@/hooks/use-mobile";
import { AddReservaButton } from "./components/AddReservaButton";
import { ReservasFilters } from "./components/ReservasFilters";
import { ReservaCard } from "./components/ReservaCard";
import { Clock as ClockIcon } from "lucide-react";
import { StandardDialogHeader } from "@/components/ui/standard-dialog";

export function Reservas() {
  const { reservas, isLoading, updateReservaStatus, deleteReserva, fetchReservas } = useReservas();
  const isMobile = useIsMobile();
  const [quickSearch, setQuickSearch] = useState("");
  const [showFiltersDialog, setShowFiltersDialog] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    forma_pagamento: "all",
    cliente_vip: "all",
    search: "",
  });

  

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filteredReservas = useMemo(() => {
    return reservas.filter((reserva) => {
      // Filtro por status
      if (filters.status !== "all" && reserva.status !== filters.status) {
        return false;
      }

      // Filtro por forma de pagamento
      if (
        filters.forma_pagamento !== "all" &&
        reserva.forma_pagamento !== filters.forma_pagamento
      ) {
        return false;
      }

      // Filtro por Cliente VIP
      if (filters.cliente_vip !== "all") {
        if (filters.cliente_vip === "vip" && !reserva.cliente_vip) {
          return false;
        }
        if (filters.cliente_vip === "regular" && reserva.cliente_vip) {
          return false;
        }
      }

      // Filtro por busca rápida
      const searchTerm = quickSearch || filters.search;
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          reserva.cliente_nome.toLowerCase().includes(searchLower) ||
          reserva.produtos.some(
            (produto) =>
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
      ativas: filteredReservas.filter((r) => r.status === "ativa"),
      expiradas: filteredReservas.filter((r) => r.status === "expirada"),
      convertidas: filteredReservas.filter((r) => r.status === "convertida"),
      canceladas: filteredReservas.filter((r) => r.status === "cancelada"),
    };
  }, [filteredReservas]);

  // Estatísticas
  const stats = useMemo(() => {
    return {
      ativas: reservas.filter((r) => r.status === "ativa").length,
      expiradas: reservas.filter((r) => r.status === "expirada").length,
      convertidas: reservas.filter((r) => r.status === "convertida").length,
      canceladas: reservas.filter((r) => r.status === "cancelada").length,
      vips: reservas.filter((r) => r.cliente_vip).length,
      total: reservas.length,
    };
  }, [reservas]);

  if (isLoading) {
    return (
      <div className="w-full mx-auto space-y-6 px-4 py-5 max-w-7xl">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-72 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid-responsive-stats">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-12 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto animate-fade-in space-y-4 sm:space-y-6 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <ClockIcon className="h-6 w-6 text-primary" />
            Reservas
          </h2>
          <p className="text-sm text-muted-foreground">
            Gerenciamento de reservas de produtos
          </p>
        </div>
        <AddReservaButton />
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid-responsive-stats">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativas</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ativas}</div>
            <p className="text-xs text-muted-foreground">Reservas em andamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiradas</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.expiradas}</div>
            <p className="text-xs text-muted-foreground">Fora do prazo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Convertidas</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.convertidas}</div>
            <p className="text-xs text-muted-foreground">Vendas realizadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VIP</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.vips}</div>
            <p className="text-xs text-muted-foreground">Clientes VIP</p>
          </CardContent>
        </Card>
      </div>

      {/* Busca e Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente, produto ou código..."
            value={quickSearch}
            onChange={(e) => setQuickSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {isMobile ? (
          <Dialog open={showFiltersDialog} onOpenChange={setShowFiltersDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                {(filters.status !== "all" ||
                  filters.forma_pagamento !== "all" ||
                  filters.cliente_vip !== "all") && (
                  <Badge variant="secondary" className="ml-2">
                    !
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className={`${isMobile ? 'w-[calc(100%-2rem)] max-w-full p-0' : 'sm:max-w-lg p-0'} max-h-[85vh] overflow-y-auto flex flex-col`} hideCloseButton>
              <StandardDialogHeader
                icon={Filter}
                iconColor="primary"
                title="Filtros"
                description="Refine sua busca por reservas"
                onClose={() => setShowFiltersDialog(false)}
              />
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="space-y-4">
                  <ReservasFilters filters={filters} onFilterChange={handleFilterChange} />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <Button
            variant="outline"
            onClick={() => {
              const filtersCard = document.getElementById("filters-card");
              filtersCard?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        )}

        <Badge variant="secondary" className="self-center">
          {filteredReservas.length} {filteredReservas.length === 1 ? "reserva" : "reservas"}
        </Badge>
      </div>

      {/* Layout Principal */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Filtros Desktop - Sidebar */}
        {!isMobile && (
          <div className="lg:col-span-1">
            <div id="filters-card" className="sticky top-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Filtros</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReservasFilters filters={filters} onFilterChange={handleFilterChange} />
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Área Principal de Conteúdo */}
        <div className="lg:col-span-3">
          {filteredReservas.length === 0 ? (
            <div className="text-center py-12">
              <ClockIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma reserva encontrada</h3>
              <p className="text-sm text-muted-foreground">
                {quickSearch || filters.search || filters.status !== "all"
                  ? "Tente ajustar os filtros ou o termo de busca."
                  : "Comece criando sua primeira reserva."}
              </p>
            </div>
          ) : isMobile ? (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">Todas ({filteredReservas.length})</TabsTrigger>
                <TabsTrigger value="ativas">Ativas ({reservasByStatus.ativas.length})</TabsTrigger>
                <TabsTrigger value="outras">
                  Outras ({reservasByStatus.expiradas.length + reservasByStatus.convertidas.length + reservasByStatus.canceladas.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <div className="grid grid-cols-1 gap-4">
                  {filteredReservas.map((reserva) => (
                    <ReservaCard
                      key={reserva.id}
                      reserva={reserva}
                      onUpdateStatus={updateReservaStatus}
                      onDelete={deleteReserva}
                      onRefresh={fetchReservas}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="ativas" className="mt-4">
                <div className="grid grid-cols-1 gap-4">
                  {reservasByStatus.ativas.map((reserva) => (
                    <ReservaCard
                      key={reserva.id}
                      reserva={reserva}
                      onUpdateStatus={updateReservaStatus}
                      onDelete={deleteReserva}
                      onRefresh={fetchReservas}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="outras" className="mt-4">
                <div className="grid grid-cols-1 gap-4">
                  {[
                    ...reservasByStatus.expiradas,
                    ...reservasByStatus.convertidas,
                    ...reservasByStatus.canceladas,
                  ].map((reserva) => (
                    <ReservaCard
                      key={reserva.id}
                      reserva={reserva}
                      onUpdateStatus={updateReservaStatus}
                      onDelete={deleteReserva}
                      onRefresh={fetchReservas}
                    />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredReservas.map((reserva) => (
                <ReservaCard
                  key={reserva.id}
                  reserva={reserva}
                  onUpdateStatus={updateReservaStatus}
                  onDelete={deleteReserva}
                  onRefresh={fetchReservas}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
