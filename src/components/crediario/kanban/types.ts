
export interface Board {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  created_by?: string;
}

export interface Column {
  id: string;
  board_id: string;
  name: string;
  position: number;
  created_at: string;
}

export interface TaskCard {
  id: string;
  column_id: string;
  title: string;
  description?: string;
  priority: 'baixa' | 'media' | 'alta';
  assignee_id?: string;
  due_date?: string;
  position: number;
  created_at: string;
  created_by?: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface CardTag {
  id: string;
  card_id: string;
  tag_id: string;
}

export interface Comment {
  id: string;
  card_id: string;
  content: string;
  created_at: string;
  created_by?: string;
  user?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

export interface Activity {
  id: string;
  board_id: string;
  card_id?: string;
  action: string;
  details?: any;
  created_at: string;
  created_by?: string;
  user?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

export interface StickyNote {
  id: string;
  content: string;
  color: string;
  position_x?: number;
  position_y?: number;
  created_at: string;
  created_by?: string;
  updated_at: string;
  folder_id?: string | null;
}

export interface NoteFolder {
  id: string;
  name: string;
  created_at: string;
  created_by?: string;
}

export interface CreateCardData {
  title: string;
  description?: string;
  priority: string;
  column_id: string;
  assignee_id?: string;
  due_date?: string;
}

export interface CreateFolderData {
  name: string;
}

// Helper function to validate and convert priority string to the correct type
export function validatePriority(priority: string): 'baixa' | 'media' | 'alta' {
  if (priority === 'baixa' || priority === 'media' || priority === 'alta') {
    return priority;
  }
  return 'media'; // Default to 'media' if invalid value is received
}
