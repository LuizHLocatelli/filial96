import { useState, useCallback } from 'react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatbotState {
  messages: Message[];
  isTyping: boolean;
  isOpen: boolean;
}

export function useChatbot() {
  const [state, setState] = useState<ChatbotState>({
    messages: [],
    isTyping: false,
    isOpen: false,
  });

  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const addMessage = useCallback((text: string, isUser: boolean) => {
    const newMessage: Message = {
      id: generateId(),
      text,
      isUser,
      timestamp: new Date(),
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));
  }, []);

  const setTyping = useCallback((isTyping: boolean) => {
    setState(prev => ({
      ...prev,
      isTyping,
    }));
  }, []);

  const toggleChatbot = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: !prev.isOpen,
    }));
  }, []);

  const clearMessages = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: [],
    }));
  }, []);

  const getSmartResponse = useCallback((userMessage: string): string => {
    const msg = userMessage.toLowerCase();
    
    if (msg.includes("olá") || msg.includes("oi") || msg.includes("bom dia") || msg.includes("boa tarde")) {
      return "Olá! Sou seu assistente de produtividade. Como posso ajudar você hoje?";
    } 
    
    if (msg.includes("ajuda") || msg.includes("help")) {
      return "Estou aqui para ajudar! Posso responder perguntas sobre:\n• Rotinas e tarefas\n• Dicas de produtividade\n• Organização do trabalho\n• Orientações da empresa\n\nO que você gostaria de saber?";
    }
    
    if (msg.includes("rotina") || msg.includes("rotinas")) {
      return "Para gerenciar suas rotinas:\n• Acesse a aba 'Rotinas' no Hub\n• Marque as tarefas concluídas\n• Defina prioridades\n• Mantenha um cronograma consistente";
    }
    
    if (msg.includes("produtividade") || msg.includes("produtivo")) {
      return "Dicas para aumentar sua produtividade:\n• Use a técnica Pomodoro (25min foco + 5min pausa)\n• Priorize tarefas importantes\n• Elimine distrações\n• Faça pausas regulares\n• Mantenha sua área de trabalho organizada";
    }
    
    if (msg.includes("tarefa") || msg.includes("tarefas")) {
      return "Para organizar suas tarefas:\n• Use listas de prioridades\n• Defina prazos realistas\n• Divida tarefas grandes em menores\n• Acompanhe o progresso regularmente";
    }
    
    if (msg.includes("relatório") || msg.includes("relatórios")) {
      return "Para acessar relatórios:\n• Vá até a aba 'Relatórios' no Hub\n• Filtre por período ou categoria\n• Export dados quando necessário\n• Analise métricas de performance";
    }
    
    if (msg.includes("monitoramento") || msg.includes("acompanhar")) {
      return "O monitoramento está na aba específica do Hub. Lá você pode:\n• Acompanhar indicadores por cargo\n• Visualizar métricas de performance\n• Receber orientações personalizadas";
    }
    
    if (msg.includes("como") && msg.includes("usar")) {
      return "Para usar o Hub de Produtividade:\n\n1. **Visão Geral**: Veja métricas e atividades\n2. **Rotinas**: Gerencie suas tarefas diárias\n3. **Informativos**: Acesse orientações e documentos\n4. **Monitoramento**: Acompanhe indicadores\n5. **Relatórios**: Analise dados e performance";
    }
    
    if (msg.includes("obrigado") || msg.includes("valeu") || msg.includes("thanks")) {
      return "De nada! Fico feliz em ajudar. Há mais alguma coisa em que eu possa auxiliar?";
    }
    
    if (msg.includes("tchau") || msg.includes("bye") || msg.includes("até logo")) {
      return "Até logo! Estarei aqui sempre que precisar. Tenha um dia produtivo! 🚀";
    }
    
    // Resposta padrão mais inteligente
    return "Entendi sua pergunta! Como assistente de produtividade, posso ajudar com:\n\n• Organização de rotinas e tarefas\n• Dicas para aumentar eficiência\n• Navegação no Hub de Produtividade\n• Orientações sobre relatórios e monitoramento\n\nPoderia reformular sua pergunta ou me dizer especificamente o que precisa?";
  }, []);

  const sendMessage = useCallback((userMessage: string) => {
    if (userMessage.trim() === "") return;

    // Add user message
    addMessage(userMessage, true);
    
    // Set typing indicator
    setTyping(true);
    
    // Simulate AI response with random delay
    setTimeout(() => {
      const response = getSmartResponse(userMessage);
      addMessage(response, false);
      setTyping(false);
    }, Math.random() * 1000 + 1000); // Random delay between 1-2 seconds
  }, [addMessage, setTyping, getSmartResponse]);

  return {
    messages: state.messages,
    isTyping: state.isTyping,
    isOpen: state.isOpen,
    toggleChatbot,
    sendMessage,
    clearMessages,
  };
} 