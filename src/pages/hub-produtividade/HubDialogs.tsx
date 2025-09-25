
import { BuscaAvancada } from "@/components/moveis/hub-produtividade/components/funcionalidades/BuscaAvancada";
import { FiltrosPorData } from "@/components/moveis/hub-produtividade/components/funcionalidades/FiltrosPorData";

interface HubDialogsProps {
  showBuscaAvancada: boolean;
  setShowBuscaAvancada: (show: boolean) => void;
  showFiltrosPorData: boolean;
  setShowFiltrosPorData: (show: boolean) => void;
  orientacoes: any[];
  onBuscaAvancadaResults: (results: any) => void;
  onFiltrosPorDataApply: (filters: any) => void;
}

export function HubDialogs({
  showBuscaAvancada,
  setShowBuscaAvancada,
  showFiltrosPorData,
  setShowFiltrosPorData,
  orientacoes,
  onBuscaAvancadaResults,
  onFiltrosPorDataApply
}: HubDialogsProps) {
  return (
    <>
      <BuscaAvancada
        open={showBuscaAvancada}
        onOpenChange={setShowBuscaAvancada}
        orientacoes={orientacoes}
        onResultsSelect={onBuscaAvancadaResults}
      />

      <FiltrosPorData
        open={showFiltrosPorData}
        onOpenChange={setShowFiltrosPorData}
        orientacoes={orientacoes}
        onFiltersApply={onFiltrosPorDataApply}
      />

    </>
  );
}
