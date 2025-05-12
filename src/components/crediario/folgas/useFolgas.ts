
import { useState, useEffect } from "react";
import { startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, addDays } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Crediarista, Folga, FolgaFormValues } from "./types";
import { useAuth } from "@/contexts/auth";

export function useFolgas() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [crediaristas, setCrediaristas] = useState<Crediarista[]>([]);
  const [isLoadingCrediaristas, setIsLoadingCrediaristas] = useState<boolean>(true);
  const [folgas, setFolgas] = useState<Folga[]>([]);
  const [isLoadingFolgas, setIsLoadingFolgas] = useState<boolean>(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedCrediarista, setSelectedCrediarista] = useState<string>("");
  const [motivo, setMotivo] = useState<string>("");
  const [viewImage, setViewImage] = useState<string | null>(null);
  
  // Fetch crediaristas from database
  useEffect(() => {
    async function fetchCrediaristas() {
      setIsLoadingCrediaristas(true);
      try {
        // Fetch profiles with role "crediarista"
        const { data, error } = await supabase
          .from("profiles")
          .select("id, name, avatar_url")
          .eq("role", "crediarista");
          
        if (error) {
          console.error("Error fetching crediaristas:", error);
          toast({
            title: "Erro ao carregar crediaristas",
            description: error.message,
            variant: "destructive",
          });
          return;
        }
        
        // Transform the data to match the Crediarista interface
        const formattedCrediaristas: Crediarista[] = data.map((profile) => ({
          id: profile.id,
          nome: profile.name,
          avatar: profile.avatar_url || undefined,
        }));
        
        setCrediaristas(formattedCrediaristas);
      } catch (error) {
        console.error("Error fetching crediaristas:", error);
        toast({
          title: "Erro ao carregar crediaristas",
          description: "Não foi possível carregar a lista de crediaristas.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingCrediaristas(false);
      }
    }
    
    fetchCrediaristas();
  }, [toast]);
  
  // Fetch folgas from database
  useEffect(() => {
    async function fetchFolgas() {
      setIsLoadingFolgas(true);
      try {
        const { data, error } = await supabase
          .from("crediario_folgas")
          .select("*");
          
        if (error) {
          console.error("Error fetching folgas:", error);
          toast({
            title: "Erro ao carregar folgas",
            description: error.message,
            variant: "destructive",
          });
          return;
        }
        
        // Transform the data to match the Folga interface
        const formattedFolgas: Folga[] = data.map((folga) => ({
          id: folga.id,
          data: new Date(folga.data),
          crediaristaId: folga.crediarista_id,
          motivo: folga.motivo || undefined,
          createdAt: folga.created_at,
          createdBy: folga.created_by,
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
    
    if (!selectedCrediarista) {
      toast({
        title: "Selecione um crediarista",
        description: "Por favor, selecione um crediarista para a folga.",
        variant: "destructive",
      });
      return;
    }
    
    // Verificar se já existe folga para este crediarista nesta data
    const existingFolga = folgas.find(
      (folga) =>
        folga.crediaristaId === selectedCrediarista &&
        folga.data.toDateString() === selectedDate.toDateString()
    );
    
    if (existingFolga) {
      toast({
        title: "Folga já registrada",
        description: "Este crediarista já possui folga registrada nesta data.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Format date for Supabase (YYYY-MM-DD format)
      const formattedDate = selectedDate.toISOString().split('T')[0];
      
      // Insert folga into Supabase
      const { data, error } = await supabase
        .from("crediario_folgas")
        .insert({
          data: formattedDate,
          crediarista_id: selectedCrediarista,
          motivo: motivo || null,
          created_by: user?.id,
        })
        .select();
        
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
          crediaristaId: data[0].crediarista_id,
          motivo: data[0].motivo || undefined,
          createdAt: data[0].created_at,
          createdBy: data[0].created_by,
        };
        
        setFolgas([...folgas, newFolga]);
        
        toast({
          title: "Folga adicionada",
          description: `Folga registrada com sucesso.`,
        });
        
        setOpenDialog(false);
        setSelectedDate(null);
        setSelectedCrediarista("");
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
      const { error } = await supabase
        .from("crediario_folgas")
        .delete()
        .eq("id", folgaId);
        
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
  
  const getCrediaristaById = (id: string) => {
    return crediaristas.find((crediarista) => crediarista.id === id);
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
    crediaristas,
    isLoadingCrediaristas,
    isLoadingFolgas,
    folgas,
    openDialog,
    setOpenDialog,
    selectedDate,
    setSelectedDate,
    selectedCrediarista,
    setSelectedCrediarista,
    motivo,
    setMotivo,
    viewImage,
    setViewImage,
    handlePrevMonth,
    handleNextMonth,
    handleAddFolga,
    handleDeleteFolga,
    getCrediaristaById,
    weeks
  };
}
