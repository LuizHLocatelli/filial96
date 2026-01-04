import { useState, useEffect, useCallback } from "react";
import { startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, addDays, isSameDay } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Consultor, Folga, UseFolgasConfig, UseFolgasReturn } from "@/types/shared/folgas";
import { useAuth } from "@/contexts/auth";

// Helpers para manipulação de datas
const fromDateOnlyString = (dateStr: string): Date => {
  return new Date(`${dateStr}T00:00:00`);
};

const toDateOnlyString = (date: Date): string => {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
};

export function useFolgas(config: UseFolgasConfig): UseFolgasReturn {
  const { toast } = useToast();
  const { user } = useAuth();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [consultores, setConsultores] = useState<Consultor[]>([]);
  const [isLoadingConsultores, setIsLoadingConsultores] = useState(true);
  const [folgas, setFolgas] = useState<Folga[]>([]);
  const [isLoadingFolgas, setIsLoadingFolgas] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedConsultor, setSelectedConsultor] = useState("");
  const [motivo, setMotivo] = useState("");
  const [allUsers, setAllUsers] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [folgasDoDiaSelecionado, setFolgasDoDiaSelecionado] = useState<Folga[]>([]);

  // Fetch consultores
  useEffect(() => {
    async function fetchConsultores() {
      setIsLoadingConsultores(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, name, avatar_url")
          .eq('role', config.consultantRole)
          .order('name', { ascending: true });

        if (error) {
          toast({
            title: "Erro ao carregar consultores",
            description: error.message,
            variant: "destructive",
          });
          setConsultores([]);
          return;
        }

        const formattedConsultores: Consultor[] = (data || []).map((profile) => ({
          id: profile.id,
          nome: profile.name || "Sem nome",
          avatar: profile.avatar_url || undefined,
        }));

        setConsultores(formattedConsultores);
      } catch (error) {
        toast({
          title: "Erro ao carregar consultores",
          description: "Não foi possível carregar a lista de consultores.",
          variant: "destructive",
        });
        setConsultores([]);
      } finally {
        setIsLoadingConsultores(false);
      }
    }

    fetchConsultores();
  }, [config.consultantRole, toast]);

  // Fetch all users
  useEffect(() => {
    async function fetchAllUsers() {
      setIsLoadingUsers(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, name");

        if (error) {
          setAllUsers([]);
          return;
        }

        if (data) {
          setAllUsers(data.map(profile => ({
            id: profile.id,
            name: profile.name || "Usuário Desconhecido",
          })));
        } else {
          setAllUsers([]);
        }
      } catch {
        setAllUsers([]);
      } finally {
        setIsLoadingUsers(false);
      }
    }

    fetchAllUsers();
  }, []);

  // Fetch folgas
  const fetchFolgas = useCallback(async () => {
    setIsLoadingFolgas(true);
    try {
      const { data, error } = await supabase
        .from(config.tableName)
        .select("*");

      if (error) {
        toast({
          title: "Erro ao carregar folgas",
          description: error.message,
          variant: "destructive",
        });
        setFolgas([]);
        return;
      }

      if (!data) {
        setFolgas([]);
        return;
      }

      const formattedFolgas: Folga[] = data.map((folga) => ({
        id: folga.id,
        data: fromDateOnlyString(folga.data),
        consultorId: folga.consultor_id,
        motivo: folga.motivo || undefined,
        createdAt: folga.created_at,
        createdBy: folga.created_by || undefined,
      }));

      setFolgas(formattedFolgas);
    } catch (error) {
      toast({
        title: "Erro ao carregar folgas",
        description: "Não foi possível carregar a lista de folgas.",
        variant: "destructive",
      });
      setFolgas([]);
    } finally {
      setIsLoadingFolgas(false);
    }
  }, [config.tableName, toast]);

  useEffect(() => {
    fetchFolgas();
  }, [fetchFolgas]);

  const refetchFolgas = useCallback(async () => {
    await fetchFolgas();
  }, [fetchFolgas]);

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const folgasParaEsteDia = folgas.filter((f) => isSameDay(f.data, date));
    setFolgasDoDiaSelecionado(folgasParaEsteDia);
    setOpenDialog(true);
    setSelectedConsultor("");
    setMotivo("");
  };

  const handleAddFolga = async () => {
    if (!selectedDate) {
      toast({
        title: "Selecione uma data",
        description: "Por favor, selecione uma data para a folga.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedConsultor) {
      toast({
        title: "Selecione um consultor",
        description: "Por favor, selecione um consultor para a folga.",
        variant: "destructive",
      });
      return;
    }

    // Verificar se já existe folga
    const existingFolga = folgas.find(
      (f) => isSameDay(f.data, selectedDate) && f.consultorId === selectedConsultor
    );

    if (existingFolga) {
      toast({
        title: "Folga já existe",
        description: "Este consultor já possui uma folga nesta data.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from(config.tableName)
        .insert({
          data: toDateOnlyString(selectedDate),
          consultor_id: selectedConsultor,
          motivo: motivo || null,
          created_by: user?.id || null,
        })
        .select();

      if (error) {
        toast({
          title: "Erro ao adicionar folga",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data && data.length > 0) {
        const newFolga: Folga = {
          id: data[0].id,
          data: fromDateOnlyString(data[0].data),
          consultorId: data[0].consultor_id,
          motivo: data[0].motivo || undefined,
          createdAt: data[0].created_at,
          createdBy: data[0].created_by || undefined,
        };

        setFolgas((prev) => [...prev, newFolga]);

        if (selectedDate && isSameDay(newFolga.data, selectedDate)) {
          setFolgasDoDiaSelecionado((prev) => [...prev, newFolga]);
        }

        toast({
          title: "Folga adicionada",
          description: "A folga foi registrada com sucesso.",
        });

        setSelectedDate(null);
        setSelectedConsultor("");
        setMotivo("");
        setOpenDialog(false);
      }
    } catch (error) {
      toast({
        title: "Erro ao adicionar folga",
        description: "Não foi possível adicionar a folga.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFolga = async (folgaId: string) => {
    try {
      const folgaParaExcluir = folgas.find((f) => f.id === folgaId);

      // Otimistic update
      setFolgas((prev) => prev.filter((folga) => folga.id !== folgaId));
      if (selectedDate && folgaParaExcluir && isSameDay(folgaParaExcluir.data, selectedDate)) {
        setFolgasDoDiaSelecionado((prev) => prev.filter((f) => f.id !== folgaId));
      }

      const { error } = await supabase
        .from(config.tableName)
        .delete()
        .eq("id", folgaId);

      if (error) {
        // Revert on error
        setFolgas((prev) => [...prev, folgaParaExcluir!]);
        if (selectedDate && folgaParaExcluir && isSameDay(folgaParaExcluir.data, selectedDate)) {
          setFolgasDoDiaSelecionado((prev) => [...prev, folgaParaExcluir!]);
        }
        toast({
          title: "Erro ao excluir folga",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      const consultor = consultores.find((c) => c.id === folgaParaExcluir?.consultorId);
      toast({
        title: "Folga excluída",
        description: `A folga de ${consultor?.nome || "Consultor"} foi removida.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir folga",
        description: "Não foi possível excluir a folga.",
        variant: "destructive",
      });
    }
  };

  const getConsultorById = (id: string) => {
    return consultores.find((consultor) => consultor.id === id);
  };

  const getUserNameById = (userId: string): string | undefined => {
    const user = allUsers.find((u) => u.id === userId);
    return user?.name;
  };

  const getWeeks = () => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const end = endOfMonth(currentMonth);
    const totalDays = eachDayOfInterval({ start, end });

    const weeks: Date[][] = [];
    let week: Date[] = [];

    for (let i = 0; i < totalDays.length; i++) {
      week.push(totalDays[i]);
      if (week.length === 7 || i === totalDays.length - 1) {
        weeks.push(week);
        week = [];
      }
    }

    // Completar última semana se necessário
    if (week.length > 0 && week.length < 7) {
      const lastDay = week[week.length - 1];
      for (let i = 1; i <= 7 - week.length; i++) {
        week.push(addDays(lastDay, i));
      }
      weeks.push(week);
    }

    return weeks;
  };

  return {
    currentMonth,
    consultores,
    isLoadingConsultores,
    folgas,
    isLoadingFolgas,
    openDialog,
    setOpenDialog,
    selectedDate,
    setSelectedDate,
    selectedConsultor,
    setSelectedConsultor,
    motivo,
    setMotivo,
    handlePrevMonth,
    handleNextMonth,
    handleAddFolga,
    handleDeleteFolga,
    getConsultorById,
    getUserNameById,
    folgasDoDiaSelecionado,
    handleDateClick,
    allUsers,
    isLoadingUsers,
    getWeeks,
    refetchFolgas,
  };
}
