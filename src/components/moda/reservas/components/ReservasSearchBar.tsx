
import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReservasFilters } from "./ReservasFilters";

interface ReservasSearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filters: {
    status: string;
    forma_pagamento: string;
    cliente_vip: string;
    search: string;
  };
  onFilterChange: (key: string, value: string) => void;
  totalResults: number;
}

export function ReservasSearchBar({
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange,
  totalResults
}: ReservasSearchBarProps) {
  const isMobile = useIsMobile();
  const [showFiltersDialog, setShowFiltersDialog] = useState(false);

  const hasActiveFilters = filters.status !== 'all' || 
                          filters.forma_pagamento !== 'all' || 
                          filters.cliente_vip !== 'all';

  return (
    <div className="space-y-4">
      {/* Barra de busca */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input
          placeholder="Buscar por cliente, produto ou código..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-12 h-12 rounded-xl border-0 shadow-md bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm"
        />
      </div>

      {/* Controles */}
      <div className={`flex items-center ${isMobile ? 'flex-col gap-3' : 'justify-between'}`}>
        {/* Filtros */}
        <div className={isMobile ? 'w-full' : ''}>
          {isMobile ? (
            <Dialog open={showFiltersDialog} onOpenChange={setShowFiltersDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full h-11 rounded-xl shadow-md">
                  <Filter className="h-5 w-5 mr-3" />
                  Filtros
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-3 h-6 w-6 p-0 flex items-center justify-center">
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
                  <ReservasFilters filters={filters} onFilterChange={onFilterChange} />
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <Button variant="outline" size="sm" className="h-12 px-6 rounded-xl shadow-md">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  !
                </Badge>
              )}
            </Button>
          )}
        </div>

        {/* Contador de resultados */}
        <Badge 
          variant="secondary" 
          className={`rounded-xl font-medium ${
            isMobile ? 'w-full h-11 px-4 text-base flex items-center justify-center' : 'h-12 px-4'
          }`}
        >
          {totalResults} {totalResults === 1 ? 'reserva' : 'reservas'}
        </Badge>
      </div>
    </div>
  );
}
