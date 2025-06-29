
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface CartazItem {
  id: string;
  title: string;
  file_url: string;
  file_type: 'pdf' | 'image';
  folder_id: string | null;
  position: number;
  created_by: string;
  created_at: string;
}

export function useCartazes(folderId: string | null) {
  const [cartazes, setCartazes] = useState<CartazItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCartazes = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('cartazes')
        .select('*')
        .order('position');
      
      if (folderId !== null) {
        query = query.eq('folder_id', folderId);
      } else {
        query = query.is('folder_id', null);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      const typedCartazes: CartazItem[] = (data || []).map(cartaz => ({
        id: cartaz.id,
        title: cartaz.title,
        file_url: cartaz.file_url,
        file_type: cartaz.file_type as 'pdf' | 'image',
        position: cartaz.position,
        folder_id: cartaz.folder_id,
        created_by: cartaz.created_by,
        created_at: cartaz.created_at,
      }));
      
      setCartazes(typedCartazes);
    } catch (error) {
      console.error('Error fetching cartazes:', error);
      setCartazes([]);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os cartazes",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [folderId]);
  
  useEffect(() => {
    fetchCartazes();
    
    const channel = supabase
      .channel(`cartazes-changes`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'cartazes'
      }, () => {
        fetchCartazes();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCartazes]);

  return { cartazes, setCartazes, isLoading, refetch: fetchCartazes };
}
