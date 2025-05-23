
import { useState, useEffect } from "react";
import { startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, addDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Consultor, Folga, FolgaFormValues } from "./types";
import { useAuth } from "@/contexts/auth";

// Type definitions for the database rows
interface MoveiFolgaRow {
  id: string;
  data: string;
  consultor_id: string;
  motivo: string | null;
  created_at: string;
  created_by: string | null;
}

interface MoveiFolgaInsert {
  data: string;
  consultor_id: string;
  motivo?: string | null;
  created_by?: string | null;
}

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
          console.error("Error fetching consultores:", error);
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
        console.error("Error fetching consultores:", error);
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
  
  // Fetch folgas from database
  useEffect(() => {
    async function fetchFolgas() {
      setIsLoadingFolgas(true);
      try {
        // Using type assertion to bypass TypeScript errors until types are regenerated
        const { data, error } = await (supabase as any)
          .from("moveis_folgas")
          .select("*") as { data: MoveiFolgaRow[] | null; error: any };
          
        if (error) {
          console.error("Error fetching folgas:", error);
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
        console.error("Error fetching folgas:", error);
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
      
      const insertData: MoveiFolgaInsert = {
        data: formattedDate,
        consultor_id: selectedConsultor,
        motivo: motivo || null,
        created_by: user?.id || null,
      };
      
      // Insert folga into Supabase using type assertion
      const { data, error } = await (supabase as any)
        .from("moveis_folgas")
        .insert(insertData)
        .select() as { data: MoveiFolgaRow[] | null; error: any };
        
      if (error) {
        console.error("Error adding folga:", error);
        toast({
          title: "Erro ao adicionar folga",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      if (data && data.length > 0) {
        // Add the new folga to the state
        const newFolga: Folga = {
          id: data[0].id,
          data: new Date(data[0].data),
          consultorId: data[0].consultor_id,
          motivo: data[0].motivo || undefined,
          createdAt: data[0].created_at,
          createdBy: data[0].created_by || undefined,
        };
        
        setFolgas([...folgas, newFolga]);
        
        toast({
          title: "Folga adicionada",
          description: `Folga registrada com sucesso.`,
        });
        
        setOpenDialog(false);
        setSelectedDate(null);
        setSelectedConsultor("");
        setMotivo("");
      }
    } catch (error) {
      console.error("Error adding folga:", error);
      toast({
        title: "Erro ao adicionar folga",
        description: "Não foi possível adicionar a folga.",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteFolga = async (folgaId: string) => {
    try {
      const { error } = await (supabase as any)
        .from("moveis_folgas")
        .delete()
        .eq("id", folgaId) as { error: any };
        
      if (error) {
        console.error("Error deleting folga:", error);
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
      console.error("Error deleting folga:", error);
      toast({
        title: "Erro ao remover folga",
        description: "Não foi possível remover a folga.",
        variant: "destructive",
      });
    }
  };
  
  const getConsultorById = (id: string) => {
    return consultores.find((consultor) => consultor.id === id);
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
    weeks
  };
}
