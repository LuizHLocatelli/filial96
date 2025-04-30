
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface TaskCounts {
  entregas: {
    pendente: number;
    em_andamento: number;
    concluida: number;
    total: number;
  };
  retiradas: {
    pendente: number;
    em_andamento: number;
    concluida: number;
    total: number;
  };
}

export function useTaskCounts() {
  const [taskCounts, setTaskCounts] = useState<TaskCounts>({
    entregas: {
      pendente: 0,
      em_andamento: 0,
      concluida: 0,
      total: 0
    },
    retiradas: {
      pendente: 0,
      em_andamento: 0,
      concluida: 0,
      total: 0
    }
  });

  useEffect(() => {
    const fetchTaskCounts = async () => {
      try {
        // Get counts for entregas
        const { data: entregas, error: entregasError } = await supabase
          .from("tasks")
          .select("status")
          .eq("type", "entrega");
        
        if (entregasError) throw entregasError;
        
        // Get counts for retiradas
        const { data: retiradas, error: retiradasError } = await supabase
          .from("tasks")
          .select("status")
          .eq("type", "retirada");
          
        if (retiradasError) throw retiradasError;
        
        // Calculate counts
        const entregasCounts = {
          pendente: entregas?.filter(t => t.status === "pendente").length || 0,
          em_andamento: entregas?.filter(t => t.status === "em_andamento").length || 0,
          concluida: entregas?.filter(t => t.status === "concluida").length || 0,
          total: entregas?.length || 0
        };
        
        const retiradasCounts = {
          pendente: retiradas?.filter(t => t.status === "pendente").length || 0,
          em_andamento: retiradas?.filter(t => t.status === "em_andamento").length || 0,
          concluida: retiradas?.filter(t => t.status === "concluida").length || 0,
          total: retiradas?.length || 0
        };
        
        setTaskCounts({
          entregas: entregasCounts,
          retiradas: retiradasCounts
        });
      } catch (error) {
        console.error("Erro ao carregar contagens de tarefas:", error);
      }
    };
    
    fetchTaskCounts();
    
    // Subscribe to changes in the tasks table
    const channel = supabase
      .channel('task-counts-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'tasks',
          filter: "type=eq.entrega OR type=eq.retirada"
        }, 
        () => {
          fetchTaskCounts();
        })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return taskCounts;
}
