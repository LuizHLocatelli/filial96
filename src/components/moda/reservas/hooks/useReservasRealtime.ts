
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ModaReserva } from '../types';
import { processReservaData, ReservaData } from '../utils/dataProcessing';

export function useReservasRealtime(
  setReservas: React.Dispatch<React.SetStateAction<ModaReserva[]>>,
  isUserAvailable: boolean
) {
  useEffect(() => {
    if (!isUserAvailable) {
      return;
    }

    const handleRealtimeUpdate = (payload: { eventType: string; new: ReservaData; old: { id: string } }) => {
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
  }, [isUserAvailable, setReservas]);
}
