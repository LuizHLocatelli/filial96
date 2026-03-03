import { supabase } from '@/integrations/supabase/client';
import { Aniversariante, AniversarianteFormData } from '@/types/aniversariantes';

export async function fetchAniversariantes(): Promise<Aniversariante[]> {
  const { data, error } = await supabase
    .from('aniversariantes_regiao')
    .select('*')
    .order('data_aniversario', { ascending: true });

  if (error) {
    console.error('Error fetching aniversariantes:', error);
    throw new Error(error.message);
  }

  return data as Aniversariante[];
}

export async function createAniversariante(aniversariante: AniversarianteFormData): Promise<Aniversariante> {
  const { data, error } = await supabase
    .from('aniversariantes_regiao')
    .insert([aniversariante])
    .select()
    .single();

  if (error) {
    console.error('Error creating aniversariante:', error);
    throw new Error(error.message);
  }

  return data as Aniversariante;
}

export async function deleteAniversariante(id: string): Promise<void> {
  const { error } = await supabase
    .from('aniversariantes_regiao')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting aniversariante:', error);
    throw new Error(error.message);
  }
}
