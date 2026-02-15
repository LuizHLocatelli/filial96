
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { CardItem } from "./useCardOperations";

export function useCards(sector: "furniture" | "fashion" | "loan" | "service", folderId: string | null) {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCards = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('promotional_cards')
        .select('id, title, image_url, sector, position, folder_id, created_by, created_at, code, start_date, end_date, aspect_ratio')
        .eq('sector', sector)
        .order('position');
      
      if (folderId !== null) {
        query = query.eq('folder_id', folderId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Verificação de segurança para garantir que data não seja null/undefined
      const typedCards: CardItem[] = (data || []).map(card => ({
        id: card.id,
        title: card.title,
        image_url: card.image_url,
        sector: card.sector as "furniture" | "fashion" | "loan" | "service",
        position: card.position,
        folder_id: card.folder_id,
        created_by: card.created_by,
        created_at: card.created_at,
        code: card.code || null,
        start_date: card.start_date || null,
        end_date: card.end_date || null,
        aspect_ratio: card.aspect_ratio as "1:1" | "3:4" | "4:5" || "4:5",
      }));
      
      setCards(typedCards);
    } catch (error) {
      console.error('Error fetching cards:', error);
      setCards([]); // Garantir que sempre seja um array
      toast({
        title: "Erro",
        description: "Não foi possível carregar os cards promocionais",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [sector, folderId]);
  
  useEffect(() => {
    fetchCards();
    
    const channel = supabase
      .channel(`promotional-cards-changes-${sector}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'promotional_cards',
        filter: `sector=eq.${sector}`
      }, () => {
        fetchCards();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCards, sector]);

  return { cards, setCards, isLoading, refetch: fetchCards };
}
