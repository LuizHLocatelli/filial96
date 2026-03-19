
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { toast } from "sonner";
import { ModaReserva, ReservaFormData } from '../types';
import { processReservaData } from '../utils/dataProcessing';
import {
  fetchReservasApi,
  createReservaApi,
  updateReservaStatusApi,
  deleteReservaApi,
} from '../api/reservas';
import { useReservasRealtime } from './useReservasRealtime';

export function useReservas() {
  const [reservas, setReservas] = useState<ModaReserva[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchReservas = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const data = await fetchReservasApi();
      const typedReservas = processReservaData(data as unknown as import('../utils/dataProcessing').ReservaData[]);
      setReservas(typedReservas);
    } catch (err) {
      console.error('Erro ao carregar reservas:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      toast.error("Erro", { description: "Não foi possível carregar as reservas" });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchReservas();
    } else {
      setReservas([]);
      setIsLoading(false);
    }
  }, [user, fetchReservas]);

  useReservasRealtime(setReservas, !!user);

  const createReserva = async (formData: ReservaFormData): Promise<boolean> => {
    if (!user) return false;

    try {
      await createReservaApi(formData, user.id);
      toast.success("Sucesso", { description: `Reserva criada com sucesso!${formData.cliente_vip ? ' (Cliente VIP - sem limite de tempo)' : ''}` });
      // Realtime já atualiza o estado — fetch manual removido
      return true;
    } catch (err) {
      console.error('Erro ao criar reserva:', err);
      toast.error("Erro", { description: "Não foi possível criar a reserva" });
      return false;
    }
  };

  const updateReservaStatus = async (id: string, status: ModaReserva['status'], venda_id?: string): Promise<boolean> => {
    try {
      await updateReservaStatusApi(id, status, venda_id);
      toast.success("Sucesso", { description: "Status da reserva atualizado!" });
      return true;
    } catch (err) {
      console.error('Erro ao atualizar reserva:', err);
      toast.error("Erro", { description: "Não foi possível atualizar a reserva" });
      return false;
    }
  };

  const deleteReserva = async (id: string): Promise<boolean> => {
    try {
      await deleteReservaApi(id);
      toast.success("Sucesso", { description: "Reserva removida com sucesso!" });
      return true;
    } catch (err) {
      console.error('Erro ao remover reserva:', err);
      toast.error("Erro", { description: "Não foi possível remover a reserva" });
      return false;
    }
  };

  return {
    reservas,
    isLoading,
    error,
    fetchReservas,
    createReserva,
    updateReservaStatus,
    deleteReserva,
  };
}
