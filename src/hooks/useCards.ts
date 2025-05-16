
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { CardItem } from "./useCardOperations";

export function useCards(sector: "furniture" | "fashion" | "loan" | "service", folderId: string | null) {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCards = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from('promotional_cards')
          .select('*')
          .eq('sector', sector)
          .order('position');
        
        if (folderId !== null) {
          query = query.eq('folder_id', folderId);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        // Ensure all fields from CardItem are present in the data
        const typedCards: CardItem[] = data.map(card => ({
          id: card.id,
          title: card.title,
          image_url: card.image_url,
          sector: card.sector as "furniture" | "fashion" | "loan" | "service",
          position: card.position,
          folder_id: card.folder_id,
          created_by: card.created_by,
          created_at: card.created_at,
          code: card.code || null,
          promotion_date: card.promotion_date
        }));
        
        setCards(typedCards);
      } catch (error) {
        console.error('Error fetching cards:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os cards promocionais",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCards();
    
    // Setup real-time subscription for card updates
    const channel = supabase
      .channel('promotional-cards-changes')
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
  }, [sector, folderId]);

  return { cards, setCards, isLoading };
}
