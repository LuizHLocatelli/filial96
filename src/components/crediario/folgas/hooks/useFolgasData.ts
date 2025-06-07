
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Folga } from "../types";
import { isSameDay } from "date-fns";

// Função para converter string de data do banco para Date local
const parseLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // month - 1 porque Date() usa mês base 0
};

export function useFolgasData() {
  const [folgas, setFolgas] = useState<Folga[]>([]);
  const [isLoadingFolgas, setIsLoadingFolgas] = useState(true);

  useEffect(() => {
    const fetchFolgas = async () => {
      try {
        setIsLoadingFolgas(true);
        console.log("🔄 Carregando folgas...");
        
        const { data, error } = await supabase
          .from("crediario_folgas")
          .select("*")
          .order("data", { ascending: true });

        if (error) {
          console.error("Erro ao buscar folgas:", error);
          return;
        }

        console.log("📊 Dados brutos das folgas:", data);

        // Converter dados do banco para formato esperado
        const folgasFormatadas: Folga[] = (data || []).map((folga) => ({
          id: folga.id,
          data: parseLocalDate(folga.data), // Usar parseLocalDate para manter timezone local
          crediaristaId: folga.crediarista_id,
          motivo: folga.motivo || undefined,
          createdAt: folga.created_at,
          createdBy: folga.created_by,
        }));

        console.log("✅ Folgas formatadas:", folgasFormatadas.map(f => ({
          id: f.id,
          data_string: f.data.toDateString(),
          data_iso: f.data.toISOString()
        })));

        setFolgas(folgasFormatadas);
      } catch (error) {
        console.error("Erro ao carregar folgas:", error);
      } finally {
        setIsLoadingFolgas(false);
      }
    };

    fetchFolgas();
  }, []);

  const getFolgasForDay = (date: Date): Folga[] => {
    return folgas.filter(folga => isSameDay(folga.data, date));
  };

  return {
    folgas,
    setFolgas,
    isLoadingFolgas,
    getFolgasForDay,
  };
}
