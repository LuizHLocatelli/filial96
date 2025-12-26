export interface Database {
  public: {
    Tables: {
      cartaz_folders: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
      };
      cartazes: {
        Row: {
          id: string;
          title: string;
          file_url: string;
          file_type: 'pdf' | 'image';
          folder_id: string | null;
          position: number;
          created_at: string;
          updated_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          title: string;
          file_url: string;
          file_type: 'pdf' | 'image';
          folder_id?: string | null;
          position?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
        };
        Update: {
          id?: string;
          title?: string;
          file_url?: string;
          file_type?: 'pdf' | 'image';
          folder_id?: string | null;
          position?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
        };
      };
    };
    Functions: {
    };
  };
}
