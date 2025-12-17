import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Send, Bot, User, Loader2, Download, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
}

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const inputRef = useAurora<HTMLDivElement>();

  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
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
  const clearConversation = async () => {
    if (!user || !conversationId) return;

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

  const loadConversation = async () => {
    if (!user) return;

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
        setMessages(savedMessages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp
        })));
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
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const saveConversation = async (updatedMessages: Message[]) => {
    if (!conversationId) return;

    try {
      await supabase
        .from('assistentes_conversas')
        .update({
          messages: updatedMessages as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  };

  const sendMessageToWebhook = async (message: string, attempt: number = 1): Promise<string> => {
    const cacheKey = getCacheKey(message);

    if (responseCache.has(cacheKey)) {
      return responseCache.get(cacheKey)!;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(chatbot.webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          chatbot_id: chatbot.id,
          user_id: user?.id,
          conversation_id: conversationId,
        }),
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

      setResponseCache(prev => {
        const newCache = new Map(prev);
        newCache.set(cacheKey, finalResponse);
        if (newCache.size > 50) newCache.delete(newCache.keys().next().value);
        return newCache;
      });

      return finalResponse;
    } catch (error) {
      if (attempt < 3) {
        await new Promise(r => setTimeout(r, 1000 * attempt));
        return sendMessageToWebhook(message, attempt + 1);
      }
      throw new Error("Conexão falhou. Verifique sua internet ou tente mais tarde.");
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage("");
    setLoading(true);

    try {
      const botResponse = await sendMessageToWebhook(userMessage.content);

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
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      await saveConversation(finalMessages);
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-[calc(100vh-80px)] md:h-[calc(100vh-100px)] flex flex-col overflow-hidden bg-animated-gradient">
      <div className="flex-1 flex flex-col h-full max-w-5xl mx-auto w-full md:px-4 md:py-2">
        <Card className="flex-1 flex flex-col h-full overflow-hidden border-none md:border md:glass-card shadow-2xl rounded-none md:rounded-2xl">
          <CardHeader className="border-b bg-background/50 backdrop-blur-md p-3 md:p-4 z-10">
            <div className="flex items-center gap-2 md:gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="shrink-0 h-9 w-9 glass-button-ghost hover:bg-primary/10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="relative">
                <Avatar className="h-10 w-10 border-2 border-primary/20 shadow-inner">
                  <AvatarFallback className="bg-primary/5">
                    <Bot className="h-5 w-5 text-primary" />
                  </AvatarFallback>
                </Avatar>
                {chatbot.is_active && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base md:text-xl font-bold truncate bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {chatbot.name}
                </CardTitle>
                <div className="flex items-center gap-1.5">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {chatbot.is_active ? "Online e Pronto" : "Offline"}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={clearConversation}
                title="Nova conversa"
                className="h-9 w-9 glass-button-ghost"
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0 relative bg-muted/5">
            <div
              className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth"
              ref={scrollAreaRef}
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
              </AnimatePresence>
              <div ref={messagesEndRef} className="h-2" />
            </div>

            <div className="p-4 md:p-6 bg-background/50 backdrop-blur-md border-t">
              <div 
                ref={inputRef}
                className="aurora-effect relative flex gap-2 max-w-4xl mx-auto items-center glass-input p-1.5 rounded-2xl shadow-lg border-primary/10"
              >
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escreva uma mensagem..."
                  disabled={loading || !chatbot.is_active}
                  className="flex-1 border-none bg-transparent focus-visible:ring-0 text-sm md:text-base h-10 md:h-12"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || loading || !chatbot.is_active}
                  size="icon"
                  className={`h-10 w-10 md:h-12 md:w-12 rounded-xl transition-all duration-300 ${
                    inputMessage.trim() ? 'glass-button-primary scale-100 shadow-lg' : 'opacity-50 scale-95'
                  }`}
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
              <p className="text-[10px] text-center text-muted-foreground mt-3">
                Respostas geradas por IA podem conter erros. Verifique informações importantes.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}