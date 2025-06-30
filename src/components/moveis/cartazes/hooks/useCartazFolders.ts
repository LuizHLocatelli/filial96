
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface CartazFolder {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export function useCartazFolders() {
  const [folders, setFolders] = useState<CartazFolder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFolders = async () => {
    try {
      const { data, error } = await supabase
        .from('cartaz_folders')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      setFolders(data || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as pastas",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders();
    
    const channel = supabase
      .channel('cartaz-folders-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'cartaz_folders'
      }, () => {
        fetchFolders();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { folders, isLoading, refetch: fetchFolders };
}
