
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
  month: string | null;
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
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const typedCartazes: CartazItem[] = (data || []).map((cartaz: any) => ({
        id: String(cartaz.id),
        title: String(cartaz.title),
        file_url: String(cartaz.file_url),
        file_type: (cartaz.file_type || 'image') as 'pdf' | 'image',
        position: Number(cartaz.position),
        folder_id: cartaz.folder_id ? String(cartaz.folder_id) : null,
        created_by: String(cartaz.created_by),
        created_at: String(cartaz.created_at),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        month: cartaz.month ? String(cartaz.month as any) : null,
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
