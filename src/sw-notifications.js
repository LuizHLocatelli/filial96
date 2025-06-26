// Service Worker Extensions for PWA Notifications
// Este arquivo contém extensões para o service worker principal para suportar notificações avançadas

// Listener para cliques em notificações
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.notification.tag, event.action);
  
  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};
  
  // Fechar a notificação
  notification.close();
  
  // Função para abrir uma URL
  const openURL = (url) => {
    return clients.matchAll().then((clientList) => {
      // Procurar se já existe uma janela aberta com o domínio
      const existingClient = clientList.find(client => 
        client.url.includes(self.location.origin) && 'focus' in client
      );
      
      if (existingClient) {
        // Se já existe, focar nela e navegar
        existingClient.focus();
        existingClient.postMessage({
          type: 'NAVIGATE_TO',
          url: url
        });
        return existingClient;
      } else {
        // Se não existe, abrir nova janela
        return clients.openWindow(url);
      }
    });
  };

  // Enviar mensagem para o cliente principal
  const sendMessage = (type, payload) => {
    clients.matchAll().then(clientList => {
      clientList.forEach(client => {
        client.postMessage({
          type: type,
          ...payload
        });
      });
    });
  };

  // Processar ações baseadas no tag da notificação e ação
  if (action) {
    switch (action) {
      case 'open-deposits':
        event.waitUntil(openURL('/crediario#depositos'));
        break;
        
      case 'open-folgas':
        // Determinar qual setor baseado no contexto
        const folgasUrl = data.sector === 'moda' ? '/moda#folgas' : 
                         data.sector === 'moveis' ? '/moveis#folgas' : 
                         '/crediario#folgas';
        event.waitUntil(openURL(folgasUrl));
        break;
        
      case 'open-reservas':
        event.waitUntil(openURL('/moda#reservas'));
        break;
        
      case 'open-goals':
        event.waitUntil(openURL('/hub-produtividade#metas'));
        break;
        
      case 'view-task':
        const taskUrl = data.taskId ? 
          `/hub-produtividade#tarefas?task=${data.taskId}` : 
          '/hub-produtividade#tarefas';
        event.waitUntil(openURL(taskUrl));
        break;
        
      case 'complete-task':
        // Enviar mensagem para marcar tarefa como concluída
        sendMessage('NOTIFICATION_ACTION', {
          action: 'complete-task',
          notificationTag: notification.tag,
          data: data
        });
        break;
        
      case 'remind-later':
        // Agendar nova notificação em 30 minutos
        setTimeout(() => {
          self.registration.showNotification('🔔 Lembrete: Depósito Bancário', {
            body: 'Lembrete reagendado - Não esqueça do depósito bancário!',
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            tag: 'deposit-reminder-later',
            requireInteraction: true,
            actions: [
              { action: 'open-deposits', title: 'Abrir Depósitos' }
            ]
          });
        }, 30 * 60 * 1000); // 30 minutos
        
        sendMessage('NOTIFICATION_ACTION', {
          action: 'remind-later',
          notificationTag: notification.tag
        });
        break;
        
      case 'remind-tomorrow':
        // Agendar para amanhã mesmo horário
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const delay = tomorrow.getTime() - Date.now();
        
        setTimeout(() => {
          self.registration.showNotification('📅 Lembrete de Folgas', {
            body: 'Lembrete: Solicitar folgas hoje!',
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            tag: 'folga-reminder-tomorrow',
            actions: [
              { action: 'open-folgas', title: 'Ver Folgas' }
            ]
          });
        }, delay);
        
        sendMessage('NOTIFICATION_ACTION', {
          action: 'remind-tomorrow',
          notificationTag: notification.tag
        });
        break;
        
      case 'update-now':
        // Recarregar todas as abas abertas
        clients.matchAll().then(clientList => {
          clientList.forEach(client => {
            client.navigate(client.url);
          });
        });
        break;
        
      case 'extend-reservation':
        sendMessage('NOTIFICATION_ACTION', {
          action: 'extend-reservation',
          notificationTag: notification.tag,
          data: data
        });
        break;
        
      default:
        // Ação genérica - enviar mensagem para o cliente
        sendMessage('NOTIFICATION_ACTION', {
          action: action,
          notificationTag: notification.tag,
          data: data
        });
        break;
    }
  } else {
    // Clique direto na notificação (sem ação específica)
    switch (notification.tag) {
      case 'deposit-reminder':
      case 'deposit-urgent':
        event.waitUntil(openURL('/crediario#depositos'));
        break;
        
      case 'new-task':
        const taskUrl = data.taskId ? 
          `/hub-produtividade#tarefas?task=${data.taskId}` : 
          '/hub-produtividade#tarefas';
        event.waitUntil(openURL(taskUrl));
        break;
        
      case 'folga-reminder':
        event.waitUntil(openURL('/moveis#folgas'));
        break;
        
      case 'reserva-expiring':
        event.waitUntil(openURL('/moda#reservas'));
        break;
        
      case 'goal-progress':
        event.waitUntil(openURL('/hub-produtividade#metas'));
        break;
        
      case 'system-update':
        event.waitUntil(openURL('/'));
        break;
        
      default:
        // Abrir página principal
        event.waitUntil(openURL('/'));
        break;
    }
  }
});

// Listener para fechar notificações
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event.notification.tag);
  
  // Você pode adicionar analytics ou lógica específica aqui
  // Por exemplo, marcar que o usuário ignorou a notificação
});

// Função auxiliar para criar notificações padronizadas
self.createStandardNotification = (title, body, options = {}) => {
  const defaultOptions = {
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    requireInteraction: false,
    ...options
  };
  
  return self.registration.showNotification(title, {
    body,
    ...defaultOptions
  });
};

// Função para agendar notificações recorrentes
self.scheduleRecurringNotification = (title, body, options, interval) => {
  const schedule = () => {
    self.createStandardNotification(title, body, options);
    setTimeout(schedule, interval);
  };
  
  setTimeout(schedule, interval);
};

console.log('🔔 Service Worker Notifications Extension loaded');
