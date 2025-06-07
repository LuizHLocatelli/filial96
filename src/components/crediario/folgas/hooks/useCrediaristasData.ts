
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Crediarista } from "../types";

export function useCrediaristasData() {
  const { toast } = useToast();
  const [crediaristas, setCrediaristas] = useState<Crediarista[]>([]);
  const [isLoadingCrediaristas, setIsLoadingCrediaristas] = useState<boolean>(true);

  // Fetch crediaristas from database
  useEffect(() => {
    async function fetchCrediaristas() {
      setIsLoadingCrediaristas(true);
      try {
        // Fetch profiles with role "crediarista"
        const { data, error } = await supabase
          .from("profiles")
          .select("id, name, avatar_url")
          .eq("role", "crediarista");
          
        if (error) {
          console.error("Erro ao buscar crediaristas:", error);
          toast({
            title: "Erro ao carregar crediaristas",
            description: error.message,
            variant: "destructive",
          });
          return;
        }
        
        // Transform the data to match the Crediarista interface
        const formattedCrediaristas: Crediarista[] = data.map((profile) => ({
          id: profile.id,
          nome: profile.name,
          avatar: profile.avatar_url || undefined,
        }));
        
        setCrediaristas(formattedCrediaristas);
        console.log("Crediaristas carregados:", formattedCrediaristas.length);
      } catch (error) {
        console.error("Erro ao buscar crediaristas:", error);
        toast({
          title: "Erro ao carregar crediaristas",
          description: "Não foi possível carregar a lista de crediaristas.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingCrediaristas(false);
      }
    }
    
    fetchCrediaristas();
  }, [toast]);

  const getCrediaristaById = (id: string) => {
    const crediarista = crediaristas.find((c) => c.id === id);
    console.log(`Buscando crediarista ${id}:`, crediarista);
    return crediarista;
  };

  return {
    crediaristas,
    isLoadingCrediaristas,
    getCrediaristaById,
  };
}
