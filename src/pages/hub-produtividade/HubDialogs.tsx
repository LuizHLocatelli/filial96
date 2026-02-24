
import { BuscaAvancada } from "@/components/hub-produtividade/components/funcionalidades/BuscaAvancada";
import { FiltrosPorData } from "@/components/hub-produtividade/components/funcionalidades/FiltrosPorData";

import type { DateRange } from "react-day-picker";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SearchResults = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DateFilters = any;

interface HubDialogsProps {
  showBuscaAvancada: boolean;
  setShowBuscaAvancada: (show: boolean) => void;
  showFiltrosPorData: boolean;
  setShowFiltrosPorData: (show: boolean) => void;
  onBuscaAvancadaResults: (results: SearchResults) => void;
  onFiltrosPorDataApply: (filters: DateFilters) => void;
}

export function HubDialogs({
  showBuscaAvancada,
  setShowBuscaAvancada,
  showFiltrosPorData,
  setShowFiltrosPorData,
  onBuscaAvancadaResults,
  onFiltrosPorDataApply
}: HubDialogsProps) {
  return (
    <>
      <BuscaAvancada
        open={showBuscaAvancada}
        onOpenChange={setShowBuscaAvancada}
        onResultsSelect={onBuscaAvancadaResults}
      />

      <FiltrosPorData
        open={showFiltrosPorData}
        onOpenChange={setShowFiltrosPorData}
        onFiltersApply={onFiltrosPorDataApply}
      />

    </>
  );
}
