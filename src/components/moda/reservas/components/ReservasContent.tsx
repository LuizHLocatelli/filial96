
import { useMemo } from "react";
import { Clock, Grid3X3, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReservaCard } from "./ReservaCard";
import { ModaReserva } from "../types";
import { useIsMobile } from "@/hooks/use-mobile";

interface ReservasContentProps {
  reservas: ModaReserva[];
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onUpdateStatus: (id: string, status: ModaReserva['status']) => void;
  onDelete: (id: string) => void;
}

export function ReservasContent({
  reservas,
  viewMode,
  onViewModeChange,
  onUpdateStatus,
  onDelete
}: ReservasContentProps) {
  const isMobile = useIsMobile();

  const reservasByStatus = useMemo(() => {
    return {
      ativas: reservas.filter(r => r.status === 'ativa'),
      expiradas: reservas.filter(r => r.status === 'expirada'),
      convertidas: reservas.filter(r => r.status === 'convertida'),
      canceladas: reservas.filter(r => r.status === 'cancelada'),
    };
  }, [reservas]);

  if (reservas.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20 dark:from-green-600/40 dark:to-green-500/40 blur-3xl rounded-full"></div>
          <Clock className="relative text-green-400 dark:text-green-400 mx-auto mb-6 h-20 w-20" />
        </div>
        <h3 className="font-bold mb-3 bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-green-300 bg-clip-text text-transparent text-2xl">
          Nenhuma reserva encontrada
        </h3>
        <p className="text-muted-foreground mb-8 mx-auto max-w-md">
          Comece criando sua primeira reserva e transforme leads em vendas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controles de visualização (apenas desktop) */}
      {!isMobile && (
        <div className="flex justify-end gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className="h-10"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className="h-10"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Conteúdo das reservas */}
      {isMobile ? (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 h-12 rounded-xl p-1">
            <TabsTrigger value="all" className="rounded-lg text-sm font-medium h-10">
              Todas ({reservas.length})
            </TabsTrigger>
            <TabsTrigger value="ativas" className="rounded-lg text-sm font-medium h-10">
              Ativas ({reservasByStatus.ativas.length})
            </TabsTrigger>
            <TabsTrigger value="outras" className="rounded-lg text-sm font-medium h-10">
              Outras ({reservasByStatus.expiradas.length + reservasByStatus.convertidas.length + reservasByStatus.canceladas.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {reservas.map((reserva) => (
                <ReservaCard 
                  key={reserva.id} 
                  reserva={reserva} 
                  onUpdateStatus={onUpdateStatus}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="ativas">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {reservasByStatus.ativas.map((reserva) => (
                <ReservaCard 
                  key={reserva.id} 
                  reserva={reserva} 
                  onUpdateStatus={onUpdateStatus}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="outras">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...reservasByStatus.expiradas, ...reservasByStatus.convertidas, ...reservasByStatus.canceladas].map((reserva) => (
                <ReservaCard 
                  key={reserva.id} 
                  reserva={reserva} 
                  onUpdateStatus={onUpdateStatus}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1 max-w-4xl mx-auto'
        }`}>
          {reservas.map((reserva) => (
            <ReservaCard 
              key={reserva.id} 
              reserva={reserva} 
              onUpdateStatus={onUpdateStatus}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
