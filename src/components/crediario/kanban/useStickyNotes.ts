
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StickyNote } from './types';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/components/ui/use-toast';

interface CreateStickyNoteData {
  content: string;
  color: string;
  folderId?: string | null;
}

export function useStickyNotes(folderId?: string | null) {
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { profile } = useAuth();
  
  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('crediario_sticky_notes')
        .select('*')
        .order('updated_at', { ascending: false });
        
      // Se um folderId foi fornecido, filtra por pasta
      if (folderId === "sem-pasta") {
        query = query.is('folder_id', null);
      } else if (folderId && folderId !== "todas") {
        query = query.eq('folder_id', folderId);
      }
        
      const { data, error } = await query;
        
      if (error) {
        console.error('Error fetching sticky notes:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar notas",
          variant: "destructive"
        });
        return;
      }
      
      setNotes(data || []);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchNotes();
    
    // Set up realtime subscription
    const notesChannel = supabase
      .channel('sticky-notes-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'crediario_sticky_notes' }, 
        (payload) => {
          console.log('Realtime update received:', payload);
          
          // Se for uma nota sendo adicionada
          if (payload.eventType === 'INSERT') {
            const newNote = payload.new as StickyNote;
            
            // Verifica se deve incluir esta nota baseado no filtro de pasta
            const shouldInclude = 
              folderId === "todas" || 
              (folderId === "sem-pasta" && !newNote.folder_id) || 
              (folderId !== "todas" && folderId !== "sem-pasta" && newNote.folder_id === folderId);
              
            if (shouldInclude) {
              setNotes(prevNotes => [newNote, ...prevNotes]);
            }
          } 
          // Se for uma nota sendo atualizada
          else if (payload.eventType === 'UPDATE') {
            const updatedNote = payload.new as StickyNote;
            
            // Verificar se a nota ainda deve estar na visualização atual
            const shouldInclude = 
              folderId === "todas" || 
              (folderId === "sem-pasta" && !updatedNote.folder_id) || 
              (folderId !== "todas" && folderId !== "sem-pasta" && updatedNote.folder_id === folderId);
              
            if (shouldInclude) {
              // Atualizar a nota se ela estiver na visualização
              setNotes(prevNotes => 
                prevNotes.map(note => 
                  note.id === updatedNote.id ? updatedNote : note
                )
              );
            } else {
              // Remover a nota da visualização se ela não pertence mais à pasta atual
              setNotes(prevNotes => 
                prevNotes.filter(note => note.id !== updatedNote.id)
              );
            }
          } 
          // Se for uma nota sendo excluída
          else if (payload.eventType === 'DELETE') {
            const deletedNoteId = payload.old.id;
            setNotes(prevNotes => 
              prevNotes.filter(note => note.id !== deletedNoteId)
            );
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(notesChannel);
    };
  }, [folderId]);
  
  const addNote = async (noteData: CreateStickyNoteData) => {
    if (!profile) {
      toast({
        title: "Erro",
        description: "Você precisa estar autenticado para adicionar notas",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('crediario_sticky_notes')
        .insert({
          content: noteData.content,
          color: noteData.color,
          folder_id: noteData.folderId,
          created_by: profile.id,
        });
        
      if (error) {
        console.error('Error adding sticky note:', error);
        toast({
          title: "Erro",
          description: "Erro ao adicionar nota",
          variant: "destructive"
        });
        return;
      }
      
      // O canal de realtime vai cuidar da atualização
      
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado",
        variant: "destructive"
      });
    }
  };
  
  const updateNote = async (noteId: string, content: string, folderId?: string | null) => {
    try {
      const updateData: any = { 
        content,
        updated_at: new Date().toISOString(),
      };
      
      if (folderId !== undefined) {
        updateData.folder_id = folderId;
      }
      
      const { error } = await supabase
        .from('crediario_sticky_notes')
        .update(updateData)
        .eq('id', noteId);
        
      if (error) {
        console.error('Error updating sticky note:', error);
        toast({
          title: "Erro",
          description: "Erro ao atualizar nota",
          variant: "destructive"
        });
        return;
      }
      
      // Local state update for immediate feedback
      setNotes(prevNotes => prevNotes.map(note => 
        note.id === noteId 
          ? { ...note, content, updated_at: new Date().toISOString(), folder_id: folderId ?? note.folder_id } 
          : note
      ));
      
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado",
        variant: "destructive"
      });
    }
  };
  
  const deleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('crediario_sticky_notes')
        .delete()
        .eq('id', noteId);
        
      if (error) {
        console.error('Error deleting sticky note:', error);
        toast({
          title: "Erro",
          description: "Erro ao excluir nota",
          variant: "destructive"
        });
        return;
      }
      
      // Local state update for immediate feedback
      setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
      
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado",
        variant: "destructive"
      });
    }
  };
  
  return {
    notes,
    isLoading,
    addNote,
    updateNote,
    deleteNote,
  };
}
