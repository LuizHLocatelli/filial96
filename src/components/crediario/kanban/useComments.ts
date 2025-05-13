
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Comment, CreateCommentData } from './types';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth';

export function useComments(cardId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { profile } = useAuth();
  
  const fetchComments = async () => {
    setIsLoading(true);
    try {
      // First get the comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('crediario_kanban_comments')
        .select('*')
        .eq('card_id', cardId)
        .order('created_at', { ascending: true });
        
      if (commentsError) {
        console.error('Error fetching comments:', commentsError);
        toast.error('Erro ao carregar comentários');
        return;
      }

      // Then get the profiles for those comments
      const userIds = commentsData
        .filter(comment => comment.created_by)
        .map(comment => comment.created_by);
      
      if (userIds.length > 0) {
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('id, name, avatar_url')
          .in('id', userIds);
        
        if (usersError) {
          console.error('Error fetching users:', usersError);
        }
        
        // Map user data to comments
        const commentsWithUsers: Comment[] = commentsData.map(comment => {
          const user = usersData?.find(user => user.id === comment.created_by);
          return {
            ...comment,
            updated_at: comment.updated_at || comment.created_at || new Date().toISOString(),
            user: user ? {
              id: user.id,
              name: user.name,
              avatar_url: user.avatar_url
            } : undefined
          };
        });
        
        setComments(commentsWithUsers);
      } else {
        // Add the updated_at field if missing
        const formattedComments: Comment[] = commentsData.map(comment => ({
          ...comment,
          updated_at: comment.updated_at || comment.created_at || new Date().toISOString()
        }));
        setComments(formattedComments);
      }
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
