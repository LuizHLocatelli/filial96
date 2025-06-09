import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import { Rotina, RotinaConclusao, RotinaWithStatus, RotinaFormData } from '../types';
import { format, isToday, isThisWeek, isThisMonth, isBefore, startOfDay } from 'date-fns';

// Cache para perfis de usuários
const profilesCache = new Map<string, { name: string; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export function useRotinas() {
  const [rotinas, setRotinas] = useState<RotinaWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Memoizar a data de hoje para evitar recálculos
  const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);

  const fetchRotinas = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Buscar rotinas ativas
      const { data: rotinasData, error: rotinasError } = await supabase
        .from('moveis_rotinas')
        .select('*')
        .eq('ativo', true)
        .order('created_at', { ascending: false });

      if (rotinasError) throw rotinasError;

      // Buscar conclusões de hoje do usuário atual
      const { data: conclusoesData, error: conclusoesError } = await supabase
        .from('moveis_rotinas_conclusoes')
        .select('*')
        .eq('data_conclusao', today)
        .eq('created_by', user.id);

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
  }, [user, today, toast]);

  const addRotina = useCallback(async (data: RotinaFormData) => {
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
  }, [user, fetchRotinas, toast]);

  const updateRotina = useCallback(async (id: string, data: Partial<RotinaFormData>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('moveis_rotinas')
        .update(data)
        .eq('id', id);

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
  }, [user, fetchRotinas, toast]);

  const deleteRotina = useCallback(async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('moveis_rotinas')
        .update({ ativo: false })
        .eq('id', id);

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
  }, [user, fetchRotinas, toast]);

  const toggleConclusao = useCallback(async (rotinaId: string, concluida: boolean) => {
    if (!user) return false;

    // Atualização otimista - atualizar o estado imediatamente
    const previousRotinas = [...rotinas];
    setRotinas(prev => prev.map(rotina => {
      if (rotina.id === rotinaId) {
        return {
          ...rotina,
          status: concluida ? 'concluida' as const : 'pendente' as const,
          conclusao: concluida ? {
            id: 'temp',
            rotina_id: rotinaId,
            data_conclusao: today,
            concluida: true,
            created_by: user.id,
            created_at: new Date().toISOString(),
          } as RotinaConclusao : undefined
        };
      }
      return rotina;
    }));

    try {
      // Verificar se já existe um registro
      const { data: existingRecord, error: selectError } = await supabase
        .from('moveis_rotinas_conclusoes')
        .select('*')
        .eq('rotina_id', rotinaId)
        .eq('data_conclusao', today)
        .eq('created_by', user.id)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        throw selectError;
      }

      let result;
      if (existingRecord) {
        // Atualizar registro existente
        result = await supabase
          .from('moveis_rotinas_conclusoes')
          .update({ concluida })
          .eq('id', existingRecord.id);
      } else {
        // Criar novo registro
        result = await supabase
          .from('moveis_rotinas_conclusoes')
          .insert({
            rotina_id: rotinaId,
            data_conclusao: today,
            concluida,
            created_by: user.id,
          });
      }

      if (result.error) {
        throw result.error;
      }
      
      toast({
        title: "Sucesso",
        description: concluida ? "Rotina marcada como concluída!" : "Rotina marcada como pendente!",
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar conclusão:', error);
      
      // Reverter a mudança otimista em caso de erro
      setRotinas(previousRotinas);
      
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status da rotina. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  }, [user, rotinas, today, toast]);

  const duplicateRotina = useCallback(async (rotina: Rotina) => {
    const newData: RotinaFormData = {
      nome: `${rotina.nome} (Cópia)`,
      descricao: rotina.descricao,
      periodicidade: rotina.periodicidade,
      horario_preferencial: rotina.horario_preferencial,
      dia_preferencial: rotina.dia_preferencial,
      categoria: rotina.categoria,
    };

    return await addRotina(newData);
  }, [addRotina]);

  // Cache para buscar nomes de usuários
  const getCachedUserName = useCallback(async (userId: string): Promise<string> => {
    const now = Date.now();
    const cached = profilesCache.get(userId);
    
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      return cached.name;
    }

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', userId)
        .single();

      const name = profile?.name || 'Usuário desconhecido';
      profilesCache.set(userId, { name, timestamp: now });
      return name;
    } catch {
      return 'Usuário desconhecido';
    }
  }, []);

  useEffect(() => {
    fetchRotinas();
  }, [fetchRotinas]);

  return {
    rotinas,
    isLoading,
    addRotina,
    updateRotina,
    deleteRotina,
    toggleConclusao,
    duplicateRotina,
    refetch: fetchRotinas,
    getCachedUserName, // Exportar para uso nos componentes
  };
}
