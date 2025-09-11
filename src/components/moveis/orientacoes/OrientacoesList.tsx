import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

interface OrientacoesListProps {
  onNovaOrientacao?: () => void;
}

export function OrientacoesList({ onNovaOrientacao }: OrientacoesListProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [selectedOrientacao, setSelectedOrientacao] = useState<Orientacao | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  const { orientacoes, isLoading, refetch } = useOrientacoes();
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

  const handleViewOrientacaoWrapper = async (orientacao: Orientacao) => {
    
    if (orientacao.arquivo_tipo.includes("pdf")) {
      const params = new URLSearchParams();
      params.append("url", orientacao.arquivo_url);
      if (orientacao.arquivo_nome) {
        params.append("name", orientacao.arquivo_nome);
      }
      navigate(`/pdf-viewer?${params.toString()}`);
    } else {
      setSelectedOrientacao(orientacao);
      setViewerOpen(true);
    }
  };

  const handleUpdate = () => {
    refetch();
  };

  if (isLoading) {
    return <OrientacoesLoadingSkeleton />;
  }

  return (
    <div className="w-full mx-auto animate-fade-in space-y-4 sm:space-y-6 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5 max-w-7xl">
      <OrientacoesHeader 
        totalCount={typeStats.all}
        vmCount={typeStats.vm}
        informativoCount={typeStats.informativo}
        onNovaOrientacao={onNovaOrientacao}
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
        <OrientacoesEmptyState hasFilters={hasFilters} onNovaOrientacao={onNovaOrientacao} />
      ) : (
        <OrientacoesGrid
          orientacoes={filteredOrientacoes}
          viewMode={viewMode}
          onViewOrientacao={handleViewOrientacaoWrapper}
          onUpdate={handleUpdate}
        />
      )}

      {selectedOrientacao && !selectedOrientacao.arquivo_tipo.includes("pdf") && (
        <OrientacaoViewerDialog
          open={viewerOpen}
          onOpenChange={setViewerOpen}
          orientacao={selectedOrientacao}
        />
      )}
    </div>
  );
}
