import { useState, useEffect } from "react";
import { startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, addDays, isSameDay } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Consultor, Folga, FolgaFormValues } from "./types";
import { useAuth } from "@/contexts/auth";

export function useMoveiFolgas() {
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
        // Fetch profiles com role "consultor_moveis" ou "consultor_moda"
        const { data, error } = await supabase
          .from("profiles")
          .select("id, name, avatar_url")
          .or('role.eq.consultor_moveis,role.eq.consultor_moda');
          
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
    async function fetchFolgas() {
      setIsLoadingFolgas(true);
      try {
        const { data, error } = await supabase
          .from("moveis_folgas")
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
    
    fetchFolgas();
  }, [toast]);
  
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
    
    // Verificar se já existe folga para este consultor nesta data
    const existingFolga = folgas.find(
      (folga) =>
        folga.consultorId === selectedConsultor &&
        folga.data.toDateString() === selectedDate.toDateString()
    );
    
    if (existingFolga) {
      toast({
        title: "Folga já registrada",
        description: "Este consultor já possui folga registrada nesta data.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Format date for Supabase (YYYY-MM-DD format)
      const formattedDate = selectedDate.toISOString().split('T')[0];
      
      // Insert folga into Supabase
      const { data, error } = await supabase
        .from("moveis_folgas")
        .insert({
          data: formattedDate,
          consultor_id: selectedConsultor,
          motivo: motivo || null,
          created_by: user?.id || null,
        })
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
          createdBy: data[0].created_by || undefined,
        };
        
        setFolgas([...folgas, newFolga]);
        
        if (selectedDate && isSameDay(newFolga.data, selectedDate)) {
          setFolgasDoDiaSelecionado(prevFolgas => [...prevFolgas, newFolga]);
        }

        toast({
          title: "Folga adicionada",
          description: `Folga para ${getConsultorById(newFolga.consultorId)?.nome || 'Consultor'} registrada com sucesso.`,
        });
        
        setSelectedDate(null);
        setSelectedConsultor("");
        setMotivo("");
        setOpenDialog(false);
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
      const { error } = await supabase
        .from("moveis_folgas")
        .delete()
        .eq("id", folgaId);
        
      if (error) {
        console.error("Erro ao excluir folga:", error);
        toast({
          title: "Erro ao remover folga",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      // Remove folga from state
      setFolgas(folgas.filter((folga) => folga.id !== folgaId));
      
      toast({
        title: "Folga removida",
        description: "A folga foi removida com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao excluir folga:", error);
      toast({
        title: "Erro ao remover folga",
        description: "Não foi possível remover a folga.",
        variant: "destructive",
      });
    }
  };
  
  const getConsultorById = (id: string) => {
    return consultores.find((c) => c.id === id);
  };

  // Função para obter o nome do usuário pelo ID
  const getUserNameById = (userId: string): string | undefined => {
    const foundUser = allUsers.find(u => u.id === userId);
    return foundUser?.name;
  };
  
  // Função para gerar semanas do mês
  const getWeeks = () => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const end = endOfMonth(currentMonth);
    const totalDays = eachDayOfInterval({ start, end });
    
    const weeks = [];
    let week = [];
    
    for (let i = 0; i < totalDays.length; i++) {
      week.push(totalDays[i]);
      if (week.length === 7 || i === totalDays.length - 1) {
        weeks.push(week);
        week = [];
      }
    }
    
    // Completar a última semana, se necessário
    if (week.length > 0 && week.length < 7) {
      const lastDay = week[week.length - 1];
      for (let i = 1; i <= 7 - week.length; i++) {
        week.push(addDays(lastDay, i));
      }
      weeks.push(week);
    }
    
    return weeks;
  };
  
  const weeks = getWeeks();

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
    weeks,
    allUsers,
    isLoadingUsers,
    folgasDoDiaSelecionado,
    handleDateClick,
  };
}
