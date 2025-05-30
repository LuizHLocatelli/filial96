
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import { Rotina, RotinaConclusao, RotinaWithStatus, RotinaFormData } from '../types';
import { format, isToday, isThisWeek, isThisMonth, isBefore, startOfDay } from 'date-fns';

export function useRotinas() {
  const [rotinas, setRotinas] = useState<RotinaWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchRotinas = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Buscar rotinas
      const { data: rotinasData, error: rotinasError } = await supabase
        .from('moveis_rotinas')
        .select('*')
        .eq('ativo', true)
        .order('created_at', { ascending: false });

      if (rotinasError) throw rotinasError;

      // Buscar conclusões de hoje
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data: conclusoesData, error: conclusoesError } = await supabase
        .from('moveis_rotinas_conclusoes')
        .select('*')
        .eq('data_conclusao', today);

      if (conclusoesError) throw conclusoesError;

      // Combinar dados e calcular status
      const rotinasWithStatus: RotinaWithStatus[] = (rotinasData || []).map(rotina => {
        const conclusao = conclusoesData?.find(c => c.rotina_id === rotina.id);
        let status: 'pendente' | 'concluida' | 'atrasada' = 'pendente';

        if (conclusao?.concluida) {
          status = 'concluida';
        } else if (rotina.periodicidade === 'diario' && !conclusao) {
          const now = new Date();
          const preferredTime = rotina.horario_preferencial;
          
          if (preferredTime) {
            const [hours, minutes] = preferredTime.split(':').map(Number);
            const targetTime = new Date();
            targetTime.setHours(hours, minutes, 0, 0);
            
            if (isBefore(targetTime, now)) {
              status = 'atrasada';
            }
          }
        }

        return {
          ...rotina,
          periodicidade: rotina.periodicidade as 'diario' | 'semanal' | 'mensal' | 'personalizado',
          status,
          conclusao: conclusao as RotinaConclusao | undefined,
        } as RotinaWithStatus;
      });

      setRotinas(rotinasWithStatus);
    } catch (error) {
      console.error('Erro ao buscar rotinas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as rotinas.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addRotina = async (data: RotinaFormData) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('moveis_rotinas')
        .insert({
          ...data,
          created_by: user.id,
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Rotina criada com sucesso!",
      });

      await fetchRotinas();
      return true;
    } catch (error) {
      console.error('Erro ao criar rotina:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a rotina.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateRotina = async (id: string, data: Partial<RotinaFormData>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('moveis_rotinas')
        .update(data)
        .eq('id', id)
        .eq('created_by', user.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Rotina atualizada com sucesso!",
      });

      await fetchRotinas();
      return true;
    } catch (error) {
      console.error('Erro ao atualizar rotina:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a rotina.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteRotina = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('moveis_rotinas')
        .update({ ativo: false })
        .eq('id', id)
        .eq('created_by', user.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Rotina excluída com sucesso!",
      });

      await fetchRotinas();
      return true;
    } catch (error) {
      console.error('Erro ao excluir rotina:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a rotina.",
        variant: "destructive",
      });
      return false;
    }
  };

  const toggleConclusao = async (rotinaId: string, concluida: boolean) => {
    if (!user) return false;

    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      const { error } = await supabase
        .from('moveis_rotinas_conclusoes')
        .upsert({
          rotina_id: rotinaId,
          data_conclusao: today,
          concluida,
          created_by: user.id,
        }, {
          onConflict: 'rotina_id,data_conclusao,created_by'
        });

      if (error) throw error;

      await fetchRotinas();
      return true;
    } catch (error) {
      console.error('Erro ao atualizar conclusão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status da rotina.",
        variant: "destructive",
      });
      return false;
    }
  };

  const duplicateRotina = async (rotina: Rotina) => {
    const newData: RotinaFormData = {
      nome: `${rotina.nome} (Cópia)`,
      descricao: rotina.descricao,
      periodicidade: rotina.periodicidade,
      horario_preferencial: rotina.horario_preferencial,
      categoria: rotina.categoria,
    };

    return await addRotina(newData);
  };

  useEffect(() => {
    fetchRotinas();
  }, [user]);

  return {
    rotinas,
    isLoading,
    addRotina,
    updateRotina,
    deleteRotina,
    toggleConclusao,
    duplicateRotina,
    refetch: fetchRotinas,
  };
}
