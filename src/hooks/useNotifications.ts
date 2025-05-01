
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  created_at: string;
  task_id?: string;
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
        
        // Transform activities to notifications format
        const transformedNotifications: Notification[] = (data || []).map((activity: any) => ({
          id: activity.id,
          title: `Nova tarefa: ${activity.task_title}`,
          message: `${activity.user_name || 'Usuário'} ${activity.action} uma tarefa do tipo ${activity.task_type}`,
          isRead: false, // For now all are unread until we implement read status tracking
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
    // Update the notification state locally
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true } 
          : notification
      )
    );
    
    // Update the unread count
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    // In a real app, you would persist this to a database
    // For now, we're just updating the local state
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => ({ ...notification, isRead: true }))
    );
    setUnreadCount(0);
    
    // In a real app, you would persist this to a database
    // For now, we're just updating the local state
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead
  };
}
