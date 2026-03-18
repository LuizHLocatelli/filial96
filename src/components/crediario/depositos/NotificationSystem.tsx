import { useEffect, useState, useCallback } from "react";
import { isSameDay, differenceInMinutes, setHours, setMinutes, setSeconds } from "date-fns";
import { toast } from "sonner";
import { Bell, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import type { Deposito } from "@/hooks/crediario/useDepositos";


interface NotificationSystemProps {
  depositos: Deposito[];
  enabled?: boolean;
}

type NotificationType = 'reminder' | 'urgent' | 'missed' | 'success';

interface NotificationConfig {
  dailyReminder: string; // "09:00"
  urgentAlert: string;   // "11:30"
  missedAlert: string;   // "12:01"
  weeklyReport: string;  // "FRIDAY_17:00"
}

export function NotificationSystem({ depositos, enabled = true }: NotificationSystemProps) {
  const [lastNotification, setLastNotification] = useState<string>("");
  

  
  // Função para obter notificações do localStorage
  const getStoredNotifications = (): Set<string> => {
    try {
      const stored = localStorage.getItem('depositNotifications');
      const data = stored ? JSON.parse(stored) : {};
      const today = new Date().toDateString();
      return new Set<string>(data[today] || []);
    } catch {
      return new Set<string>();
    }
  };

  // Função para salvar notificações no localStorage
  const saveNotificationsToStorage = (notifications: Set<string>) => {
    try {
      const today = new Date().toDateString();
      const stored = localStorage.getItem('depositNotifications');
      const data = stored ? JSON.parse(stored) : {};
      data[today] = Array.from(notifications);
      localStorage.setItem('depositNotifications', JSON.stringify(data));
    } catch {
      // Falha silenciosa se localStorage não estiver disponível
    }
  };

  const [shownNotifications, setShownNotifications] = useState<Set<string>>(getStoredNotifications);
  const [notificationConfig] = useState<NotificationConfig>({
    dailyReminder: "09:00",
    urgentAlert: "11:30", 
    missedAlert: "12:01",
    weeklyReport: "FRIDAY_17:00"
  });

  const today = new Date();
  const isWeekend = today.getDay() === 0; // Apenas domingo (0) é não obrigatório
  const currentHour = today.getHours();
  const currentMinutes = today.getMinutes();
  
  // Verificar se já tem depósito hoje
  const todayDeposits = depositos.filter(deposito => 
    isSameDay(deposito.data, today)
  );
  
  const hasDepositToday = todayDeposits.length > 0;
  const hasReceiptToday = todayDeposits.some(d => d.comprovante);
  const isIncludedToday = todayDeposits.some(d => d.ja_incluido);
  const isCompleteToday = hasReceiptToday && isIncludedToday;

  const showNotification = (type: NotificationType, message: string, description?: string) => {
    const notificationKey = `${type}-${new Date().toDateString()}`;
    
    // Evitar notificações duplicadas no mesmo dia
    if (shownNotifications.has(notificationKey)) return;
    
    let variant: "default" | "destructive" = "default";
    let icon = Bell;
    
    switch (type) {
      case 'urgent':
        variant = "destructive";
        icon = AlertTriangle;
        break;
      case 'missed':
        variant = "destructive";
        icon = AlertTriangle;
        break;
      case 'success':
        icon = CheckCircle;
        break;
      case 'reminder':
        icon = Clock;
        break;
    }

    toast({
      title: message,
      description: description,
      variant: variant,
      duration: type === 'urgent' || type === 'missed' ? 8000 : 5000,
    });



    setLastNotification(notificationKey);
    const newNotifications = new Set(shownNotifications).add(notificationKey);
    setShownNotifications(newNotifications);
    saveNotificationsToStorage(newNotifications);
  };

  const checkTimeBasedNotifications = () => {
    if (!enabled || isWeekend) return;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // Lembrete diário (09:00)
    if (currentTime === notificationConfig.dailyReminder && !isCompleteToday) {
      showNotification(
        'reminder',
        '🔔 Lembrete: Depósito Bancário',
        'Não esqueça de fazer o depósito até 12:00 e incluir na Tesouraria/P2K.'
      );
    }
    
    // Alerta urgente (11:30)
    if (currentTime === notificationConfig.urgentAlert && !isCompleteToday) {
      showNotification(
        'urgent',
        '⚠️ URGENTE: Depósito Bancário',
        'Faltam apenas 30 minutos para o prazo! Complete o depósito agora.'
      );
    }
    
    // Alerta de perda de prazo (12:01)
    if (currentTime === notificationConfig.missedAlert && !hasDepositToday) {
      showNotification(
        'missed',
        '❌ Prazo Perdido',
        'O prazo para depósito bancário foi perdido. Registre assim que possível.'
      );
    }
  };

  const checkStatusNotifications = () => {
    if (!enabled || isWeekend) return;

    // Notificação de sucesso quando completa o depósito
    if (isCompleteToday) {
      showNotification(
        'success',
        '✅ Depósito Completo!',
        'Parabéns! O depósito foi registrado e incluído na Tesouraria/P2K.'
      );
    }

    // Notificação quando só tem comprovante mas não incluiu no sistema
    if (hasReceiptToday && !isIncludedToday) {
      showNotification(
        'reminder',
        '📋 Ação Pendente',
        'Comprovante anexado! Não esqueça de marcar como incluído na Tesouraria/P2K.'
      );
    }
  };

  // Calcular estatísticas para relatório semanal
  const getWeeklyStats = () => {
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - thisWeek.getDay()); // Início da semana
    
    const weekDeposits = depositos.filter(d => d.data >= thisWeek);
    const completeDays = weekDeposits.filter(d => d.comprovante && d.ja_incluido).length;
    
    return {
      total: weekDeposits.length,
      complete: completeDays,
      rate: weekDeposits.length > 0 ? Math.round((completeDays / weekDeposits.length) * 100) : 0
    };
  };

  const checkWeeklyReport = () => {
    if (!enabled) return;

    const now = new Date();
    const isFriday = now.getDay() === 5;
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    if (isFriday && currentTime === "17:00") {
      const stats = getWeeklyStats();
      showNotification(
        'reminder',
        '📊 Relatório Semanal',
        `Esta semana: ${stats.complete}/${stats.total} depósitos completos (${stats.rate}%)`
      );
    }
  };

  // Verificar notificações de prazo baseadas no tempo restante
  const checkDeadlineNotifications = () => {
    if (!enabled || isWeekend || isCompleteToday) return;

    const now = new Date();
    const deadline = setSeconds(setMinutes(setHours(new Date(), 12), 0), 0);
    const minutesLeft = differenceInMinutes(deadline, now);

    // Notificações específicas de tempo restante
    if (minutesLeft === 60 && !hasDepositToday) {
      showNotification(
        'urgent',
        '⏰ 1 Hora Restante',
        'Resta apenas 1 hora para o depósito bancário!'
      );
    }

    if (minutesLeft === 15 && !isCompleteToday) {
      showNotification(
        'urgent',
        '🚨 15 Minutos Restantes',
        'ATENÇÃO: Últimos 15 minutos para completar o depósito!'
      );
    }
  };

  // Effect para limpar notificações quando o dia muda
  useEffect(() => {
    const today = new Date().toDateString();
    
    // Limpar notificações antigas do localStorage
    try {
      const stored = localStorage.getItem('depositNotifications');
      if (stored) {
        const data = JSON.parse(stored);
        const cleanedData = { [today]: data[today] || [] };
        localStorage.setItem('depositNotifications', JSON.stringify(cleanedData));
      }
    } catch {
      // Falha silenciosa
    }
    
    // Atualizar estado apenas com notificações de hoje
    const todayNotifications = getStoredNotifications();
    setShownNotifications(todayNotifications);
  }, []); // Executa apenas uma vez no mount

  // Effect principal para monitoramento
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      checkTimeBasedNotifications();
      checkStatusNotifications();
      checkWeeklyReport();
      checkDeadlineNotifications();
    }, 60000); // Verificar a cada minuto

    // Verificação inicial
    checkStatusNotifications();

    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, depositos, isCompleteToday, hasReceiptToday, isIncludedToday, notificationConfig]);

  // Função para solicitar permissão de notificações do browser
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };

  // Effect para solicitar permissão
  useEffect(() => {
    if (enabled) {
      requestNotificationPermission();
    }
  }, [enabled]);

  // Componente não renderiza nada visualmente
  return null;
}