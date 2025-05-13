
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/auth';
import { useComments } from './useComments';
import { Loader2 } from 'lucide-react';

interface CardCommentsProps {
  cardId: string;
}

export function CardComments({ cardId }: CardCommentsProps) {
  const [comment, setComment] = useState('');
  const { profile } = useAuth();
  const { comments, isLoading, addComment } = useComments(cardId);

  const handleAddComment = () => {
    if (!comment.trim() || !profile) return;
    
    addComment({
      card_id: cardId,
      content: comment.trim(),
    });
    
    setComment('');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="animate-spin h-5 w-5 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Lista de comentários */}
      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground italic text-center py-2">
            Nenhum comentário ainda. Seja o primeiro a comentar!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/20 text-xs">
                  {comment.user ? getInitials(comment.user.name) : '??'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {comment.user ? comment.user.name : 'Usuário desconhecido'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                </div>
                <p className="text-sm mt-0.5">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input de novo comentário */}
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary/20 text-xs">
            {profile ? getInitials(profile.name) : '??'}
          </AvatarFallback>
        </Avatar>
        <Input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Escreva um comentário..."
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleAddComment();
            }
          }}
        />
        <Button size="sm" onClick={handleAddComment} disabled={!comment.trim()}>
          Enviar
        </Button>
      </div>
    </div>
  );
}
