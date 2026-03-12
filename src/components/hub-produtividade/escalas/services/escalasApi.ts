import { supabase } from '@/integrations/supabase/client';
import { EscalaAIPayload, EscalaAIResponse, EscalaCarga } from '@/types/shared/escalas';

export async function fetchEscalas(startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('escala_carga')
    .select(`
      *,
      user:profiles!escala_carga_user_id_fkey(id, name, avatar_url, role)
    `)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) throw error;
  return data as unknown as EscalaCarga[];
}

export async function generateEscalaWithAI(payload: EscalaAIPayload): Promise<EscalaAIResponse[]> {
  const { data, error } = await supabase.functions.invoke('generate-escala-ai', {
    body: payload,
  });

  if (error) throw error;
  return data.schedule;
}

export async function saveEscalas(escalas: EscalaAIResponse[], startDate: string, endDate: string) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("User not authenticated");

  const { error: deleteError } = await supabase
    .from('escala_carga')
    .delete()
    .gte('date', startDate)
    .lte('date', endDate);
    
  if (deleteError) throw deleteError;

  const insertData = escalas.map(escala => ({
    date: escala.date,
    user_id: escala.user_id,
    is_carga: escala.is_carga,
    shift_start: escala.shift_start,
    shift_end: escala.shift_end,
    created_by: user.user.id
  }));

  const { error } = await supabase
    .from('escala_carga')
    .insert(insertData);

  if (error) throw error;
  return true;
}

export async function deleteEscalas(startDate: string, endDate: string) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("User not authenticated");

  const { error } = await supabase
    .from('escala_carga')
    .delete()
    .gte('date', startDate)
    .lte('date', endDate);

  if (error) throw error;
  return true;
}

export async function updateEscala(id: string, updates: { user_id?: string; shift_start?: string; shift_end?: string; is_carga?: boolean }) {
  const { error } = await supabase
    .from('escala_carga')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
  return true;
}

export async function fetchConsultores() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, avatar_url, role')
    .eq('role', 'consultor_moveis');

  if (error) throw error;
  return data;
}

export async function fetchTeamAlmoco() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from('profiles' as any)
    .select('id, name, avatar_url, role, lunch_time')
    .in('role', ['consultor_moveis', 'consultor_moda', 'crediarista'])
    .order('name', { ascending: true });

  if (error) throw error;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data as any[];
}

export async function updateLunchTime(userId: string, lunchTime: string | null) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from('profiles' as any)
    .update({ lunch_time: lunchTime })
    .eq('id', userId);

  if (error) throw error;
  return true;
}
