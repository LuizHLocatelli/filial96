
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Comment } from './types';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth';

interface CreateCommentData {
  card_id: string;
  content: string;
}

export function useComments(cardId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { profile } = useAuth();
  
  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('crediario_kanban_comments')
        .select(`
          *,
          user:created_by(
            id, 
            name, 
            avatar_url
          )
        `)
        .eq('card_id', cardId)
        .order('created_at', { ascending: true });
        
      if (error) {
        console.error('Error fetching comments:', error);
        toast.error('Erro ao carregar comentários');
        return;
      }
      
      setComments(data);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Ocorreu um erro inesperado');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchComments();
    
    // Set up realtime subscription for comments
    const commentsChannel = supabase
      .channel('comments-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'crediario_kanban_comments', filter: `card_id=eq.${cardId}` }, 
        () => fetchComments()
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(commentsChannel);
    };
  }, [cardId]);
  
  const addComment = async (commentData: CreateCommentData) => {
    if (!profile) {
      toast.error('Você precisa estar autenticado para adicionar comentários');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('crediario_kanban_comments')
        .insert({
          card_id: commentData.card_id,
          content: commentData.content,
          created_by: profile.id,
        });
        
      if (error) {
        console.error('Error adding comment:', error);
        toast.error('Erro ao adicionar comentário');
        return;
      }
      
      // No need to update local state as the realtime subscription will handle it
      
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Ocorreu um erro inesperado');
    }
  };
  
  return { comments, isLoading, addComment };
}
