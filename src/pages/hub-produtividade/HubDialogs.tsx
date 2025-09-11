
import { BuscaAvancada } from "@/components/moveis/hub-produtividade/components/funcionalidades/BuscaAvancada";
import { FiltrosPorData } from "@/components/moveis/hub-produtividade/components/funcionalidades/FiltrosPorData";

interface HubDialogsProps {
  showBuscaAvancada: boolean;
  setShowBuscaAvancada: (show: boolean) => void;
  showFiltrosPorData: boolean;
  setShowFiltrosPorData: (show: boolean) => void;
  rotinas: any[];
  orientacoes: any[];
  tarefas: any[];
  onBuscaAvancadaResults: (results: any) => void;
  onFiltrosPorDataApply: (filters: any) => void;
}

export function HubDialogs({
  showBuscaAvancada,
  setShowBuscaAvancada,
  showFiltrosPorData,
  setShowFiltrosPorData,
  rotinas,
  orientacoes,
  tarefas,
  onBuscaAvancadaResults,
  onFiltrosPorDataApply
}: HubDialogsProps) {
  return (
    <>
      <BuscaAvancada
        open={showBuscaAvancada}
        onOpenChange={setShowBuscaAvancada}
        rotinas={rotinas}
        orientacoes={orientacoes}
        tarefas={tarefas}
        onResultsSelect={onBuscaAvancadaResults}
      />

      <FiltrosPorData
        open={showFiltrosPorData}
        onOpenChange={setShowFiltrosPorData}
        rotinas={rotinas}
        orientacoes={orientacoes}
        tarefas={tarefas}
        onFiltersApply={onFiltrosPorDataApply}
      />

    </>
  );
}
