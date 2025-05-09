
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface Folder {
  id: string;
  name: string;
  sector: "furniture" | "fashion";
}

export function useFolders(sector: "furniture" | "fashion") {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFolders = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('card_folders')
          .select('*')
          .eq('sector', sector)
          .order('name');
        
        if (error) throw error;
        
        setFolders(data as Folder[]);
        setError(null);
      } catch (error) {
        console.error('Error fetching folders:', error);
        setError("Failed to load folders");
        toast({
          title: "Erro",
          description: "Falha ao carregar pastas",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFolders();
    
    // Setup real-time subscription for folder updates
    const channel = supabase
      .channel('folders-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'card_folders',
        filter: `sector=eq.${sector}` 
      }, () => {
        fetchFolders();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [sector]);

  return { folders, isLoading, error };
}
