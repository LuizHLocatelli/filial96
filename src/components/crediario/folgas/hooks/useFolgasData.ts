
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Folga } from "../types";
import { isSameDay } from "date-fns";

export function useFolgasData() {
  const { toast } = useToast();
  const [folgas, setFolgas] = useState<Folga[]>([]);
  const [isLoadingFolgas, setIsLoadingFolgas] = useState<boolean>(true);

  // Fetch folgas from database
  useEffect(() => {
    async function fetchFolgas() {
      setIsLoadingFolgas(true);
      try {
        const { data, error } = await supabase
          .from("crediario_folgas")
          .select("*");
          
        if (error) {
          console.error("Erro ao buscar folgas:", error);
          toast({
            title: "Erro ao carregar folgas",
            description: error.message,
            variant: "destructive",
          });
          return;
        }
        
        // Transform the data to match the Folga interface
        const formattedFolgas: Folga[] = data.map((folga) => ({
          id: folga.id,
          data: new Date(folga.data),
          crediaristaId: folga.crediarista_id,
          motivo: folga.motivo || undefined,
          createdAt: folga.created_at,
          createdBy: folga.created_by,
        }));
        
        setFolgas(formattedFolgas);
        console.log("Folgas carregadas:", formattedFolgas.length);
      } catch (error) {
        console.error("Erro ao buscar folgas:", error);
        toast({
          title: "Erro ao carregar folgas",
          description: "Não foi possível carregar a lista de folgas.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingFolgas(false);
      }
    }
    
    fetchFolgas();
  }, [toast]);

  const getFolgasForDay = (day: Date) => {
    return folgas.filter(folga => 
      isSameDay(folga.data, day)
    );
  };

  return {
    folgas,
    setFolgas,
    isLoadingFolgas,
    getFolgasForDay,
  };
}
