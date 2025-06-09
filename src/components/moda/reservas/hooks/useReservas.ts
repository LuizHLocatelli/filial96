
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/components/ui/use-toast';
import { ModaReserva, ReservaFormData } from '../types';

export function useReservas() {
  const [reservas, setReservas] = useState<ModaReserva[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchReservas = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('moda_reservas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Convert old single product format to new multiple products format
      const typedReservas = (data || []).map((reserva: any) => {
        let produtos;
        
        // Check if produtos field exists (new format)
        if (reserva.produtos && Array.isArray(reserva.produtos)) {
          produtos = reserva.produtos;
        } else {
          // Convert old format to new format
          produtos = [{
            nome: reserva.produto_nome || '',
            codigo: reserva.produto_codigo || '',
            tamanho: reserva.tamanho || '',
            quantidade: reserva.quantidade || 1
          }];
        }

        return {
          ...reserva,
          produtos,
          forma_pagamento: reserva.forma_pagamento as ModaReserva['forma_pagamento'],
          status: reserva.status as ModaReserva['status']
        } as ModaReserva;
      });
      
      setReservas(typedReservas);
    } catch (err: any) {
      console.error('Erro ao carregar reservas:', err);
      setError(err.message);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as reservas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createReserva = async (formData: ReservaFormData): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('moda_reservas' as any)
        .insert({
          produtos: formData.produtos,
          cliente_nome: formData.cliente_nome,
          cliente_cpf: formData.cliente_cpf,
          forma_pagamento: formData.forma_pagamento,
          observacoes: formData.observacoes,
          consultora_id: user.id,
          created_by: user.id
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Reserva criada com sucesso!",
      });

      await fetchReservas();
      return true;
    } catch (err: any) {
      console.error('Erro ao criar reserva:', err);
      toast({
        title: "Erro",
        description: "Não foi possível criar a reserva",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateReservaStatus = async (id: string, status: ModaReserva['status'], venda_id?: string): Promise<boolean> => {
    try {
      const updateData: any = { status };
      if (venda_id) updateData.venda_id = venda_id;

      const { error } = await supabase
        .from('moda_reservas')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Status da reserva atualizado!",
      });

      await fetchReservas();
      return true;
    } catch (err: any) {
      console.error('Erro ao atualizar reserva:', err);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a reserva",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteReserva = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('moda_reservas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Reserva removida com sucesso!",
      });

      await fetchReservas();
      return true;
    } catch (err: any) {
      console.error('Erro ao remover reserva:', err);
      toast({
        title: "Erro",
        description: "Não foi possível remover a reserva",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchReservas();
  }, [user]);

  return {
    reservas,
    isLoading,
    error,
    fetchReservas,
    createReserva,
    updateReservaStatus,
    deleteReserva
  };
}
