import { useState, useEffect, useCallback } from 'react';

export interface PWANotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: NotificationAction[];
  requireInteraction?: boolean;
  silent?: boolean;
  timestamp?: number;
  vibrate?: number[];
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export function usePWANotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    const supported = 'Notification' in window && 'serviceWorker' in navigator;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
      
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);
      });
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Erro ao solicitar permissão de notificação:', error);
      return false;
    }
  }, [isSupported]);

  const showLocalNotification = useCallback(async (options: PWANotificationOptions): Promise<boolean> => {
    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/icons/icon-192x192.png',
        badge: options.badge || '/icons/icon-72x72.png',
        tag: options.tag,
        data: options.data,
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
      });

      if (!options.requireInteraction) {
        setTimeout(() => notification.close(), 10000);
      }

      return true;
    } catch (error) {
      console.error('Erro ao mostrar notificação:', error);
      return false;
    }
  }, [permission, requestPermission]);

  const showPersistentNotification = useCallback(async (options: PWANotificationOptions): Promise<boolean> => {
    if (!registration || permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted || !registration) return false;
    }

    try {
      const notificationOptions: any = {
        body: options.body,
        icon: options.icon || '/icons/icon-192x192.png',
        badge: options.badge || '/icons/icon-72x72.png',
        tag: options.tag,
        data: options.data,
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
        vibrate: options.vibrate || [200, 100, 200],
      };

      if (options.actions && options.actions.length > 0) {
        notificationOptions.actions = options.actions;
      }

      await registration.showNotification(options.title, notificationOptions);

      return true;
    } catch (error) {
      console.error('Erro ao mostrar notificação persistente:', error);
      return false;
    }
  }, [registration, permission, requestPermission]);

  const clearAllNotifications = useCallback(async () => {
    if (!registration) return;

    try {
      const notifications = await registration.getNotifications();
      notifications.forEach(notification => notification.close());
    } catch (error) {
      console.error('Erro ao limpar notificações:', error);
    }
  }, [registration]);

  const showDepositReminder = useCallback(() => {
    return showPersistentNotification({
      title: '🔔 Lembrete: Depósito Bancário',
      body: 'Não esqueça de fazer o depósito até 12:00 e incluir na Tesouraria/P2K.',
      tag: 'deposit-reminder',
      requireInteraction: true,
      actions: [
        { action: 'open-deposits', title: 'Abrir Depósitos' },
        { action: 'remind-later', title: 'Lembrar em 30min' }
      ]
    });
  }, [showPersistentNotification]);

  const showUrgentAlert = useCallback(() => {
    return showPersistentNotification({
      title: '⚠️ URGENTE: Depósito Bancário',
      body: 'Faltam apenas 30 minutos para o prazo! Complete o depósito agora.',
      tag: 'deposit-urgent',
      requireInteraction: true,
      vibrate: [300, 100, 300, 100, 300],
      actions: [
        { action: 'open-deposits', title: 'Ir para Depósitos' }
      ]
    });
  }, [showPersistentNotification]);

  const showTaskNotification = useCallback((taskTitle: string, taskDescription: string, taskId?: string) => {
    return showPersistentNotification({
      title: `📋 Nova Tarefa: ${taskTitle}`,
      body: taskDescription,
      tag: 'new-task',
      data: { taskId },
      actions: [
        { action: 'view-task', title: 'Ver Tarefa' },
        { action: 'complete-task', title: 'Marcar como Feita' }
      ]
    });
  }, [showPersistentNotification]);

  return {
    permission,
    isSupported,
    registration,
    requestPermission,
    showLocalNotification,
    showPersistentNotification,
    clearAllNotifications,
    showDepositReminder,
    showUrgentAlert,
    showTaskNotification,
  };
}