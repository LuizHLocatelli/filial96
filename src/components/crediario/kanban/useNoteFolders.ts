
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { NoteFolder, CreateFolderData } from './types';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export function useNoteFolders() {
  const [folders, setFolders] = useState<NoteFolder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { profile } = useAuth();
  
  // Fetch all folders
  const fetchFolders = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('note_folders')
        .select('*')
        .order('position', { ascending: true });
        
      if (error) {
        console.error('Error fetching folders:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar pastas",
          variant: "destructive"
        });
        return;
      }
      
      // Add updated_at if it doesn't exist
      const foldersWithUpdated: NoteFolder[] = data.map(folder => ({
        ...folder,
        updated_at: folder.updated_at || folder.created_at
      }));
      
      setFolders(foldersWithUpdated);
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
    fetchFolders();
    
    // Set up realtime subscription
    const foldersChannel = supabase
      .channel('note-folders-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'note_folders' }, 
        () => fetchFolders()
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(foldersChannel);
    };
  }, []);
  
  // Add a new folder
  const addFolder = async (folderData: CreateFolderData) => {
    if (!profile) {
      toast({
        title: "Erro",
        description: "Você precisa estar autenticado para adicionar pastas",
        variant: "destructive"
      });
      return null;
    }
    
    try {
      // Get the highest position
      const maxPosition = folders.length > 0 
        ? Math.max(...folders.map(f => f.position || 0)) + 1 
        : 0;
      
      const { data, error } = await supabase
        .from('note_folders')
        .insert({
          name: folderData.name,
          position: maxPosition,
          created_by: profile.id
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error adding folder:', error);
        toast({
          title: "Erro",
          description: "Erro ao adicionar pasta",
          variant: "destructive"
        });
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado",
        variant: "destructive"
      });
      return null;
    }
  };
  
  // Update a folder
  const updateFolder = async (folderId: string, name: string) => {
    try {
      const { error } = await supabase
        .from('note_folders')
        .update({ 
          name,
          updated_at: new Date().toISOString()
        })
        .eq('id', folderId);
        
      if (error) {
        console.error('Error updating folder:', error);
        toast({
          title: "Erro",
          description: "Erro ao atualizar pasta",
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado",
        variant: "destructive"
      });
      return false;
    }
  };
  
  // Delete a folder
  const deleteFolder = async (folderId: string) => {
    try {
      // First update any notes in this folder to have no folder
      const { error: updateError } = await supabase
        .from('crediario_sticky_notes')
        .update({ folder_id: null })
        .eq('folder_id', folderId);
        
      if (updateError) {
        console.error('Error updating notes:', updateError);
        toast({
          title: "Erro",
          description: "Erro ao atualizar notas",
          variant: "destructive"
        });
        return false;
      }
      
      // Then delete the folder
      const { error } = await supabase
        .from('note_folders')
        .delete()
        .eq('id', folderId);
        
      if (error) {
        console.error('Error deleting folder:', error);
        toast({
          title: "Erro",
          description: "Erro ao excluir pasta",
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado",
        variant: "destructive"
      });
      return false;
    }
  };
  
  return {
    folders,
    isLoading,
    addFolder,
    updateFolder,
    deleteFolder
  };
}
