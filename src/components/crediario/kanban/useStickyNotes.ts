
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StickyNote } from './types';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

interface CreateStickyNoteData {
  content: string;
  color: string;
}

export function useStickyNotes() {
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { profile } = useAuth();
  
  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('crediario_sticky_notes')
        .select('*')
        .order('updated_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching sticky notes:', error);
        toast.error('Erro ao carregar notas');
        return;
      }
      
      setNotes(data);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Ocorreu um erro inesperado');
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
        () => fetchNotes()
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(notesChannel);
    };
  }, []);
  
  const addNote = async (noteData: CreateStickyNoteData) => {
    if (!profile) {
      toast.error('Você precisa estar autenticado para adicionar notas');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('crediario_sticky_notes')
        .insert({
          content: noteData.content,
          color: noteData.color,
          created_by: profile.id,
        });
        
      if (error) {
        console.error('Error adding sticky note:', error);
        toast.error('Erro ao adicionar nota');
        return;
      }
      
      // Realtime will handle the update
      
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Ocorreu um erro inesperado');
    }
  };
  
  const updateNote = async (noteId: string, content: string) => {
    try {
      const { error } = await supabase
        .from('crediario_sticky_notes')
        .update({ 
          content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', noteId);
        
      if (error) {
        console.error('Error updating sticky note:', error);
        toast.error('Erro ao atualizar nota');
        return;
      }
      
      // Local state update for immediate feedback
      setNotes(notes.map(note => 
        note.id === noteId 
          ? { ...note, content, updated_at: new Date().toISOString() } 
          : note
      ));
      
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Ocorreu um erro inesperado');
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
        toast.error('Erro ao excluir nota');
        return;
      }
      
      // Local state update for immediate feedback
      setNotes(notes.filter(note => note.id !== noteId));
      
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Ocorreu um erro inesperado');
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
