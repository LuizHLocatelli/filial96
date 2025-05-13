
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
      
      setColumns([...columns, data]);
      
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

  return { addColumn };
}
