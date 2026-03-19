
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ModaReserva } from '../types';
import { processReservaData, ReservaData } from '../utils/dataProcessing';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export function useReservasRealtime(
  setReservas: React.Dispatch<React.SetStateAction<ModaReserva[]>>,
  isUserAvailable: boolean
) {
  useEffect(() => {
    if (!isUserAvailable) {
      return;
    }

    const handleRealtimeUpdate = (payload: RealtimePostgresChangesPayload<ReservaData>) => {
      if (payload.eventType === 'INSERT') {
        const [processed] = processReservaData([payload.new as ReservaData]);
        setReservas(current => [processed, ...current].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      } else if (payload.eventType === 'UPDATE') {
        const [processed] = processReservaData([payload.new as ReservaData]);
        setReservas(current => current.map(r => r.id === processed.id ? processed : r));
      } else if (payload.eventType === 'DELETE') {
        setReservas(current => current.filter(r => r.id !== (payload.old as { id: string }).id));
      }
    };

    const channel: RealtimeChannel = supabase
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
