
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PromotionalCard } from "@/components/promotional-cards/PromotionalCard";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface CardItem {
  id: string;
  title: string;
  image_url: string;
  folder_id: string | null;
  position: number;
}

interface CardGalleryProps {
  sector: "furniture" | "fashion";
  folderId: string | null;
}

export function CardGallery({ sector, folderId }: CardGalleryProps) {
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
        
        setCards(data as CardItem[]);
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

  const handleDeleteCard = async (id: string) => {
    try {
      // First, get the card to find its image URL
      const { data: cardData, error: cardError } = await supabase
        .from('promotional_cards')
        .select('image_url')
        .eq('id', id)
        .single();
      
      if (cardError) throw cardError;
      
      // Delete the card from the database
      const { error: deleteError } = await supabase
        .from('promotional_cards')
        .delete()
        .eq('id', id);
      
      if (deleteError) throw deleteError;
      
      // Extract file path from image URL
      const imageUrl = cardData.image_url;
      const filePath = imageUrl.split('/').slice(-2).join('/');
      
      // Delete the image from storage
      if (filePath) {
        const { error: storageError } = await supabase
          .storage
          .from('promotional_cards')
          .remove([filePath]);
        
        if (storageError) {
          console.error('Error removing image from storage:', storageError);
        }
      }
      
      toast({
        title: "Sucesso",
        description: "Card promocional excluído com sucesso"
      });
      
      // Update local state
      setCards(cards.filter(card => card.id !== id));
    } catch (error) {
      console.error('Error deleting card:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o card promocional",
        variant: "destructive"
      });
    }
  };

  const handleMoveToFolder = async (cardId: string, newFolderId: string | null) => {
    try {
      const { error } = await supabase
        .from('promotional_cards')
        .update({ folder_id: newFolderId })
        .eq('id', cardId);
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: newFolderId ? "Card movido para a pasta com sucesso" : "Card removido da pasta com sucesso"
      });
      
      // Update local state to reflect the change
      setCards(cards.map(card => 
        card.id === cardId 
          ? {...card, folder_id: newFolderId}
          : card
      ));
    } catch (error) {
      console.error('Error moving card to folder:', error);
      toast({
        title: "Erro",
        description: "Não foi possível mover o card",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-40 text-center p-6">
          <p className="text-muted-foreground mb-4">
            {folderId 
              ? "Nenhum card promocional nesta pasta." 
              : "Nenhum card promocional encontrado para este setor."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {cards.map(card => (
        <PromotionalCard
          key={card.id}
          id={card.id}
          title={card.title}
          imageUrl={card.image_url}
          folderId={card.folder_id}
          onDelete={() => handleDeleteCard(card.id)}
          onMoveToFolder={handleMoveToFolder}
          sector={sector}
        />
      ))}
    </div>
  );
}
