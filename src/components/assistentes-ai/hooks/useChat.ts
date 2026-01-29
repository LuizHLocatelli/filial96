import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import type { Chatbot, Message, UseChatReturn } from '../types';

export function useChat(chatbot: Chatbot): UseChatReturn {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [responseCache] = useState<Map<string, string>>(new Map());
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  }, []);

  const getCacheKey = useCallback((message: string, hasImage: boolean) => {
    return `${chatbot.id}_${message.toLowerCase().trim()}${hasImage ? '_img' : ''}`;
  }, [chatbot.id]);

  const loadConversation = useCallback(async () => {
    if (!user) return;

    const cacheKey = `chat_${chatbot.id}_${user.id}`;

    try {
      const { data, error } = await supabase
        .from('assistentes_conversas')
        .select('*')
        .eq('chatbot_id', chatbot.id)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        setConversationId(data[0].id);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const savedMessages = (data[0].messages as any[]) || [];
        setMessages(savedMessages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp
        })));

        localStorage.setItem(cacheKey, JSON.stringify({
          conversationId: data[0].id,
          messages: savedMessages,
          timestamp: Date.now()
        }));
      } else {
        const { data: newConversation, error: createError } = await supabase
          .from('assistentes_conversas')
          .insert({
            chatbot_id: chatbot.id,
            user_id: user.id,
            messages: []
          })
          .select()
          .single();

        if (createError) throw createError;
        setConversationId(newConversation.id);

        localStorage.setItem(cacheKey, JSON.stringify({
          conversationId: newConversation.id,
          messages: [],
          timestamp: Date.now()
        }));
      }
    } catch (err) {
      console.error('Error loading conversation:', err);
      
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setConversationId(parsed.conversationId);
          setMessages(parsed.messages || []);
        } catch (e) {
          console.error('Error parsing cached conversation:', e);
        }
      }
    }
  }, [chatbot.id, user]);

  const saveConversation = useCallback(async (updatedMessages: Message[]) => {
    const cacheKey = `chat_${chatbot.id}_${user?.id}`;

    try {
      if (conversationId) {
        await supabase
          .from('assistentes_conversas')
          .update({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            messages: updatedMessages as any,
            updated_at: new Date().toISOString()
          })
          .eq('id', conversationId);
      }

      localStorage.setItem(cacheKey, JSON.stringify({
        conversationId,
        messages: updatedMessages,
        timestamp: Date.now()
      }));
    } catch (err) {
      console.error('Error saving conversation:', err);
      
      localStorage.setItem(cacheKey, JSON.stringify({
        conversationId,
        messages: updatedMessages,
        timestamp: Date.now()
      }));
    }
  }, [chatbot.id, conversationId, user?.id]);

  const streamText = useCallback((text: string, messageId: string) => {
    setIsTyping(true);
    setTypingText('');

    const words = text.split(' ');
    let currentIndex = 0;

    const typeNextWord = () => {
      if (currentIndex < words.length) {
        setTypingText(prev => prev + (currentIndex > 0 ? ' ' : '') + words[currentIndex]);
        currentIndex++;
        
        const delay = Math.min(Math.max(30, 80 - words.length / 15), 120);
        typingTimeoutRef.current = setTimeout(typeNextWord, delay);
      } else {
        setIsTyping(false);
        setTypingText('');
        setMessages(prev => prev.map(msg =>
          msg.id === messageId ? { ...msg, content: text, isStreaming: false } : msg
        ));
      }
    };

    typeNextWord();
  }, []);

  const sendMessageToWebhook = useCallback(async (
    message: string, 
    imageFile?: File, 
    attempt: number = 1
  ): Promise<string> => {
    const cacheKey = getCacheKey(message, !!imageFile);

    if (responseCache.has(cacheKey) && !imageFile) {
      return responseCache.get(cacheKey)!;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const formData = new FormData();
      formData.append('message', message);
      formData.append('chatbot_id', chatbot.id);
      formData.append('user_id', user?.id || '');
      formData.append('conversation_id', conversationId || '');

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await fetch(chatbot.webhook_url, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`Status: ${response.status}`);

      const data = await response.json();
      let botResponse = data.response || data.message || data.text || data.content || data.answer || (typeof data === 'string' ? data : JSON.stringify(data));

      if (typeof botResponse === 'string' && botResponse.startsWith('{') && botResponse.endsWith('}')) {
        try {
          const parsed = JSON.parse(botResponse);
          botResponse = parsed.output || parsed.response || parsed.message || parsed.text || botResponse;
        } catch {
          // Ignora erro de parse JSON
        }
      }

      const finalResponse = botResponse || 'Desculpe, não consegui processar sua mensagem.';

      if (!imageFile) {
        responseCache.set(cacheKey, finalResponse);
        if (responseCache.size > 50) {
          const firstKey = responseCache.keys().next().value;
          responseCache.delete(firstKey);
        }
      }

      return finalResponse;
    } catch (err) {
      if (attempt < 3) {
        await new Promise(r => setTimeout(r, 1000 * attempt));
        return sendMessageToWebhook(message, imageFile, attempt + 1);
      }
      throw new Error('Conexão falhou. Verifique sua internet ou tente mais tarde.');
    }
  }, [chatbot.id, chatbot.webhook_url, conversationId, getCacheKey, responseCache, user?.id]);

  const sendMessage = useCallback(async (content: string, imageFile?: File) => {
    if (!content.trim() && !imageFile) return;

    setError(null);
    setLoading(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      imageUrl: imageFile ? URL.createObjectURL(imageFile) : undefined,
      timestamp: new Date().toISOString(),
      status: 'sent'
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    try {
      const botResponse = await sendMessageToWebhook(userMessage.content, imageFile);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: '',
        timestamp: new Date().toISOString(),
        isStreaming: true
      };

      const messagesWithBot = [...updatedMessages, botMessage];
      setMessages(messagesWithBot);
      setLoading(false);

      streamText(botResponse, botMessage.id);

      setTimeout(async () => {
        const finalMessages = messagesWithBot.map(msg =>
          msg.id === botMessage.id ? { ...msg, content: botResponse, isStreaming: false } : msg
        );
        await saveConversation(finalMessages);
      }, botResponse.split(' ').length * 100 + 500);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Ocorreu um erro inesperado.';
      setError(errorMsg);

      const errorMessageObj: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: errorMsg,
        timestamp: new Date().toISOString()
      };

      const finalMessages = [...updatedMessages, errorMessageObj];
      setMessages(finalMessages);
      await saveConversation(finalMessages);
      setLoading(false);
    }
  }, [messages, saveConversation, sendMessageToWebhook, streamText]);

  const retryMessage = useCallback(() => {
    const lastUserMessage = messages.findLast(m => m.type === 'user');
    if (lastUserMessage) {
      setError(null);
      const filteredMessages = messages.filter(m => m.id !== lastUserMessage.id);
      setMessages(filteredMessages);
      sendMessage(lastUserMessage.content);
    }
  }, [messages, sendMessage]);

  const clearConversation = useCallback(async () => {
    if (!user) return;

    try {
      const { data: newConversation, error: createError } = await supabase
        .from('assistentes_conversas')
        .insert({
          chatbot_id: chatbot.id,
          user_id: user.id,
          messages: []
        })
        .select()
        .single();

      if (createError) throw createError;

      setConversationId(newConversation.id);
      setMessages([]);
      setError(null);

      toast({
        title: 'Nova conversa',
        description: 'Histórico limpo para esta sessão.',
      });
    } catch (err) {
      console.error('Error creating new conversation:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível iniciar uma nova conversa.',
        variant: 'destructive',
      });
    }
  }, [chatbot.id, toast, user]);

  useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingText, isTyping, scrollToBottom]);

  return {
    messages,
    loading,
    error,
    conversationId,
    isTyping,
    typingText,
    sendMessage,
    retryMessage,
    clearConversation,
    scrollToBottom
  };
}
