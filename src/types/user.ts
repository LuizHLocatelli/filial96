
export interface UserProfile {
  id: string;
  name: string;
  role: string;
  phone?: string;
  display_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserWithStats extends UserProfile {
  display_name?: string;
  avatar_url?: string;
  last_login?: string;
  departamento?: string;
  stats?: {
    total_tasks?: number;
    completed_tasks?: number;
    pending_tasks?: number;
  };
}
