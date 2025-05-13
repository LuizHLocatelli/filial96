
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { NoteFolder, CreateFolderData } from './types';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/components/ui/use-toast';

export function useNoteFolders() {
  const [folders, setFolders] = useState<NoteFolder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { profile } = useAuth();
  
  const fetchFolders = async () => {
    setIsLoading(true);
    try {
      // Usando 'notes-folders' como identificador string em vez de tentar usar 'notes' como UUID
      const { data, error } = await supabase
        .from('crediario_kanban_columns')
        .select('id, name, created_at')
        .eq('board_id', 'notes-folders')
        .order('name', { ascending: true });
        
      if (error) {
        console.error('Error fetching note folders:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar pastas",
          variant: "destructive"
        });
        return;
      }
      
      // Converter os dados para corresponder ao tipo NoteFolder
      const folderData: NoteFolder[] = data ? data.map(item => ({
        id: item.id,
        name: item.name,
        created_at: item.created_at,
        created_by: null // Como created_by pode não estar disponível na tabela
      })) : [];
      
      setFolders(folderData);
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
    
    // Configurar inscrição em tempo real
    const foldersChannel = supabase
      .channel('note-folders-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'crediario_kanban_columns', filter: `board_id=eq.notes-folders` }, 
        (payload) => {
          console.log('Realtime folder update received:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newFolder = payload.new as any;
            if (newFolder.board_id === 'notes-folders') {
              const folderData: NoteFolder = {
                id: newFolder.id,
                name: newFolder.name,
                created_at: newFolder.created_at,
                created_by: newFolder.created_by || null
              };
              setFolders(prevFolders => 
                [...prevFolders, folderData].sort((a, b) => a.name.localeCompare(b.name))
              );
            }
          } 
          else if (payload.eventType === 'UPDATE') {
            const updatedFolder = payload.new as any;
            if (updatedFolder.board_id === 'notes-folders') {
              const folderData: NoteFolder = {
                id: updatedFolder.id,
                name: updatedFolder.name,
                created_at: updatedFolder.created_at,
                created_by: updatedFolder.created_by || null
              };
              setFolders(prevFolders => 
                prevFolders.map(folder => 
                  folder.id === folderData.id ? folderData : folder
                ).sort((a, b) => a.name.localeCompare(b.name))
              );
            }
          } 
          else if (payload.eventType === 'DELETE') {
            const deletedFolderId = payload.old.id;
            setFolders(prevFolders => 
              prevFolders.filter(folder => folder.id !== deletedFolderId)
            );
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(foldersChannel);
    };
  }, []);
  
  const addFolder = async (folderData: CreateFolderData) => {
    if (!profile) {
      toast({
        title: "Erro",
        description: "Você precisa estar autenticado para adicionar pastas",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('crediario_kanban_columns')
        .insert({
          name: folderData.name,
          board_id: 'notes-folders', // Usando 'notes-folders' como identificador string
          position: 0, // Posição padrão
        })
        .select('id')
        .single();
        
      if (error) {
        console.error('Error adding note folder:', error);
        toast({
          title: "Erro",
          description: "Erro ao adicionar pasta",
          variant: "destructive"
        });
        return;
      }
      
      // O canal de realtime vai cuidar da atualização
      toast({
        title: "Sucesso",
        description: "Pasta criada com sucesso",
      });
      
      return data;
      
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado",
        variant: "destructive"
      });
    }
  };
  
  const updateFolder = async (folderId: string, name: string) => {
    try {
      const { error } = await supabase
        .from('crediario_kanban_columns')
        .update({ name })
        .eq('id', folderId)
        .eq('board_id', 'notes-folders');
        
      if (error) {
        console.error('Error updating note folder:', error);
        toast({
          title: "Erro",
          description: "Erro ao atualizar pasta",
          variant: "destructive"
        });
        return;
      }
      
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado",
        variant: "destructive"
      });
    }
  };
  
  const deleteFolder = async (folderId: string) => {
    try {
      // Verificar se há notas nessa pasta primeiro
      const { data: notes, error: countError } = await supabase
        .from('crediario_sticky_notes')
        .select('id')
        .eq('folder_id', folderId);
      
      if (countError) {
        console.error('Error checking notes in folder:', countError);
        toast({
          title: "Erro",
          description: "Erro ao verificar notas na pasta",
          variant: "destructive"
        });
        return;
      }
      
      if (notes && notes.length > 0) {
        toast({
          title: "Atenção",
          description: `Esta pasta contém ${notes.length} nota(s). Mova ou exclua as notas antes de excluir a pasta.`,
          variant: "destructive"
        });
        return;
      }
      
      // Se não houver notas, pode excluir a pasta
      const { error } = await supabase
        .from('crediario_kanban_columns')
        .delete()
        .eq('id', folderId)
        .eq('board_id', 'notes-folders');
        
      if (error) {
        console.error('Error deleting note folder:', error);
        toast({
          title: "Erro",
          description: "Erro ao excluir pasta",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Sucesso",
        description: "Pasta excluída com sucesso"
      });
      
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
    folders,
    isLoading,
    addFolder,
    updateFolder,
    deleteFolder,
  };
}
