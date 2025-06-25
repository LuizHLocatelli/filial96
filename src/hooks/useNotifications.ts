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

  // Função para buscar notificações (sistema removido)
  const fetchNotifications = useCallback(async () => {
    if (!profile?.id || fetchingRef.current) return;
    
    try {
      fetchingRef.current = true;
      setIsLoading(true);
      
      console.log("🔔 Sistema de notificações foi removido");
      
      // Sistema de atividades foi removido - retornar lista vazia
      if (mountedRef.current) {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("❌ Erro ao buscar notificações:", error);
      if (mountedRef.current) {
        toast({
          title: "Sistema de notificações removido",
          description: "O sistema de atividades e notificações foi removido.",
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

  // Função para configurar subscription em tempo real (sistema removido)
  const setupRealtimeSubscription = useCallback(() => {
    if (!profile?.id) return;

    // Limpar subscription anterior se existir
    if (channelRef.current) {
      console.log("🧹 Removendo canal anterior...");
      supabase.removeChannel(channelRef.current);
    }

    // Sistema de atividades foi removido - não há mais subscription necessária
    console.log("📡 Sistema de notificações em tempo real foi removido");
    channelRef.current = null;
  }, [profile?.id]);

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

  // Mark a notification as read (sistema removido)
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      if (!profile?.id) return;
      
      // Sistema de notificações foi removido - apenas atualizar estado local
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true } 
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      console.log("Sistema de notificações foi removido - marcação apenas local");
    } catch (error) {
      console.error("❌ Erro ao marcar notificação como lida:", error);
    }
  }, [profile?.id]);

  // Mark all notifications as read (sistema removido)
  const markAllAsRead = useCallback(async () => {
    try {
      if (!profile?.id) return;
      
      const unreadNotifications = notifications.filter(n => !n.isRead);
      if (unreadNotifications.length === 0) return;
      
      // Sistema de notificações foi removido - apenas atualizar estado local
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);
      
      console.log("Sistema de notificações foi removido - marcação em lote apenas local");
    } catch (error) {
      console.error("❌ Erro ao marcar todas as notificações como lidas:", error);
    }
  }, [notifications, profile?.id]);

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
