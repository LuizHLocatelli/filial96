import { User } from '../index';

export interface EscalaCarga {
  id: string;
  date: string; // YYYY-MM-DD
  user_id: string;
  is_carga: boolean;
  shift_start: string; // HH:mm:ss
  shift_end: string; // HH:mm:ss
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  
  // Relações (para listagem no frontend)
  user?: User;
}

export interface EscalaAIPayload {
  startDate: string; // YYYY-MM-DD
  daysToGenerate: number;
  firstPairIds: string[]; // UUIDs
  availableConsultantsIds: string[]; // UUIDs
  excludedConsultantsIds?: string[]; // UUIDs
  folgas?: { consultantId: string; date: string }[];
}

export interface EscalaAIResponse {
  date: string; // YYYY-MM-DD
  is_carga: boolean;
  user_id: string;
  shift_start: string;
  shift_end: string;
}
