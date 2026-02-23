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
  return data as EscalaCarga[];
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

  // First, delete any existing schedules for this period so the new generation fully replaces them
  const { error: deleteError } = await supabase
    .from('escala_carga')
    .delete()
    .gte('date', startDate)
    .lte('date', endDate);
    
  if (deleteError) throw deleteError;

  // Format data for insert
  const insertData = escalas.map(escala => ({
    date: escala.date,
    user_id: escala.user_id,
    is_carga: escala.is_carga,
    shift_start: escala.shift_start,
    shift_end: escala.shift_end,
    created_by: user.user.id
  }));

  // Insert fresh data
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

export async function fetchConsultores() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, avatar_url, role')
    .eq('role', 'consultor_moveis');

  if (error) throw error;
  return data;
}

export async function fetchFolgasMoveisPeriod(startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('moveis_folgas')
    .select('consultor_id, data')
    .gte('data', startDate)
    .lte('data', endDate);

  if (error) throw error;
  return data;
}
