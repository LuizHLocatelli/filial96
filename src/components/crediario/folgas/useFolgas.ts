
import { useState, useEffect } from "react";
import { startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, addDays } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Crediarista, Folga } from "./types";

export function useFolgas() {
  const { toast } = useToast();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [crediaristas, setCrediaristas] = useState<Crediarista[]>([]);
  const [isLoadingCrediaristas, setIsLoadingCrediaristas] = useState<boolean>(true);
  const [folgas, setFolgas] = useState<Folga[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedCrediarista, setSelectedCrediarista] = useState<string>("");
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
  
  const handleAddFolga = () => {
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
        folga.data.getTime() === selectedDate.getTime()
    );
    
    if (existingFolga) {
      toast({
        title: "Folga já registrada",
        description: "Este crediarista já possui folga registrada nesta data.",
        variant: "destructive",
      });
      return;
    }
    
    const novaFolga: Folga = {
      id: Math.random().toString(36).substr(2, 9),
      data: selectedDate,
      crediaristaId: selectedCrediarista,
    };
    
    setFolgas([...folgas, novaFolga]);
    
    toast({
      title: "Folga adicionada",
      description: `Folga registrada com sucesso.`,
    });
    
    setOpenDialog(false);
    setSelectedDate(null);
    setSelectedCrediarista("");
  };
  
  const handleDeleteFolga = (folgaId: string) => {
    setFolgas(folgas.filter((folga) => folga.id !== folgaId));
    toast({
      title: "Folga removida",
      description: "A folga foi removida com sucesso.",
    });
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
    folgas,
    openDialog,
    setOpenDialog,
    selectedDate,
    setSelectedDate,
    selectedCrediarista,
    setSelectedCrediarista,
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
