
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

interface UseHubUrlParamsProps {
  setShowBuscaAvancada: (show: boolean) => void;
  setShowFiltrosPorData: (show: boolean) => void;
}

export function useHubUrlParams({
  setShowBuscaAvancada,
  setShowFiltrosPorData
}: UseHubUrlParamsProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const searchParam = searchParams.get('search');
    const filtersParam = searchParams.get('filters');
    
    if (searchParam === 'advanced') {
      setShowBuscaAvancada(true);
      // Limpar o parâmetro da URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('search');
      setSearchParams(newParams);
    }
    
    if (filtersParam === 'date') {
      setShowFiltrosPorData(true);
      // Limpar o parâmetro da URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('filters');
      setSearchParams(newParams);
    }
  }, [searchParams, setSearchParams, setShowBuscaAvancada, setShowFiltrosPorData]);

  return { searchParams, setSearchParams };
}
