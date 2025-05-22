
export interface NoteFolder {
  id: string;
  name: string;
  position: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface CreateFolderData {
  name: string;
}

export interface StickyNote {
  id: string;
  title?: string;
  content: string;
  color: string;
  folder_id?: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface Board {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  is_template: boolean;
  created_by: string;
}

export interface Column {
  id: string;
  board_id: string;
  name: string;
  position: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}

// Now we also need to update the QuickAccess component to remove the Kanban option
