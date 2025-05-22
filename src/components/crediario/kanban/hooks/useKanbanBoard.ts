
import { useState, useEffect } from 'react';
import { useBoardData } from './useBoardData';
import { useColumnActions } from './useColumnActions';
import { useCardActions } from './useCardActions';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

export function useKanbanBoard() {
  const { board, columns, cards, isLoading, setCards, setColumns } = useBoardData();
  const { addColumn, editColumn, deleteColumn } = useColumnActions(columns, setColumns);
  const { addCard, deleteCard, updateCard, moveCard } = useCardActions(cards, setCards);
  const { profile } = useAuth();
  
  // Ensure fixed columns exist (A Fazer, Fazendo, Feita)
  useEffect(() => {
    const ensureFixedColumns = async () => {
      if (board && columns && profile) {
        const requiredColumns = [
          { name: "A Fazer", position: 0 },
          { name: "Fazendo", position: 1 },
          { name: "Feita", position: 2 }
        ];
        
        // Check which columns need to be created
        for (const col of requiredColumns) {
          const existingColumn = columns.find(c => c.name === col.name);
          
          if (!existingColumn) {
            try {
              console.log(`Creating missing column: ${col.name}`);
              
              // Create the missing column
              const { data, error } = await supabase
                .from('crediario_kanban_columns')
                .insert({
                  name: col.name,
                  board_id: board.id,
                  position: col.position,
                  created_by: profile.id
                })
                .select()
                .single();
                
              if (error) {
                throw error;
              }
              
              // Add the new column to state
              if (data) {
                setColumns(prev => [...prev, data]);
              }
            } catch (error) {
              console.error(`Error creating column ${col.name}:`, error);
            }
          }
        }
      }
    };
    
    ensureFixedColumns();
  }, [board, columns, profile, setColumns]);
  
  return {
    board,
    columns,
    cards,
    isLoading,
    setCards,
    addColumn,
    editColumn,
    deleteColumn,
    addCard,
    deleteCard,
    updateCard,
    moveCard
  };
}
