
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
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
  const { toast } = useToast();

  const fetchReservas = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const data = await fetchReservasApi();
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
  }, [user, toast]);

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
      toast({
        title: "Sucesso",
        description: `Reserva criada com sucesso!${formData.cliente_vip ? ' (Cliente VIP - sem limite de tempo)' : ''}`,
      });
      await fetchReservas(); // Garante consistência imediata
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
      await updateReservaStatusApi(id, status, venda_id);
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
      await deleteReservaApi(id);
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
