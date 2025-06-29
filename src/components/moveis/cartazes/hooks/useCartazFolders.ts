
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface CartazFolderItem {
  id: string;
  name: string;
}

export function useCartazFolders() {
  const [folders, setFolders] = useState<CartazFolderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFolders = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('cartaz_folders')
          .select('*')
          .order('name');
        
        if (error) throw error;
        
        setFolders((data || []) as CartazFolderItem[]);
        setError(null);
      } catch (error) {
        console.error('Error fetching folders:', error);
        setError("Failed to load folders");
        setFolders([]);
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

  return { folders, isLoading, error };
}
