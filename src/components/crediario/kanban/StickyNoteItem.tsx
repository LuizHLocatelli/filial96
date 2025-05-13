
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, FolderClosed } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { StickyNote, NoteFolder } from './types';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface StickyNoteItemProps {
  note: StickyNote;
  folders: NoteFolder[];
  onUpdate: (id: string, content: string, folderId?: string | null) => Promise<void>;
  onMoveToFolder: (id: string, folderId: string | null) => void;
  onDelete: (id: string) => void;
}

export function StickyNoteItem({ note, folders, onUpdate, onMoveToFolder, onDelete }: StickyNoteItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(note.content);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdate = async () => {
    if (content.trim() === note.content) {
      setIsEditing(false);
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdate(note.id, content);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating sticky note:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleUpdate();
    }
    if (e.key === 'Escape') {
      setContent(note.content);
      setIsEditing(false);
    }
  };

  // Determina a cor do texto com base na cor de fundo para garantir contraste
  const getTextColor = () => {
    const colorMap: Record<string, string> = {
      '#FEF7CD': '#5B4D00', // amarelo -> marrom escuro
      '#F2FCE2': '#1A4D00', // verde claro -> verde escuro
      '#E5DEFF': '#4A1D95', // roxo claro -> roxo escuro
      '#FFE9E7': '#7A1100', // vermelho claro -> vermelho escuro
      '#E5F6FF': '#004A77', // azul claro -> azul escuro
      '#FEC6A1': '#803400', // laranja claro -> marrom
      '#FFDEE2': '#9C1C36', // rosa claro -> rosa escuro
      '#FDE1D3': '#7A3A19', // pêssego -> marrom médio
      '#D3E4FD': '#002A66', // azul claro alt -> azul marinho
      '#F1F0FB': '#303030', // cinza claro -> cinza escuro
    };
    
    return colorMap[note.color] || '#000000';
  };

  const hasFolder = note.folder_id !== null;
  const folder = folders.find(f => f.id === note.folder_id);

  return (
    <Card 
      className="overflow-hidden flex flex-col" 
      style={{ backgroundColor: note.color, color: getTextColor() }}
    >
      {isEditing ? (
        <div className="flex flex-col h-full">
          <div className="flex-grow p-3">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-full h-full min-h-[100px] p-0 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
              style={{ 
                backgroundColor: 'transparent', 
                color: getTextColor() 
              }}
            />
          </div>
          <div className="flex justify-end p-3 pt-0 gap-2 mt-auto">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setContent(note.content);
                setIsEditing(false);
              }}
              disabled={isSubmitting}
              className="text-xs"
              style={{ color: getTextColor() }}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleUpdate}
              disabled={isSubmitting}
              className="text-xs"
              style={{ color: getTextColor(), borderColor: getTextColor() }}
              variant="outline"
            >
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="p-3 pb-0 flex justify-between items-start">
            {hasFolder && folder && (
              <div className="flex items-center text-xs gap-1 mb-2">
                <FolderClosed className="h-3 w-3" />
                <span>{folder.name}</span>
              </div>
            )}
            <div className={`ml-auto ${hasFolder ? '' : 'w-full'}`}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Abrir menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span className="w-full">Mover para pasta</span>
                  </DropdownMenuItem>
                  {folders.map(folder => (
                    <DropdownMenuItem
                      key={folder.id}
                      className="pl-6"
                      onClick={() => onMoveToFolder(note.id, folder.id)}
                    >
                      {folder.name}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem
                    className="pl-6"
                    onClick={() => onMoveToFolder(note.id, null)}
                  >
                    Remover da pasta
                  </DropdownMenuItem>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onSelect={(e) => e.preventDefault()}
                      >
                        Excluir
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir nota</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. Esta nota será permanentemente excluída.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(note.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div 
            className="p-3 whitespace-pre-wrap flex-grow cursor-pointer"
            onClick={() => setIsEditing(true)}
            style={{ color: getTextColor() }}
          >
            {note.content}
          </div>
          <div className="p-3 pt-0 text-xs opacity-70" style={{ color: getTextColor() }}>
            {note.updated_at && formatDistanceToNow(new Date(note.updated_at), { addSuffix: true, locale: ptBR })}
          </div>
        </>
      )}
    </Card>
  );
}
