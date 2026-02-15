
import { ModaReserva } from '../types';

export interface ReservaData {
  produtos?: Array<Record<string, unknown>>;
  produto_nome?: string;
  produto_codigo?: string;
  tamanho?: string;
  quantidade?: number;
  cliente_vip?: boolean;
  forma_pagamento?: string;
  status?: string;
  id: string;
  created_at: string;
}

export const processReservaData = (data: ReservaData[]): ModaReserva[] => {
  // Converte o formato antigo de produto único para o novo formato de múltiplos produtos
  return (data || []).map((reserva) => {
    let produtos;
    
    // Verifica se o campo produtos existe (novo formato)
    if (reserva.produtos && Array.isArray(reserva.produtos)) {
      produtos = reserva.produtos;
    } else {
      // Converte o formato antigo para o novo formato
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
