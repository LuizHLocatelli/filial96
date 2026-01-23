import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Send, Bot, User, Loader2, RefreshCcw, AlertCircle, Image as ImageIcon, X, Paperclip, Mic, MicOff, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { useAurora } from "@/hooks/useAurora";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

interface Chatbot {
  id: string;
  name: string;
  webhook_url: string;
  is_active: boolean;
  accept_images: boolean;
}

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  imageUrl?: string;
  timestamp: string;
  isStreaming?: boolean;
}

interface Conversation {
  id: string;
  chatbot_id: string;
  user_id: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

interface ChatInterfaceProps {
  chatbot: Chatbot;
  onBack: () => void;
}

export function ChatInterface({ chatbot, onBack }: ChatInterfaceProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [responseCache, setResponseCache] = useState<Map<string, string>>(new Map());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const inputRef = useAurora<HTMLDivElement>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'pt-BR';

        recognition.onresult = (event: any) => {
          const resultIndex = event.resultIndex;
          const result = event.results[resultIndex];
          if (result && result[0]) {
            const transcript = result[0].transcript;
            setInputMessage(transcript);
          }
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
          if (event.error !== 'no-speech') {
            toast({
              title: "Erro no reconhecimento de voz",
              description: "Não foi possível capturar sua voz. Tente novamente.",
              variant: "destructive",
            });
          }
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
        setSpeechSupported(true);
      } else {
        setSpeechSupported(false);
      }
    }
  }, [toast]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setInputMessage('');
      recognitionRef.current.start();
    }
  };

  // Scroll to bottom function - melhorado para mobile
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  }, []);

  useEffect(() => {
    loadConversation();
  }, [chatbot.id, user?.id]);

  useEffect(() => {
    // Cleanup timeout on unmount
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingText, isTyping, scrollToBottom]);

  // Typing indicator component
  const TypingIndicator = () => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex gap-3 justify-start"
    >
      <Avatar className="h-8 w-8 shrink-0 border border-primary/20">
        <AvatarFallback className="bg-primary/10">
          <Bot className="h-4 w-4 text-primary" />
        </AvatarFallback>
      </Avatar>
      <div className="bg-muted/50 backdrop-blur-sm rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-primary/5">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[0, 1, 2].map((dot) => (
              <motion.div
                key={dot}
                className="w-1.5 h-1.5 bg-primary/40 rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                transition={{
                  repeat: Infinity,
                  duration: 0.8,
                  delay: dot * 0.15
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Streaming text animation
  const streamText = useCallback((text: string, messageId: string) => {
    setIsTyping(true);
    setTypingText("");

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
        setTypingText("");
        setMessages(prev => prev.map(msg =>
          msg.id === messageId ? { ...msg, content: text, isStreaming: false } : msg
        ));
      }
    };

    typeNextWord();
  }, []);

  // Cache key generator
  const getCacheKey = useCallback((message: string) => {
    return `${chatbot.id}_${message.toLowerCase().trim()}`;
  }, [chatbot.id]);

  // Export conversation
  const handleClearConversation = () => {
    setShowClearDialog(true);
  };

  const clearConversation = async () => {
    setShowClearDialog(false);
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
      setErrorMessage(null);

      toast({
        title: "Nova conversa",
        description: "Histórico limpo para esta sessão.",
      });
    } catch (error) {
      console.error('Error creating new conversation:', error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar uma nova conversa.",
        variant: "destructive",
      });
    }
  };

  // Retry send message after error
  const retrySendMessage = () => {
    const lastUserMessage = messages.findLast(m => m.type === 'user');
    if (lastUserMessage) {
      setErrorMessage(null);
      setMessages(prev => prev.filter(m => m.id !== lastUserMessage.id || prev.filter(x => x.type === 'user').pop()?.id !== m.id));
      sendMessage(lastUserMessage.content);
    }
  };

  const loadConversation = async () => {
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
        const savedMessages = (data[0].messages as any[]) || [];
        const formattedMessages = savedMessages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp
        }));
        setMessages(formattedMessages);

        localStorage.setItem(cacheKey, JSON.stringify({
          conversationId: data[0].id,
          messages: formattedMessages,
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
    } catch (error) {
      console.error('Error loading conversation:', error);

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
  };

  const saveConversation = async (updatedMessages: Message[]) => {
    const cacheKey = `chat_${chatbot.id}_${user?.id}`;

    try {
      if (conversationId) {
        await supabase
          .from('assistentes_conversas')
          .update({
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
    } catch (error) {
      console.error('Error saving conversation:', error);

      localStorage.setItem(cacheKey, JSON.stringify({
        conversationId,
        messages: updatedMessages,
        timestamp: Date.now()
      }));
    }
  };

  const sendMessageToWebhook = async (message: string, imageFile?: File, attempt: number = 1): Promise<string> => {
    const cacheKey = getCacheKey(message + (imageFile ? '_with_image' : ''));

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
        } catch {}
      }

      const finalResponse = botResponse || "Desculpe, não consegui processar sua mensagem.";

      if (!imageFile) {
        setResponseCache(prev => {
          const newCache = new Map(prev);
          newCache.set(cacheKey, finalResponse);
          if (newCache.size > 50) newCache.delete(newCache.keys().next().value);
          return newCache;
        });
      }

      return finalResponse;
    } catch (error) {
      if (attempt < 3) {
        await new Promise(r => setTimeout(r, 1000 * attempt));
        return sendMessageToWebhook(message, imageFile, attempt + 1);
      }
      throw new Error("Conexão falhou. Verifique sua internet ou tente mais tarde.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma imagem válida.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 5MB.",
        variant: "destructive",
      });
      return;
    }

    const objectUrl = URL.createObjectURL(file);
      setImageFile(file);
      setSelectedImage(objectUrl);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImageFile(null);
  };

  const sendMessage = async (content?: string) => {
    const messageToSend = content || inputMessage;
    if (!messageToSend.trim() && !imageFile || loading) return;

    setErrorMessage(null);

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageToSend.trim(),
      imageUrl: selectedImage || undefined,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    if (!content) {
      setInputMessage("");
      setSelectedImage(null);
      setImageFile(null);
    }
    setLoading(true);

    try {
      const botResponse = await sendMessageToWebhook(userMessage.content, imageFile || undefined);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: "",
        timestamp: new Date().toISOString(),
        isStreaming: true,
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

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Ocorreu um erro inesperado.";
      setErrorMessage(errorMsg);

      const errorMessageObj: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: errorMsg,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...updatedMessages, errorMessageObj];
      setMessages(finalMessages);
      await saveConversation(finalMessages);
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100dvh-80px)] md:h-[calc(100vh-100px)] flex flex-col bg-animated-gradient overflow-hidden">
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full md:px-4 md:py-2 h-full">
        <Card className="flex-1 flex flex-col h-full overflow-hidden border-none md:border md:glass-card shadow-2xl rounded-none md:rounded-2xl">
          <CardHeader className="border-b bg-background/80 backdrop-blur-md p-3 z-10 shrink-0">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="shrink-0 h-11 w-11 md:h-9 md:w-9 glass-button-ghost"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Avatar className="h-9 w-9 md:h-10 md:w-10 border-2 border-primary/20">
                <AvatarFallback className="bg-primary/5">
                  <Bot className="h-5 w-5 text-primary" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base font-semibold truncate">
                  {chatbot.name}
                </CardTitle>
                <div className="flex items-center gap-1.5">
                  <span className={`flex h-2 w-2 rounded-full ${chatbot.is_active ? 'bg-green-500' : 'bg-red-500'} ${chatbot.is_active ? 'animate-pulse' : ''}`} />
                  <p className="text-xs text-muted-foreground">
                    {chatbot.is_active ? "Online" : "Offline"}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearConversation}
                className="shrink-0 h-9 text-xs gap-1.5 md:hidden"
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                Novo
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearConversation}
                title="Nova conversa"
                className="hidden md:flex h-9 w-9 shrink-0"
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0 relative bg-muted/30 overflow-hidden">
            <div
              className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
              ref={scrollAreaRef}
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              <AnimatePresence initial={false}>
                {messages.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-20 text-center"
                  >
                    <div className="bg-primary/5 p-6 rounded-full mb-4 glass-pulse">
                      <Bot className="h-12 w-12 text-primary/40" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground/80">Olá! Eu sou o {chatbot.name}</h3>
                    <p className="text-muted-foreground text-sm max-w-xs mt-2">
                      Como posso ajudar você hoje? Sinta-se à vontade para perguntar qualquer coisa.
                    </p>
                  </motion.div>
                )}

                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.type === 'bot' && (
                      <Avatar className="h-8 w-8 shrink-0 mt-1 border border-primary/10">
                        <AvatarFallback className="bg-primary/5 text-[10px]">
                          <Bot className="h-4 w-4 text-primary" />
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div
                      className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground rounded-tr-none'
                          : 'bg-background border border-primary/5 rounded-tl-none'
                      }`}
                    >
                      {message.type === 'bot' ? (
                        <div className="text-sm md:text-base prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                              ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                              code: ({ children }) => <code className="bg-primary/10 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>,
                              blockquote: ({ children }) => <blockquote className="border-l-4 border-primary/20 pl-3 italic my-2">{children}</blockquote>,
                            }}
                          >
                            {message.isStreaming ? typingText : message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm md:text-base leading-relaxed">{message.content}</p>
                      )}

                      {/* Image display */}
                      {message.imageUrl && (
                        <div className="mt-2 rounded-lg overflow-hidden border border-primary/20">
                          <img
                            src={message.imageUrl}
                            alt="Imagem enviada"
                            className="max-w-full h-auto max-h-60 object-contain"
                          />
                        </div>
                      )}

                      <div className={`text-[10px] mt-1.5 flex items-center gap-1 ${message.type === 'user' ? 'text-primary-foreground/70 justify-end' : 'text-muted-foreground'}`}>
                        {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>

                    {message.type === 'user' && (
                      <Avatar className="h-8 w-8 shrink-0 mt-1 border border-primary/20">
                        <AvatarFallback className="bg-primary/10">
                          <User className="h-4 w-4 text-primary" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </motion.div>
                ))}
                
                {(loading || isTyping) && <TypingIndicator />}

                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl rounded-tl-none px-4 py-3 max-w-[85%] md:max-w-[75%]">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-red-500 mb-2">{errorMessage}</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={retrySendMessage}
                            className="h-8 text-xs border-red-500/30 text-red-500 hover:bg-red-500/10"
                          >
                            Tentar novamente
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} className="h-2 shrink-0" />
            </div>

            <div className="p-3 md:p-6 bg-background/80 backdrop-blur-md border-t shrink-0">
              {/* Selected image preview */}
              <AnimatePresence>
                {selectedImage && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mb-2 flex items-center gap-2 bg-primary/5 p-2 rounded-lg max-w-xs mx-auto"
                  >
                    <div className="relative">
                      <img
                        src={selectedImage}
                        alt="Prévia"
                        className="h-16 w-16 object-cover rounded-md"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className="text-xs text-muted-foreground flex-1 truncate">
                      Imagem anexada
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div
                ref={inputRef}
                className="aurora-effect relative flex gap-2 max-w-4xl mx-auto items-center glass-input p-1.5 rounded-xl shadow-lg border-primary/10"
              >
                {/* Image attachment button */}
                {chatbot.accept_images && (
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    className="hidden"
                    id="chat-image-input"
                  />
                )}
                {chatbot.accept_images && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading || !chatbot.is_active}
                    className={`h-11 w-11 rounded-lg shrink-0 transition-all duration-200 ${
                      selectedImage ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {selectedImage ? (
                      <ImageIcon className="h-5 w-5" />
                    ) : (
                      <Paperclip className="h-5 w-5" />
                    )}
                  </Button>
                )}

                {speechSupported && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={toggleVoiceInput}
                    disabled={loading || !chatbot.is_active}
                    className={`h-11 w-11 rounded-lg shrink-0 transition-all duration-200 ${
                      isRecording ? 'text-red-500 animate-pulse' : 'text-muted-foreground hover:text-foreground'
                    }`}
                    title={isRecording ? "Parar gravação" : "Entrar com voz"}
                  >
                    {isRecording ? (
                      <Mic className="h-5 w-5" />
                    ) : (
                      <MicOff className="h-5 w-5" />
                    )}
                  </Button>
                )}

                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua mensagem..."
                  disabled={loading || !chatbot.is_active}
                  className="flex-1 border-none bg-transparent focus-visible:ring-0 text-sm h-11 min-h-[44px]"
                />
                <Button
                  onClick={() => sendMessage()}
                  disabled={(!inputMessage.trim() && !imageFile) || loading || !chatbot.is_active}
                  size="icon"
                  className={`h-11 w-11 rounded-lg transition-all duration-200 shrink-0 ${
                    (inputMessage.trim() || imageFile) ? 'glass-button-primary' : 'opacity-50'
                  }`}
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Diálogo de confirmação para limpar conversa */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent className="glass-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Iniciar nova conversa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação limpará todo o histórico desta conversa. Esta mudança não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={clearConversation} className="bg-primary hover:bg-primary/90">
              Iniciar nova conversa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}