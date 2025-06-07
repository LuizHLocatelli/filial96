
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { Folga } from "../types";
import { isSameDay } from "date-fns";

export function useFolgasOperations(
  folgas: Folga[],
  setFolgas: React.Dispatch<React.SetStateAction<Folga[]>>,
  selectedDate: Date | null,
  selectedCrediarista: string,
  motivo: string,
  setOpenDialog: (open: boolean) => void,
  setSelectedDate: (date: Date | null) => void,
  setSelectedCrediarista: (id: string) => void,
  setMotivo: (motivo: string) => void,
  setFolgasDoDiaSelecionado: React.Dispatch<React.SetStateAction<Folga[]>>
) {
  const { toast } = useToast();
  const { user } = useAuth();

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
        console.error("Erro ao adicionar folga:", error);
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
        
        setFolgas(prevFolgas => [...prevFolgas, newFolga]);
        // Atualizar também as folgasDoDiaSelecionado se a nova folga for do dia atualmente selecionado
        if (selectedDate && isSameDay(newFolga.data, selectedDate)) {
          setFolgasDoDiaSelecionado(prevFolgas => [...prevFolgas, newFolga]);
        }
        
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
      console.error("Erro ao adicionar folga:", error);
      toast({
        title: "Erro ao adicionar folga",
        description: "Não foi possível adicionar a folga.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFolga = async (folgaId: string) => {
    console.log("Iniciando exclusão de folga:", folgaId);
    
    if (!folgaId) {
      console.error("ID da folga não fornecido");
      toast({
        title: "Erro",
        description: "ID da folga não encontrado.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Tentando excluir folga do Supabase...");
      
      const { error } = await supabase
        .from("crediario_folgas")
        .delete()
        .eq("id", folgaId);
        
      if (error) {
        console.error("Erro do Supabase ao excluir folga:", error);
        toast({
          title: "Erro ao remover folga",
          description: `Erro: ${error.message}`,
          variant: "destructive",
        });
        return;
      }
      
      console.log("Folga excluída com sucesso do banco. Atualizando estado...");
      
      // Remove folga from state - usando função de callback para garantir estado atual
      setFolgas(prevFolgas => {
        const folgasAtualizadas = prevFolgas.filter((folga) => folga.id !== folgaId);
        console.log("Folgas antes da exclusão:", prevFolgas.length);
        console.log("Folgas após a exclusão:", folgasAtualizadas.length);
        return folgasAtualizadas;
      });
      
      // Atualizar também as folgas do dia selecionado se necessário
      setFolgasDoDiaSelecionado(prevFolgas => prevFolgas.filter(folga => folga.id !== folgaId));
      
      toast({
        title: "Folga removida",
        description: "A folga foi removida com sucesso.",
      });
      
      console.log("Estado atualizado com sucesso");
    } catch (error) {
      console.error("Erro ao excluir folga:", error);
      toast({
        title: "Erro ao remover folga",
        description: "Não foi possível remover a folga. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return {
    handleAddFolga,
    handleDeleteFolga,
  };
}
