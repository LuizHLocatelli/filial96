import { useState, useCallback, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  isError?: boolean;
}

interface ChatBotState {
  isOpen: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  isTyping: boolean;
  sessionId: string;
}

const WEBHOOK_URL = 'https://eomn3vt80t8y5rn.m.pipedream.net/';
const REQUEST_TIMEOUT = 30000; // 30 segundos

export function useChatBot() {
  const [state, setState] = useState<ChatBotState>({
    isOpen: false,
    messages: [
      {
        id: uuidv4(),
        content: 'Bem-vindo! 👋 Sou seu assistente virtual e estou aqui para ajudar com suas dúvidas. Como posso ser útil hoje?',
        isUser: false,
        timestamp: new Date(),
      }
    ],
    isLoading: false,
    isTyping: false,
    sessionId: uuidv4(),
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll para o final das mensagens
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (state.messages.length > 0) {
      scrollToBottom();
    }
  }, [state.messages, scrollToBottom]);

  const openChat = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: true }));
  }, []);

  const closeChat = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const toggleChat = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: !prev.isOpen }));
  }, []);

  const clearConversation = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: [
        {
          id: uuidv4(),
          content: 'O histórico foi limpo! Estou pronto para uma nova conversa.',
          isUser: false,
          timestamp: new Date(),
        }
      ],
      sessionId: uuidv4(),
    }));
  }, []);

  const addMessage = useCallback((content: string, isUser: boolean, isError?: boolean) => {
    const message: ChatMessage = {
      id: uuidv4(),
      content,
      isUser,
      timestamp: new Date(),
      isError,
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, message],
    }));

    return message;
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || state.isLoading) return;

    // Adicionar mensagem do usuário
    addMessage(content, true);

    // Configurar estado de carregamento
    setState(prev => ({
      ...prev,
      isLoading: true,
      isTyping: true,
    }));

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      const payload = {
        message: content,
        timestamp: new Date().toISOString(),
        sessionId: state.sessionId,
      };

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Simular delay de digitação para melhor UX
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Adicionar resposta do bot
      const botResponse = data.response || data.message || 'Desculpe, não consegui processar sua mensagem.';
      addMessage(botResponse, false);

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      let errorMessage = 'Desculpe, ocorreu um erro. Tente novamente.';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Timeout: A requisição demorou muito para responder.';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Erro de conexão. Verifique sua internet.';
        }
      }

      addMessage(errorMessage, false, true);
    } finally {
      setState(prev => ({
        ...prev,
        isLoading: false,
        isTyping: false,
      }));
    }
  }, [state.isLoading, state.sessionId, addMessage]);

  return {
    ...state,
    messagesEndRef,
    openChat,
    closeChat,
    toggleChat,
    clearConversation,
    sendMessage,
  };
}