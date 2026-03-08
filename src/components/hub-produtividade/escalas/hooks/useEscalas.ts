import { useState, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { fetchEscalas, fetchConsultores } from "../services/escalasApi";
import { EscalaCarga } from "@/types/shared/escalas";

export interface EscalaDayData {
  date: Date;
  dateStr: string;
  dayOfWeek: string;
  dayNumber: string;
  isSunday: boolean;
  isToday: boolean;
  cargaShifts: EscalaCarga[];
  normalShifts: EscalaCarga[];
  isMirrorDay: boolean;
}

export function useEscalas() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filterConsultantId, setFilterConsultantId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDateStr = format(monthStart, "yyyy-MM-dd");
  const endDateStr = format(monthEnd, "yyyy-MM-dd");

  const { data: escalas, isLoading, refetch } = useQuery({
    queryKey: ["escalas", startDateStr, endDateStr],
    queryFn: () => fetchEscalas(startDateStr, endDateStr),
  });

  const { data: consultores } = useQuery({
    queryKey: ["consultores-moveis"],
    queryFn: fetchConsultores,
  });

  const monthLabel = format(currentMonth, "MMMM yyyy", { locale: ptBR });

  const goNextMonth = useCallback(() => setCurrentMonth(prev => addMonths(prev, 1)), []);
  const goPrevMonth = useCallback(() => setCurrentMonth(prev => subMonths(prev, 1)), []);
  const goToday = useCallback(() => setCurrentMonth(new Date()), []);

  const calendarDays: EscalaDayData[] = useMemo(() => {
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return days.map(date => {
      const dateStr = format(date, "yyyy-MM-dd");
      const dow = getDay(date);
      const isSunday = dow === 0;
      const dayOfWeek = format(date, "EEE", { locale: ptBR });
      const dayNumber = format(date, "d");
      const isMirrorDay = [2, 4, 6].includes(dow); // ter, qui, sab

      let dayEscalas = escalas?.filter(e => e.date === dateStr) || [];

      if (filterConsultantId) {
        dayEscalas = dayEscalas.filter(e => e.user_id === filterConsultantId);
      }

      return {
        date,
        dateStr,
        dayOfWeek,
        dayNumber,
        isSunday,
        isToday: isToday(date),
        cargaShifts: dayEscalas.filter(e => e.is_carga),
        normalShifts: dayEscalas.filter(e => !e.is_carga),
        isMirrorDay,
      };
    });
  }, [escalas, monthStart, monthEnd, filterConsultantId]);

  // Stats for the month
  const stats = useMemo(() => {
    if (!escalas) return { totalShifts: 0, totalCarga: 0, workingDays: 0, consultantsCount: 0 };
    const uniqueDates = new Set(escalas.map(e => e.date));
    const uniqueConsultants = new Set(escalas.map(e => e.user_id));
    return {
      totalShifts: escalas.length,
      totalCarga: escalas.filter(e => e.is_carga).length,
      workingDays: uniqueDates.size,
      consultantsCount: uniqueConsultants.size,
    };
  }, [escalas]);

  const invalidateAndRefetch = useCallback(() => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ["escalas"] });
  }, [refetch, queryClient]);

  return {
    currentMonth,
    monthLabel,
    goNextMonth,
    goPrevMonth,
    goToday,
    calendarDays,
    isLoading,
    stats,
    consultores: consultores || [],
    filterConsultantId,
    setFilterConsultantId,
    invalidateAndRefetch,
    hasData: (escalas?.length || 0) > 0,
  };
}
