
import { Database } from '@/integrations/supabase/types';

export interface Board {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Column {
  id: string;
  board_id: string;
  name: string;
  position: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TaskCard {
  id: string;
  column_id: string;
  title: string;
  description?: string;
  position: number;
  priority: 'baixa' | 'media' | 'alta';
  assignee_id?: string;
  due_date?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  background_color?: string; // Field for card background color
}

export interface CreateCardData {
  title: string;
  description?: string;
  column_id: string;
  priority: string;
  assignee_id?: string;
  due_date?: string;
  background_color?: string;
}

export interface MoveCardData {
  cardId: string;
  sourceColumnId: string;
  destColumnId: string;
  newPosition: number;
}

export interface BoardActivity {
  id: string;
  board_id: string;
  card_id?: string;
  column_id?: string;
  action: 'card_created' | 'card_moved' | 'card_updated' | 'card_deleted' | 'column_created' | 'column_updated' | 'column_deleted';
  details: Record<string, any>;
  created_by: string;
  created_at: string;
}

export interface Comment {
  id: string;
  card_id: string;
  content: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
  user?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

export interface CreateCommentData {
  card_id: string;
  content: string;
}

export interface StickyNote {
  id: string;
  content: string;
  color: string;
  folder_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface NoteFolder {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
  position?: number;
}

export interface CreateFolderData {
  name: string;
}

// Helper to validate priority
export function validatePriority(priority: any): 'baixa' | 'media' | 'alta' {
  if (priority === 'baixa' || priority === 'media' || priority === 'alta') {
    return priority;
  }
  return 'media'; // Default to media if invalid
}
