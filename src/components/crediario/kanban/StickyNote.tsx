
import { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, Save, X, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';

interface StickyNoteProps {
  note: {
    id: string;
    content: string;
    color: string;
    updated_at: string;
  };
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
}

export function StickyNote({ note, onUpdate, onDelete }: StickyNoteProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(note.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.selectionStart = textareaRef.current.value.length;
    }
  }, [isEditing]);

  const handleSave = () => {
    if (content.trim()) {
      onUpdate(note.id, content);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setContent(note.content);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <Card 
      className="overflow-hidden border-t-4" 
      style={{ borderTopColor: note.color }}
    >
      <CardContent className="p-3 space-y-2">
        {isEditing ? (
          <>
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[100px] text-sm resize-none"
              placeholder="Digite sua nota aqui..."
            />
            <div className="flex justify-end space-x-2">
              <Button size="sm" variant="outline" onClick={handleCancel}>
                <X className="h-3.5 w-3.5 mr-1" />
                Cancelar
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="h-3.5 w-3.5 mr-1" />
                Salvar
              </Button>
            </div>
          </>
        ) : (
          <>
            <div 
              className="text-sm min-h-[100px] whitespace-pre-wrap"
              style={{ wordBreak: 'break-word' }}
            >
              {note.content}
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {formatDistanceToNow(new Date(note.updated_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </div>
              <div className="space-x-1">
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
                  <Edit className="h-3.5 w-3.5" />
                  <span className="sr-only">Editar</span>
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDelete(note.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="sr-only">Excluir</span>
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
