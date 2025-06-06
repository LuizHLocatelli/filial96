import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
  
  // Refs para controle de estado e cleanup
  const channelRef = useRef<any>(null);
  const fetchingRef = useRef(false);
  const mountedRef = useRef(true);

  // Função para buscar notificações
  const fetchNotifications = useCallback(async () => {
    if (!profile?.id || fetchingRef.current) return;
    
    try {
      fetchingRef.current = true;
      setIsLoading(true);
      
      console.log("🔔 Buscando atividades para notificações...");
      
      // Get activities for tasks
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(20);
      
      if (error) {
        console.error("❌ Erro ao buscar atividades:", error);
        throw error;
      }
      
      console.log(`✅ Atividades obtidas: ${data?.length || 0}`);
      
      // Buscar o status de leitura das atividades para este usuário
      const { data: readStatusData, error: readStatusError } = await supabase
        .from("notification_read_status")
        .select("*")
        .eq("user_id", profile.id);
        
      if (readStatusError) {
        console.error("⚠️ Erro ao buscar status de leitura:", readStatusError);
      }
      
      // Criar um mapa de atividades lidas para fácil verificação
      const readActivityMap = new Map();
      if (readStatusData) {
        readStatusData.forEach((status: any) => {
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
      
      if (mountedRef.current) {
        setNotifications(transformedNotifications);
        setUnreadCount(transformedNotifications.filter(n => !n.isRead).length);
      }
    } catch (error) {
      console.error("❌ Erro ao buscar notificações:", error);
      if (mountedRef.current) {
        toast({
          title: "Erro ao carregar notificações",
          description: "Não foi possível carregar as notificações. Tente novamente.",
          variant: "destructive"
        });
      }
    } finally {
      fetchingRef.current = false;
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [profile?.id, toast]);

  // Função para configurar subscription em tempo real
  const setupRealtimeSubscription = useCallback(() => {
    if (!profile?.id) return;

    // Limpar subscription anterior se existir
    if (channelRef.current) {
      console.log("🧹 Removendo canal anterior...");
      supabase.removeChannel(channelRef.current);
    }

    // Set up real-time subscription for new activities
    const channel = supabase
      .channel(`activities-channel-${profile.id}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'activities'
        }, 
        (payload) => {
          console.log("🆕 Nova atividade detectada:", payload);
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
          
          console.log("📬 Nova notificação criada:", newNotification);
          
          if (mountedRef.current) {
            // Add the new notification to the state
            setNotifications(prev => [newNotification, ...prev.slice(0, 19)]); // Manter apenas 20
            setUnreadCount(prev => prev + 1);
            
            // Show toast notification
            toast({
              title: newNotification.title,
              description: newNotification.message,
            });
          }
        })
      .subscribe((status) => {
        console.log("📡 Status da subscription:", status);
        if (status === 'SUBSCRIBED') {
          console.log("✅ Canal de notificações conectado");
        } else if (status === 'CHANNEL_ERROR') {
          console.error("❌ Erro no canal de notificações");
          // Tentar reconectar após um delay
          setTimeout(() => {
            if (mountedRef.current) {
              setupRealtimeSubscription();
            }
          }, 5000);
        }
      });
      
    channelRef.current = channel;
  }, [profile?.id, toast]);

  // Effect para buscar notificações e configurar subscription
  useEffect(() => {
    if (!profile?.id) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }
    
    fetchNotifications();
    setupRealtimeSubscription();
    
    return () => {
      if (channelRef.current) {
        console.log("🧹 Removendo canal de notificações...");
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [profile?.id, fetchNotifications, setupRealtimeSubscription]);

  // Effect para cleanup no desmonte
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Mark a notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      if (!profile?.id) return;
      
      // Update local state first for immediate feedback
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
        console.error("❌ Erro ao marcar notificação como lida:", error);
        // Reverter estado local em caso de erro
        setNotifications(prevNotifications => 
          prevNotifications.map(notification => 
            notification.id === notificationId 
              ? { ...notification, isRead: false } 
              : notification
          )
        );
        setUnreadCount(prev => prev + 1);
        
        toast({
          title: "Erro ao marcar notificação",
          description: "Não foi possível marcar a notificação como lida.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("❌ Erro ao marcar notificação como lida:", error);
    }
  }, [profile?.id, toast]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      if (!profile?.id) return;
      
      const unreadNotifications = notifications.filter(n => !n.isRead);
      if (unreadNotifications.length === 0) return;
      
      // Update local state first for immediate feedback
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);
      
      // Prepare data for batch upsert
      const upsertData = unreadNotifications.map(notification => ({
        user_id: profile.id,
        activity_id: notification.id,
        read: true
      }));
      
      // Persistir a marcação em lote no banco de dados
      const { error } = await supabase
        .from("notification_read_status")
        .upsert(upsertData);
      
      if (error) {
        console.error("❌ Erro ao marcar todas as notificações como lidas:", error);
        // Reverter estado local em caso de erro
        setNotifications(prevNotifications => 
          prevNotifications.map(notification => {
            const wasUnread = unreadNotifications.some(unread => unread.id === notification.id);
            return wasUnread ? { ...notification, isRead: false } : notification;
          })
        );
        setUnreadCount(unreadNotifications.length);
        
        toast({
          title: "Erro ao marcar notificações",
          description: "Não foi possível marcar todas as notificações como lidas.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("❌ Erro ao marcar todas as notificações como lidas:", error);
    }
  }, [notifications, profile?.id, toast]);

  // Função para refrescar notificações manualmente
  const refreshNotifications = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refreshNotifications
  };
}
