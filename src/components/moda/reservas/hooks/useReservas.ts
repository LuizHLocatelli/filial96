import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import { ModaReserva, ReservaFormData } from '../types';

const processReservaData = (data: any[]): ModaReserva[] => {
  // Convert old single product format to new multiple products format
  return (data || []).map((reserva: any) => {
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
      cliente_vip: reserva.cliente_vip || false,
      forma_pagamento: reserva.forma_pagamento as ModaReserva['forma_pagamento'],
      status: reserva.status as ModaReserva['status']
    } as ModaReserva;
  });
};

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
      
      const typedReservas = processReservaData(data);
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
      // Calculate expiration date based on VIP status
      const dataReserva = new Date();
      let dataExpiracao: Date;
      
      if (formData.cliente_vip) {
        // Para clientes VIP, definir uma data de expiração muito distante (1 ano)
        dataExpiracao = new Date(dataReserva.getTime() + (365 * 24 * 60 * 60 * 1000));
      } else {
        // Para clientes normais, manter o limite de 72 horas (3 dias)
        dataExpiracao = new Date(dataReserva.getTime() + (72 * 60 * 60 * 1000));
      }
      
      const insertData = {
        // New format
        produtos: formData.produtos,
        
        // Campos legados para compatibilidade (usando o primeiro produto)
        produto_nome: formData.produtos[0]?.nome || '',
        produto_codigo: formData.produtos[0]?.codigo || '',
        tamanho: formData.produtos[0]?.tamanho || '',
        quantidade: formData.produtos[0]?.quantidade || 1,
        
        // Other fields
        cliente_nome: formData.cliente_nome,
        cliente_cpf: formData.cliente_cpf,
        cliente_vip: formData.cliente_vip,
        forma_pagamento: formData.forma_pagamento,
        observacoes: formData.observacoes,
        consultora_id: user.id,
        created_by: user.id,
        
        // Required date fields
        data_reserva: dataReserva.toISOString(),
        data_expiracao: dataExpiracao.toISOString()
      };

      const { error } = await supabase
        .from('moda_reservas')
        .insert(insertData);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Reserva criada com sucesso!${formData.cliente_vip ? ' (Cliente VIP - sem limite de tempo)' : ''}`,
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
    if (!user) {
      setReservas([]);
      return;
    }

    fetchReservas();

    const handleRealtimeUpdate = (payload: any) => {
      if (payload.eventType === 'INSERT') {
        const [processed] = processReservaData([payload.new]);
        setReservas(current => [processed, ...current].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      } else if (payload.eventType === 'UPDATE') {
        const [processed] = processReservaData([payload.new]);
        setReservas(current => current.map(r => r.id === processed.id ? processed : r));
      } else if (payload.eventType === 'DELETE') {
        setReservas(current => current.filter(r => r.id !== payload.old.id));
      }
    };

    const channel = supabase
      .channel('moda_reservas')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'moda_reservas' },
        handleRealtimeUpdate
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
