
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

interface LogActivityParams {
  action: string;
  task: Task;
  userId?: string;
  userName?: string;
}

export async function logActivity({ action, task, userId, userName }: LogActivityParams) {
  try {
    console.log("Registrando atividade:", action, task.title, userId, userName);
    
    const { error } = await supabase
      .from("activities")
      .insert({
        action,
        task_id: task.id,
        task_title: task.title,
        task_type: task.type,
        user_id: userId,
        user_name: userName || "Sistema"
      });
      
    if (error) {
      console.error("Erro ao registrar atividade:", error);
    }
    
    return { success: !error };
  } catch (err) {
    console.error("Erro ao registrar atividade:", err);
    return { success: false, error: err };
  }
}

export function useActivityLogger() {
  const { profile } = useAuth();
  
  const logTaskActivity = async (action: string, task: Task) => {
    return logActivity({
      action,
      task,
      userId: profile?.id,
      userName: profile?.name
    });
  };
  
  return { logTaskActivity };
}
