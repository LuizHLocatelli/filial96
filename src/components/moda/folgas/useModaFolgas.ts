import { useState, useEffect } from "react";
import { startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, addDays, isSameDay } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Consultor, Folga, FolgaFormValues } from "./types";
import { useAuth } from "@/contexts/auth";

export function useModaFolgas() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [consultores, setConsultores] = useState<Consultor[]>([]);
  const [isLoadingConsultores, setIsLoadingConsultores] = useState<boolean>(true);
  const [folgas, setFolgas] = useState<Folga[]>([]);
  const [isLoadingFolgas, setIsLoadingFolgas] = useState<boolean>(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedConsultor, setSelectedConsultor] = useState<string>("");
  const [motivo, setMotivo] = useState<string>("");
  const [allUsers, setAllUsers] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(true);
  const [folgasDoDiaSelecionado, setFolgasDoDiaSelecionado] = useState<Folga[]>([]);
  
  // Fetch consultores from database
  useEffect(() => {
    async function fetchConsultores() {
      setIsLoadingConsultores(true);
      try {
        // Fetch profiles com role "consultor_moda" ou "consultor_moveis"
        const { data, error } = await supabase
          .from("profiles")
          .select("id, name, avatar_url")
          .or('role.eq.consultor_moda,role.eq.consultor_moveis');
          
        if (error) {
          console.error("Erro ao buscar consultores:", error);
          toast({
            title: "Erro ao carregar consultores",
            description: error.message,
            variant: "destructive",
          });
          return;
        }
        
        // Transform the data to match the Consultor interface
        const formattedConsultores: Consultor[] = data.map((profile) => ({
          id: profile.id,
          nome: profile.name,
          avatar: profile.avatar_url || undefined,
        }));
        
        setConsultores(formattedConsultores);
      } catch (error) {
        console.error("Erro ao buscar consultores:", error);
        toast({
          title: "Erro ao carregar consultores",
          description: "Não foi possível carregar a lista de consultores.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingConsultores(false);
      }
    }
    
    fetchConsultores();
  }, [toast]);
  
  // Fetch all users from profiles table
  useEffect(() => {
    async function fetchAllUsers() {
      setIsLoadingUsers(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, name");
          
        if (error) {
          console.error("Erro ao buscar todos os usuários:", error);
          toast({
            title: "Erro ao carregar usuários",
            description: error.message,
            variant: "destructive",
          });
          setAllUsers([]);
          return;
        }
        
        if (data) {
          const formattedUsers = data.map(profile => ({
            id: profile.id,
            name: profile.name || "Usuário Desconhecido",
          }));
          setAllUsers(formattedUsers);
        } else {
          setAllUsers([]);
        }
      } catch (error) {
        console.error("Erro ao buscar todos os usuários:", error);
        toast({
          title: "Erro ao carregar usuários",
          description: "Não foi possível carregar a lista de usuários.",
          variant: "destructive",
        });
        setAllUsers([]);
      } finally {
        setIsLoadingUsers(false);
      }
    }
    
    fetchAllUsers();
  }, [toast]);
  
  // Fetch folgas from database
  useEffect(() => {
    fetchFolgas();
  }, [toast]);
  
  // Função para recarregar folgas manualmente
  const refetchFolgas = async () => {
    try {
      setIsLoadingFolgas(true);
      const { data, error } = await supabase
        .from("moda_folgas")
        .select("*");
        
      if (error) {
        console.error("Erro ao recarregar folgas:", error);
        return;
      }
      
      if (!data) {
        setFolgas([]);
        return;
      }
      
      // Transform the data to match the Folga interface
      const formattedFolgas: Folga[] = data.map((folga) => ({
        id: folga.id,
        data: new Date(folga.data),
        consultorId: folga.consultor_id,
        motivo: folga.motivo || undefined,
        createdAt: folga.created_at,
        createdBy: folga.created_by || undefined,
      }));
      
      setFolgas(formattedFolgas);
      
      // Atualizar também as folgas do dia selecionado se necessário
      if (selectedDate) {
        const folgasParaEsteDia = formattedFolgas.filter(f => isSameDay(new Date(f.data), selectedDate));
        setFolgasDoDiaSelecionado(folgasParaEsteDia);
      }
    } catch (error) {
      console.error("Erro ao recarregar folgas:", error);
    } finally {
      setIsLoadingFolgas(false);
    }
  };

  async function fetchFolgas() {
    setIsLoadingFolgas(true);
    try {
      const { data, error } = await supabase
        .from("moda_folgas")
        .select("*");
        
      if (error) {
        console.error("Erro ao buscar folgas:", error);
        toast({
          title: "Erro ao carregar folgas",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      if (!data) {
        setFolgas([]);
        return;
      }
      
      // Transform the data to match the Folga interface
      const formattedFolgas: Folga[] = data.map((folga) => ({
        id: folga.id,
        data: new Date(folga.data),
        consultorId: folga.consultor_id,
        motivo: folga.motivo || undefined,
        createdAt: folga.created_at,
        createdBy: folga.created_by || undefined,
      }));
      
      setFolgas(formattedFolgas);
    } catch (error) {
      console.error("Erro ao buscar folgas:", error);
      toast({
        title: "Erro ao carregar folgas",
        description: "Não foi possível carregar a lista de folgas.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingFolgas(false);
    }
  }
  
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
    const folgasParaEsteDia = folgas.filter(f => isSameDay(new Date(f.data), date));
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
    
    // Check if the consultor already has a folga on this date
    const existingFolga = folgas.find(
      folga => isSameDay(new Date(folga.data), selectedDate) && folga.consultorId === selectedConsultor
    );
    
    if (existingFolga) {
      toast({
        title: "Folga já existe",
        description: "Este consultor já possui uma folga registrada nesta data.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from("moda_folgas")
        .insert([
          {
            data: selectedDate.toISOString().split('T')[0],
            consultor_id: selectedConsultor,
            motivo: motivo || null,
            created_by: user?.id || null,
          },
        ])
        .select();
        
      if (error) {
        console.error("Erro ao adicionar folga:", error);
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
          data: new Date(data[0].data),
          consultorId: data[0].consultor_id,
          motivo: data[0].motivo || undefined,
          createdAt: data[0].created_at,
          createdBy: data[0].created_by,
        };
        
        setFolgas(prev => [...prev, newFolga]);
        setFolgasDoDiaSelecionado(prev => [...prev, newFolga]);
        
        toast({
          title: "Folga adicionada",
          description: "A folga foi registrada com sucesso.",
        });
        
        setSelectedConsultor("");
        setMotivo("");
      }
    } catch (error) {
      console.error("Erro ao adicionar folga:", error);
      toast({
        title: "Erro ao adicionar folga",
        description: "Não foi possível adicionar a folga.",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteFolga = async (folgaId: string) => {
    try {
      // Atualizar estado local ANTES da requisição para responsividade imediata
      const folgaParaExcluir = folgas.find(f => f.id === folgaId);
      if (!folgaParaExcluir) {
        toast({
          title: "Erro",
          description: "Folga não encontrada.",
          variant: "destructive",
        });
        return;
      }

      const consultor = getConsultorById(folgaParaExcluir.consultorId);
      const consultorNome = consultor?.nome || "Consultor desconhecido";
      
      setFolgas(prev => prev.filter(folga => folga.id !== folgaId));
      setFolgasDoDiaSelecionado(prev => prev.filter(folga => folga.id !== folgaId));

      const { error } = await supabase
        .from("moda_folgas")
        .delete()
        .eq("id", folgaId);
        
      if (error) {
        console.error("Erro ao excluir folga:", error);
        
        // Reverter o estado local em caso de erro
        setFolgas(prev => [...prev, folgaParaExcluir]);
        if (selectedDate && isSameDay(new Date(folgaParaExcluir.data), selectedDate)) {
          setFolgasDoDiaSelecionado(prev => [...prev, folgaParaExcluir]);
        }
        
        toast({
          title: "Erro ao excluir folga",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Folga excluída com sucesso!",
        description: `A folga de ${consultorNome} foi removida.`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Erro ao excluir folga:", error);
      toast({
        title: "Erro ao excluir folga",
        description: "Não foi possível excluir a folga.",
        variant: "destructive",
      });
    }
  };
  
  const getConsultorById = (id: string) => {
    return consultores.find(consultor => consultor.id === id);
  };
  
  const getUserNameById = (userId: string): string | undefined => {
    const user = allUsers.find(u => u.id === userId);
    return user?.name;
  };
  
  const getWeeks = () => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfMonth(currentMonth);
    
    const weeks = [];
    let currentWeekStart = start;
    
    while (currentWeekStart <= end) {
      const weekDays = eachDayOfInterval({
        start: currentWeekStart,
        end: addDays(currentWeekStart, 6)
      });
      weeks.push(weekDays);
      currentWeekStart = addDays(currentWeekStart, 7);
    }
    
    return weeks;
  };
  
  return {
    currentMonth,
    consultores,
    isLoadingConsultores,
    isLoadingFolgas,
    folgas,
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