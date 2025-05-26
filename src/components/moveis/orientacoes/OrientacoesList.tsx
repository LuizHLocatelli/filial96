
import { useState } from "react";
import { OrientacaoViewerDialog } from "./OrientacaoViewerDialog";
import { Orientacao } from "./types";
import { useIsMobile } from "@/hooks/use-mobile";
import { useOrientacoes } from "./hooks/useOrientacoes";
import { useOrientacoesFilters } from "./hooks/useOrientacoesFilters";
import { OrientacoesHeader } from "./components/OrientacoesHeader";
import { OrientacoesFilters } from "./components/OrientacoesFilters";
import { OrientacoesEmptyState } from "./components/OrientacoesEmptyState";
import { OrientacoesGrid } from "./components/OrientacoesGrid";
import { OrientacoesLoadingSkeleton } from "./components/OrientacoesLoadingSkeleton";

export function OrientacoesList() {
  const isMobile = useIsMobile();
  const [selectedOrientacao, setSelectedOrientacao] = useState<Orientacao | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  const { orientacoes, isLoading } = useOrientacoes();
  const {
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    viewMode,
    setViewMode,
    filteredOrientacoes,
    typeStats,
    hasFilters
  } = useOrientacoesFilters(orientacoes);

  const handleViewOrientacao = (orientacao: Orientacao) => {
    setSelectedOrientacao(orientacao);
    setViewerOpen(true);
  };

  if (isLoading) {
    return <OrientacoesLoadingSkeleton />;
  }

  return (
    <div className={`space-y-4 w-full max-w-full ${isMobile ? 'px-2' : 'px-4'}`}>
      <OrientacoesHeader 
        totalCount={typeStats.all}
        vmCount={typeStats.vm}
        informativoCount={typeStats.informativo}
      />

      <OrientacoesFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterType={filterType}
        onFilterChange={setFilterType}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {filteredOrientacoes.length === 0 ? (
        <OrientacoesEmptyState hasFilters={hasFilters} />
      ) : (
        <OrientacoesGrid
          orientacoes={filteredOrientacoes}
          viewMode={viewMode}
          onViewOrientacao={handleViewOrientacao}
        />
      )}

      {selectedOrientacao && (
        <OrientacaoViewerDialog
          open={viewerOpen}
          onOpenChange={setViewerOpen}
          orientacao={selectedOrientacao}
        />
      )}
    </div>
  );
}
