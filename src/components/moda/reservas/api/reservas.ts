
import { supabase } from '@/integrations/supabase/client';
import { ReservaFormData, ModaReserva } from '../types';

export const fetchReservasApi = async () => {
  const { data, error } = await supabase
    .from('moda_reservas')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const createReservaApi = async (formData: ReservaFormData, userId: string) => {
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
    produtos: formData.produtos as any,
    cliente_nome: formData.cliente_nome,
    cliente_cpf: formData.cliente_cpf,
    cliente_vip: formData.cliente_vip,
    forma_pagamento: formData.forma_pagamento,
    observacoes: formData.observacoes,
    consultora_id: userId,
    created_by: userId,
    data_reserva: dataReserva.toISOString(),
    data_expiracao: dataExpiracao.toISOString()
  };

  const { error } = await supabase
    .from('moda_reservas')
    .insert(insertData);

  if (error) throw error;
};

export const updateReservaStatusApi = async (id: string, status: ModaReserva['status'], venda_id?: string) => {
  const updateData: any = { status };
  if (venda_id) updateData.venda_id = venda_id;

  const { error } = await supabase
    .from('moda_reservas')
    .update(updateData)
    .eq('id', id);

  if (error) throw error;
};

export const deleteReservaApi = async (id: string) => {
  const { error } = await supabase
    .from('moda_reservas')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
