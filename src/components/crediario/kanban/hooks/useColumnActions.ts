
import { supabase } from '@/integrations/supabase/client';
import { Column } from '../types';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export function useColumnActions(columns: Column[], setColumns: React.Dispatch<React.SetStateAction<Column[]>>) {
  const { profile } = useAuth();

  // Add a new column
  const addColumn = async (name: string) => {
    if (!profile) return null;
    
    try {
      const boardId = columns[0]?.board_id;
      if (!boardId) {
        toast.error('Nenhum quadro disponível');
        return null;
      }
      
      const newPosition = columns.length;
      
      const { data, error } = await supabase
        .from('crediario_kanban_columns')
        .insert({
          board_id: boardId,
          name,
          position: newPosition,
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error adding column:', error);
        toast.error('Erro ao adicionar coluna');
        return null;
      }
      
      // Add missing fields to match our Column type
      const newColumn: Column = {
        ...data,
        created_by: profile.id,
        updated_at: data.created_at
      };
      
      // We don't actually use setColumns here since we're reloading via realtime
      
      // Log activity
      await supabase.from('crediario_kanban_activities').insert({
        board_id: boardId,
        action: 'column_created',
        details: { column_name: name },
        created_by: profile.id,
      });
      
      return data;
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Ocorreu um erro inesperado');
      return null;
    }
  };

  // Edit an existing column
  const editColumn = async (columnId: string, name: string) => {
    if (!profile) return false;
    
    try {
      const { error } = await supabase
        .from('crediario_kanban_columns')
        .update({ 
          name,
          updated_at: new Date().toISOString()
        })
        .eq('id', columnId);
        
      if (error) {
        console.error('Error updating column:', error);
        toast.error('Erro ao atualizar coluna');
        return false;
      }
      
      toast.success('Coluna atualizada com sucesso');
      
      // Log activity
      const column = columns.find(col => col.id === columnId);
      if (column) {
        await supabase.from('crediario_kanban_activities').insert({
          board_id: column.board_id,
          column_id: columnId,
          action: 'column_updated',
          details: { column_name: name },
          created_by: profile.id,
        });
      }
      
      return true;
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Ocorreu um erro inesperado');
      return false;
    }
  };

  // Delete a column
  const deleteColumn = async (columnId: string) => {
    if (!profile) return false;
    
    try {
      // First check if column has cards
      const { data: cards, error: countError } = await supabase
        .from('crediario_kanban_cards')
        .select('id')
        .eq('column_id', columnId);
        
      if (countError) {
        console.error('Error checking column cards:', countError);
        toast.error('Erro ao verificar cartões da coluna');
        return false;
      }
      
      if (cards && cards.length > 0) {
        toast.error(`Não é possível excluir a coluna. Ela contém ${cards.length} cartões.`);
        return false;
      }
      
      // Delete the column if it has no cards
      const column = columns.find(col => col.id === columnId);
      if (!column) {
        toast.error('Coluna não encontrada');
        return false;
      }
      
      const { error } = await supabase
        .from('crediario_kanban_columns')
        .delete()
        .eq('id', columnId);
        
      if (error) {
        console.error('Error deleting column:', error);
        toast.error('Erro ao excluir coluna');
        return false;
      }
      
      toast.success('Coluna excluída com sucesso');
      
      // Log activity
      await supabase.from('crediario_kanban_activities').insert({
        board_id: column.board_id,
        action: 'column_deleted',
        details: { column_name: column.name },
        created_by: profile.id,
      });
      
      return true;
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Ocorreu um erro inesperado');
      return false;
    }
  };

  return { addColumn, editColumn, deleteColumn };
}
