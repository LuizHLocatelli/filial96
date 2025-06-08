
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function useMoveisChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: '👋 Olá! Sou seu assistente do setor de móveis. Como posso ajudá-lo hoje?\n\n💡 Posso:\n• Gerar legendas promocionais\n• Responder dúvidas sobre produtos\n• Auxiliar com questões gerais',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const { toast } = useToast();

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Prepare conversation history (last 6 messages for context)
      const conversationHistory = messages.slice(-6).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const { data, error } = await supabase.functions.invoke('moveis-chatbot', {
        body: {
          message: message,
          conversationHistory: conversationHistory
        }
      });

      if (error) throw error;

      if (data?.success) {
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(data?.error || 'Erro na resposta do chatbot');
      }

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro no chatbot",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive",
      });

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Desculpe, ocorreu um erro. Tente novamente em alguns instantes.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: '👋 Olá! Sou seu assistente do setor de móveis. Como posso ajudá-lo hoje?\n\n💡 Posso:\n• Gerar legendas promocionais\n• Responder dúvidas sobre produtos\n• Auxiliar com questões gerais',
        timestamp: new Date()
      }
    ]);
  };

  const quickActions = [
    {
      label: "Gerar legenda promocional",
      message: "Crie uma legenda promocional criativa para um sofá de 3 lugares"
    },
    {
      label: "Dúvidas sobre produtos",
      message: "Quais são as principais características a considerar ao escolher uma mesa de jantar?"
    },
    {
      label: "Tendências",
      message: "Quais são as tendências atuais em móveis e decoração?"
    }
  ];

  return {
    messages,
    isLoading,
    inputMessage,
    setInputMessage,
    sendMessage,
    clearChat,
    quickActions
  };
}
