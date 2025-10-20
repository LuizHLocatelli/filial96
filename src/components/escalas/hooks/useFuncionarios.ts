import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Funcionario } from '../types/escalasTypes';

export function useFuncionarios() {
  const { data: funcionarios = [], isLoading } = useQuery({
    queryKey: ['funcionarios-escalas'],
    queryFn: async () => {
      // Buscar apenas Consultores de Moda e Crediaristas
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, display_name, role')
        .in('role', ['consultor_moda', 'crediarista'])
        .order('name', { ascending: true });

      if (profilesError) throw profilesError;

      return (profiles || []).map(profile => ({
        id: profile.id,
        full_name: profile.display_name || profile.name || 'Funcionário',
        email: profile.name || profile.id, // Usar name como fallback
        role: profile.role
      })) as Funcionario[];
    }
  });

  return {
    funcionarios,
    isLoading
  };
}
