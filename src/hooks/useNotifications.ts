
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth";

export interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  created_at: string;
  task_id?: string;
}

// Interface para representar o estado de leitura de notificações no banco de dados
interface NotificationReadState {
  user_id: string;
  activity_id: string;
  read: boolean;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { profile } = useAuth();

  // Fetch notifications on component mount
  useEffect(() => {
    if (!profile?.id) return;
    
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        
        console.log("Buscando atividades para notificações");
        
        // Get activities for tasks (simplified approach for now)
        const { data, error } = await supabase
          .from("activities")
          .select("*")
          .order("timestamp", { ascending: false })
          .limit(10);
        
        if (error) {
          console.error("Erro ao buscar atividades:", error);
          throw error;
        }
        
        console.log("Atividades obtidas:", data?.length || 0, data);
        
        // Buscar o status de leitura das atividades para este usuário
        const { data: readStatusData, error: readStatusError } = await supabase
          .from("notification_read_status")
          .select("*")
          .eq("user_id", profile.id);
          
        if (readStatusError) {
          console.error("Erro ao buscar status de leitura:", readStatusError);
        }
        
        // Criar um mapa de atividades lidas para fácil verificação
        const readActivityMap = new Map();
        if (readStatusData) {
          readStatusData.forEach((status: NotificationReadState) => {
            readActivityMap.set(status.activity_id, status.read);
          });
        }
        
        // Transform activities to notifications format
        const transformedNotifications: Notification[] = (data || []).map((activity: any) => ({
          id: activity.id,
          title: `Nova tarefa: ${activity.task_title}`,
          message: `${activity.user_name || 'Usuário'} ${activity.action} uma tarefa do tipo ${activity.task_type}`,
          isRead: readActivityMap.get(activity.id) === true,
          created_at: activity.timestamp,
          task_id: activity.task_id
        }));
        
        setNotifications(transformedNotifications);
        setUnreadCount(transformedNotifications.filter(n => !n.isRead).length);
      } catch (error) {
        console.error("Erro ao buscar notificações:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNotifications();
    
    // Set up real-time subscription for new activities
    const channel = supabase
      .channel('activities-channel')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'activities'
        }, 
        (payload) => {
          console.log("Nova atividade detectada:", payload);
          const newActivity = payload.new as any;
          
          // Create notification from activity
          const newNotification: Notification = {
            id: newActivity.id,
            title: `Nova tarefa: ${newActivity.task_title}`,
            message: `${newActivity.user_name || 'Usuário'} ${newActivity.action} uma tarefa do tipo ${newActivity.task_type}`,
            isRead: false,
            created_at: newActivity.timestamp,
            task_id: newActivity.task_id
          };
          
          console.log("Nova notificação criada:", newNotification);
          
          // Add the new notification to the state
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show toast notification
          toast({
            title: newNotification.title,
            description: newNotification.message,
          });
        })
      .subscribe();
      
    console.log("Canal de notificações inscrito");
      
    return () => {
      console.log("Removendo canal de notificações");
      supabase.removeChannel(channel);
    };
  }, [profile?.id, toast]);

  // Mark a notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      if (!profile?.id) return;
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true } 
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Persistir a marcação no banco de dados
      const { error } = await supabase
        .from("notification_read_status")
        .upsert({ 
          user_id: profile.id,
          activity_id: notificationId,
          read: true
        });
      
      if (error) {
        console.error("Erro ao marcar notificação como lida:", error);
        throw error;
      }
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      if (!profile?.id) return;
      
      // Update local state first for immediate feedback
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);
      
      // Prepare data for batch upsert
      const upsertData = notifications
        .filter(n => !n.isRead)
        .map(notification => ({
          user_id: profile.id,
          activity_id: notification.id,
          read: true
        }));
      
      if (upsertData.length === 0) return;
      
      // Persistir a marcação em lote no banco de dados
      const { error } = await supabase
        .from("notification_read_status")
        .upsert(upsertData);
      
      if (error) {
        console.error("Erro ao marcar todas as notificações como lidas:", error);
        throw error;
      }
    } catch (error) {
      console.error("Erro ao marcar todas as notificações como lidas:", error);
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead
  };
}
