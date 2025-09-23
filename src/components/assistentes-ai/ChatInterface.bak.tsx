import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Send, Bot, User, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

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

  // Typing animation component
  const TypingIndicator = () => (
    <div className="flex gap-3 justify-start">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback>
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="bg-muted rounded-lg px-3 py-2">
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground">Assistente está digitando</span>
          <div className="flex gap-1">
            {[0, 1, 2].map((dot) => (
              <div
                key={dot}
                className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"
                style={{
                  animationDelay: `${dot * 0.1}s`,
                  animationDuration: '0.6s'
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Streaming text animation
  const streamText = useCallback((text: string, messageId: string) => {
    setIsTyping(true);
    setTypingText("");

    const words = text.split(' ');
    let currentIndex = 0;

    const typeNextWord = () => {
      if (currentIndex < words.length) {
        setTypingText(prev => {
          const newText = prev + (currentIndex > 0 ? ' ' : '') + words[currentIndex];
          // Auto-scroll during typing every few words
          if (currentIndex % 5 === 0) {
            setTimeout(scrollToBottom, 50);
          }
          return newText;
        });
        currentIndex++;

        // Adjust typing speed based on text length
        const delay = Math.min(Math.max(50, 100 - words.length / 10), 150);
        typingTimeoutRef.current = setTimeout(typeNextWord, delay);
      } else {
        setIsTyping(false);
        setTypingText("");
        // Update the actual message
        setMessages(prev => prev.map(msg =>
          msg.id === messageId ? { ...msg, content: text, isStreaming: false } : msg
        ));
        // Final scroll when done
        setTimeout(scrollToBottom, 100);
      }
    };

    typeNextWord();
  }, [scrollToBottom]);

  // Cache key generator
  const getCacheKey = useCallback((message: string) => {
    return `${chatbot.id}_${message.toLowerCase().trim()}`;
  }, [chatbot.id]);

  // Export conversation
  const clearConversation = async () => {
    if (!user || !conversationId) return;

    try {
      // Create a new conversation in Supabase
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

      // Update state with the new conversation
      setConversationId(newConversation.id);
      setMessages([]);
      
      // Reload conversations list
      loadConversations();

      toast({
        title: "Sucesso",
        description: "Nova conversa iniciada!",
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
        // Create new conversation
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
      toast({
        title: "Erro",
        description: "Não foi possível carregar a conversa.",
        variant: "destructive",
      });
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

    // Check cache first
    if (responseCache.has(cacheKey)) {
      console.log('Using cached response for:', message);
      return responseCache.get(cacheKey)!;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(chatbot.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          chatbot_id: chatbot.id,
          user_id: user?.id,
          conversation_id: conversationId,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Webhook responded with status: ${response.status}`);
      }

      const data = await response.json();

      // Log the complete response for debugging
      console.log('Webhook response:', data);

      // Try multiple possible response formats
      let botResponse = '';

      if (data.response) {
        botResponse = data.response;
      } else if (data.message) {
        botResponse = data.message;
      } else if (data.text) {
        botResponse = data.text;
      } else if (data.content) {
        botResponse = data.content;
      } else if (data.answer) {
        botResponse = data.answer;
      } else if (typeof data === 'string') {
        botResponse = data;
      } else if (data.data && typeof data.data === 'string') {
        botResponse = data.data;
      } else if (data.result && typeof data.result === 'string') {
        botResponse = data.result;
      } else {
        // If none of the expected fields exist, try to stringify the response
        botResponse = JSON.stringify(data);
      }

      // If the response is a JSON string, try to parse it to get the actual content
      if (typeof botResponse === 'string' && botResponse.startsWith('{') && botResponse.endsWith('}')) {
        try {
          const parsedResponse = JSON.parse(botResponse);
          // Extract the actual message from the parsed JSON
          if (parsedResponse.output) {
            botResponse = parsedResponse.output;
          } else if (parsedResponse.response) {
            botResponse = parsedResponse.response;
          } else if (parsedResponse.message) {
            botResponse = parsedResponse.message;
          } else if (parsedResponse.text) {
            botResponse = parsedResponse.text;
          } else if (parsedResponse.content) {
            botResponse = parsedResponse.content;
          }
        } catch (parseError) {
          console.log('Could not parse JSON response, using as is:', parseError);
        }
      }

      const finalResponse = botResponse || "Desculpe, não consegui processar sua mensagem.";

      // Cache the response
      setResponseCache(prev => {
        const newCache = new Map(prev);
        newCache.set(cacheKey, finalResponse);
        // Keep only last 50 responses to prevent memory issues
        if (newCache.size > 50) {
          const firstKey = newCache.keys().next().value;
          newCache.delete(firstKey);
        }
        return newCache;
      });

      return finalResponse;
    } catch (error) {
      console.error(`Webhook error (attempt ${attempt}):`, error);

      // Retry logic - up to 3 attempts
      if (attempt < 3) {
        console.log(`Retrying webhook call, attempt ${attempt + 1}`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
        return sendMessageToWebhook(message, attempt + 1);
      }

      throw new Error("Não foi possível conectar com o assistente. Tente novamente em alguns instantes.");
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

      // Start streaming the response
      streamText(botResponse, botMessage.id);

      // Save conversation after streaming is complete
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
    <div className="h-[calc(100vh-100px)] flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col h-full">
        <Card className="flex-1 flex flex-col h-full overflow-hidden rounded-none md:rounded-lg">
          <CardHeader className="border-b p-3 md:p-6">
            <div className="flex items-center gap-2 md:gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="shrink-0 h-8 w-8 md:h-10 md:w-10"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Avatar className="h-8 w-8 md:h-10 md:w-10">
                <AvatarFallback>
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base md:text-lg truncate">{chatbot.name}</CardTitle>
                <p className="text-xs md:text-sm text-muted-foreground truncate">
                  {chatbot.is_active ? "Online" : "Offline"}
                </p>
              </div>
              <div className="flex gap-1 md:gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearConversation}
                  title="Nova conversa"
                  className="h-8 w-8 md:h-10 md:w-10"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                    <path d="M3 3v5h5"/>
                  </svg>
                </Button>
              </div>
            </div>
          </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 relative overflow-hidden">
          <div
            className="flex-1 overflow-y-auto overflow-x-hidden p-2 md:p-4 scroll-smooth"
            ref={scrollAreaRef}
            style={{
              height: 'calc(100vh - 180px)',
              maxHeight: 'calc(100vh - 180px)',
              minHeight: '300px',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <div className="space-y-3 md:space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="px-4">Inicie uma conversa com {chatbot.name}</p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 md:gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.type === 'bot' && (
                    <Avatar className="h-7 w-7 md:h-8 md:w-8 shrink-0 mt-1">
                      <AvatarFallback>
                        <Bot className="h-3 w-3 md:h-4 md:w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div
                    className={`max-w-[85%] md:max-w-[70%] rounded-lg px-3 py-2 ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : 'bg-muted'
                    }`}
                  >
                    {message.type === 'bot' ? (
                      <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-1 md:mb-2 last:mb-0">{children}</p>,
                            h1: ({ children }) => <h1 className="text-base md:text-lg font-bold mb-2">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-sm md:text-base font-bold mb-2">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-xs md:text-sm font-bold mb-1">{children}</h3>,
                            ul: ({ children }) => <ul className="list-disc pl-4 mb-1 md:mb-2">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-4 mb-1 md:mb-2">{children}</ol>,
                            li: ({ children }) => <li className="mb-0.5 md:mb-1">{children}</li>,
                            strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                            em: ({ children }) => <em className="italic">{children}</em>,
                            code: ({ children }) => <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">{children}</code>,
                            blockquote: ({ children }) => <blockquote className="border-l-2 border-gray-300 pl-2 italic text-sm">{children}</blockquote>,
                          }}
                        >
                          {message.isStreaming ? typingText : message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  {message.type === 'user' && (
                    <Avatar className="h-7 w-7 md:h-8 md:w-8 shrink-0 mt-1">
                      <AvatarFallback>
                        <User className="h-3 w-3 md:h-4 md:w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {loading && <TypingIndicator />}
              {isTyping && !loading && <TypingIndicator />}

              <div ref={messagesEndRef} />
            </div>
          </div>


          <div className="border-t p-2 md:p-4">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                disabled={loading || !chatbot.is_active}
                className="flex-1 text-sm md:text-base"
              />
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || loading || !chatbot.is_active}
                size="icon"
                className="h-9 w-9 md:h-10 md:w-10"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}