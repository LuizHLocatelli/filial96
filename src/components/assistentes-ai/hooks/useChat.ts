import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import type { Chatbot, Message, UseChatReturn, WebhookResponse, LegendasResponse, N8nFileData } from '../types';

export function useChat(chatbot: Chatbot): UseChatReturn {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [isVideoLoading, setIsVideoLoading] = useState(false);
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

  const parseWebhookResponse = (data: WebhookResponse | N8nFileData[]): {
    text: string;
    videoUrl?: string;
    legendas?: LegendasResponse;
    generateVideo?: boolean;
    videoError?: string;
  } => {
    // Verifica se é array de arquivos (formato n8n com binary data)
    if (Array.isArray(data) && data.length > 0) {
      const fileData = data[0];
      if (fileData.fileType === 'video' || fileData.mimeType?.startsWith('video/')) {
        // Constrói URL do arquivo a partir do ID do n8n
        const fileId = fileData.id;
        // URL padrão do n8n para acessar arquivos binários
        // Codifica o fileId para lidar com caracteres especiais como ':' e '/'
        const encodedFileId = encodeURIComponent(fileId);
        
        // Extrai a base URL do n8n (remove /webhook/ ou /webhook-test/ e tudo depois)
        let baseUrl = chatbot.webhook_url;
        if (baseUrl.includes('/webhook-test/')) {
          baseUrl = baseUrl.split('/webhook-test/')[0];
        } else if (baseUrl.includes('/webhook/')) {
          baseUrl = baseUrl.split('/webhook/')[0];
        }
        
        const videoUrl = fileId.startsWith('http') 
          ? fileId 
          : `${baseUrl}/rest/binary-data/${fileId}`;
        
        console.log('[Parse Response] Detected video file from n8n:', {
          fileName: fileData.fileName,
          fileSize: fileData.fileSize,
          fileId: fileId,
          baseUrl,
          webhookUrl: chatbot.webhook_url,
          videoUrl,
          note: 'IMPORTANTE: O endpoint /rest/binary-data/ requer autenticação do n8n. Configure o workflow para retornar uma URL pública do vídeo (S3, CloudFront, etc).'
        });
        
        // Verifica se a URL é acessível (não é um endpoint protegido do n8n)
        const isN8nBinaryEndpoint = videoUrl.includes('/rest/binary-data/');
        
        if (isN8nBinaryEndpoint) {
          console.warn('[Parse Response] N8N binary data endpoint detected - requires authentication');
          return {
            text: `⚠️ **Vídeo gerado com sucesso!**\n\n📁 Arquivo: ${fileData.fileName}\n📊 Tamanho: ${fileData.fileSize}\n\n**Nota:** O vídeo foi gerado pelo Veo 3.1, mas não pode ser exibido diretamente pois o n8n requer autenticação para acessar arquivos binários.\n\n**Soluções:**\n1. Configure o workflow do n8n para fazer upload do vídeo para S3/CloudFront e retornar a URL pública\n2. Ou faça o download manual do vídeo através do painel do n8n`,
            videoUrl,
            generateVideo: false,
            videoError: 'Endpoint protegido - configure URL pública no workflow do n8n'
          };
        }
        
        return {
          text: `Vídeo gerado com sucesso: ${fileData.fileName} (${fileData.fileSize})`,
          videoUrl,
          generateVideo: false
        };
      }
    }

    // Cast para WebhookResponse após verificar que não é array
    const responseData = data as WebhookResponse;

    // Extrai flags de geração de vídeo
    const shouldGenerateVideo = responseData.response?.generate_video || 
                                 responseData.response?.video_prompt || 
                                 responseData.generate_video || 
                                 responseData.video_prompt;
    
    // Verifica se há erro na geração do vídeo
    const videoError = responseData.response?.videoError || responseData.videoError;

    // Estrutura nova: { response: { legendas, videoUrl, text, generate_video } }
    if (responseData.response) {
      return {
        text: responseData.response.text || responseData.response.message || '',
        videoUrl: responseData.response.videoUrl,
        legendas: responseData.response.legendas,
        generateVideo: !!shouldGenerateVideo,
        videoError
      };
    }

    // Estrutura alternativa: { videoUrl, legendas, text, generate_video }
    if (responseData.videoUrl || responseData.legendas || shouldGenerateVideo) {
      return {
        text: responseData.text || responseData.message || '',
        videoUrl: responseData.videoUrl,
        legendas: responseData.legendas,
        generateVideo: !!shouldGenerateVideo,
        videoError
      };
    }

    // Fallback para estrutura antiga (texto simples)
    let textResponse = responseData.text || responseData.message || responseData.output || '';
    
      // Tenta parsear se for string JSON
    if (typeof textResponse === 'string' && textResponse.startsWith('{') && textResponse.endsWith('}')) {
      try {
        const parsed = JSON.parse(textResponse);
        const parsedShouldGenerate = parsed.generate_video || parsed.video_prompt;
        
        if (parsed.legendas || parsed.videoUrl || parsedShouldGenerate) {
          return {
            text: parsed.text || parsed.message || '',
            videoUrl: parsed.videoUrl,
            legendas: parsed.legendas,
            generateVideo: !!parsedShouldGenerate,
            videoError: parsed.videoError
          };
        }
        textResponse = parsed.output || parsed.response || parsed.message || parsed.text || textResponse;
      } catch (parseError) {
        console.error('[Parse Response Error] Failed to parse JSON response:', parseError);
        console.error('[Parse Response Error] Raw text:', textResponse.substring(0, 200));
      }
    }

    return { 
      text: textResponse || 'Desculpe, não consegui processar sua mensagem.',
      generateVideo: false 
    };
  };

  const sendMessageToWebhook = useCallback(async (
    message: string, 
    imageFile?: File, 
    attempt: number = 1,
    abortSignal?: AbortSignal
  ): Promise<{ text: string; videoUrl?: string; legendas?: LegendasResponse; generateVideo?: boolean; videoError?: string }> => {
    const cacheKey = getCacheKey(message, !!imageFile);

    if (responseCache.has(cacheKey) && !imageFile) {
      const cached = responseCache.get(cacheKey)!;
      try {
        return JSON.parse(cached);
      } catch {
        return { text: cached };
      }
    }

    try {
      const controller = new AbortController();
      // Timeout de 10 minutos para o Veo 3.1 Fast gerar o vídeo
      const timeoutId = setTimeout(() => controller.abort(), 600000);

      // Listen to external abort signal
      if (abortSignal) {
        abortSignal.addEventListener('abort', () => controller.abort());
      }

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

      const data: WebhookResponse = await response.json();
      
      const parsed = parseWebhookResponse(data);

      // Ativa loading de vídeo apenas se deve gerar vídeo mas ainda não tem URL
      if (parsed.generateVideo && !parsed.videoUrl && !parsed.videoError) {
        setIsVideoLoading(true);
      } else {
        setIsVideoLoading(false);
      }

      if (!imageFile) {
        responseCache.set(cacheKey, JSON.stringify(parsed));
        if (responseCache.size > 50) {
          const firstKey = responseCache.keys().next().value;
          responseCache.delete(firstKey);
        }
      }

      return parsed;
    } catch (err) {
      setIsVideoLoading(false);
      if (attempt < 3 && !(err instanceof Error && err.name === 'AbortError')) {
        await new Promise(r => setTimeout(r, 1000 * attempt));
        return sendMessageToWebhook(message, imageFile, attempt + 1, abortSignal);
      }
      throw new Error('Conexão falhou. Verifique sua internet ou tente mais tarde.');
    }
    // parseWebhookResponse não precisa ser dependência pois é definida no mesmo escopo e não depende de valores externos
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatbot.id, chatbot.webhook_url, conversationId, getCacheKey, responseCache, user?.id]);

  const sendMessage = useCallback(async (content: string, imageFile?: File) => {
    if (!content.trim() && !imageFile) return;

    setError(null);
    setLoading(true);

    // Criar URL da imagem e armazenar para cleanup
    let imageUrl: string | undefined;
    if (imageFile) {
      imageUrl = URL.createObjectURL(imageFile);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      imageUrl,
      timestamp: new Date().toISOString(),
      status: 'sent'
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // AbortController para cancelar requisição se necessário
    const abortController = new AbortController();

    try {
      const botResponse = await sendMessageToWebhook(userMessage.content, imageFile, 1, abortController.signal);

      // Determina se deve mostrar loading de vídeo
      // Mostra loading se: deve gerar vídeo (generateVideo=true) AND não tem URL ainda AND não tem erro
      const shouldShowVideoLoading = botResponse.generateVideo && !botResponse.videoUrl && !botResponse.videoError;

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: botResponse.text,
        videoUrl: botResponse.videoUrl,
        legendas: botResponse.legendas,
        isVideoLoading: shouldShowVideoLoading,
        videoError: botResponse.videoError,
        timestamp: new Date().toISOString(),
        isStreaming: true
      };

      const messagesWithBot = [...updatedMessages, botMessage];
      setMessages(messagesWithBot);
      setLoading(false);

      streamText(botResponse.text, botMessage.id);

      const textLength = botResponse.text?.split(' ').length || 0;
      setTimeout(async () => {
        const finalMessages = messagesWithBot.map(msg =>
          msg.id === botMessage.id
            ? { ...msg, content: botResponse.text, isStreaming: false, isVideoLoading: shouldShowVideoLoading }
            : msg
        );
        await saveConversation(finalMessages);
      }, textLength * 100 + 500);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Ocorreu um erro inesperado.';
      setError(errorMsg);
      setIsVideoLoading(false);

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
    } finally {
      // Cleanup da URL da imagem
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    }
  }, [messages, saveConversation, sendMessageToWebhook, streamText]);
  // chatbot.id, conversationId e user?.id são usados internamente em sendMessageToWebhook

  const retryMessage = useCallback(() => {
    const lastUserMessage = [...messages].reverse().find(m => m.type === 'user');
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
    isVideoLoading,
    sendMessage,
    retryMessage,
    clearConversation,
    scrollToBottom
  };
}
