import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Loader2, RefreshCcw, Copy, Minimize2, Maximize2, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { API_ENDPOINTS, CORS_CONFIG } from "@/lib/constants";

// Message Loading Animation Component
function MessageLoading() {
  return (
    <div className="flex items-center space-x-2 px-1">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      </div>
      <span className="text-xs text-muted-foreground font-medium">Assistente está pensando...</span>
    </div>
  );
}

// Chat Bubble Components
interface ChatBubbleProps {
  variant?: "sent" | "received";
  className?: string;
  children: React.ReactNode;
}

function ChatBubble({
  variant = "received",
  className,
  children,
}: ChatBubbleProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 mb-4 max-w-full",
        variant === "sent" && "flex-row-reverse",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface ChatBubbleMessageProps {
  variant?: "sent" | "received";
  isLoading?: boolean;
  className?: string;
  children?: React.ReactNode;
}

function ChatBubbleMessage({
  variant = "received",
  isLoading,
  className,
  children,
}: ChatBubbleMessageProps) {
  return (
    <div
      className={cn(
        "rounded-2xl px-4 py-3 text-sm leading-relaxed max-w-[80%] shadow-sm transition-all duration-200",
        variant === "sent" 
          ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-primary/20" 
          : "bg-gradient-to-br from-muted to-muted/80 text-foreground border border-border/50",
        isLoading && "bg-muted/60",
        className
      )}
    >
      {isLoading ? (
        <MessageLoading />
      ) : (
        <div className="break-words">{children}</div>
      )}
    </div>
  );
}

// Main Productivity Assistant Component
interface ProductivityAssistantProps {
  className?: string;
}

export function ProductivityAssistant({
  className,
}: ProductivityAssistantProps) {
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<{ text: string; isUser: boolean; timestamp: Date }[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const lastMessageCountRef = useRef<number>(0);
  const userScrolledAwayRef = useRef<boolean>(false);

  // N8N Webhook URL - USANDO PROXY SUPABASE (RESOLVE CORS)
  const N8N_WEBHOOK_URL = API_ENDPOINTS.N8N_PROXY;

  // Função para processar markdown básico nas respostas
  const processMarkdown = (text: string): React.ReactNode => {
    // Processa **texto** para negrito
    let processedText = text;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    
    // Regex para encontrar **texto**
    const boldRegex = /\*\*(.*?)\*\*/g;
    let match;
    
    while ((match = boldRegex.exec(text)) !== null) {
      // Adiciona texto antes do match
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      
      // Adiciona texto em negrito
      parts.push(<strong key={match.index} className="font-semibold">{match[1]}</strong>);
      
      lastIndex = match.index + match[0].length;
    }
    
    // Adiciona texto restante
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    
    return parts.length > 0 ? parts : text;
  };

  // Função para verificar se está próximo ao final do scroll
  const isNearBottom = () => {
    if (!messagesContainerRef.current) return true;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const threshold = 100; // pixels de tolerância
    return scrollHeight - scrollTop - clientHeight < threshold;
  };

  // Função para fazer scroll suave para o final
  const scrollToBottom = (force: boolean = false) => {
    if (!messagesEndRef.current) return;
    
    // Só faz scroll se for forçado OU se o usuário não tiver rolado para longe do final
    if (force || !userScrolledAwayRef.current) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ 
          behavior: "smooth",
          block: "end"
        });
      });
    }
  };

  // Função para enviar mensagem para o N8N
  const sendToN8N = async (userMessage: string): Promise<string> => {
    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: CORS_CONFIG.headers,
        body: JSON.stringify({
          message: userMessage,
          timestamp: new Date().toISOString(),
          source: 'ProductivityAssistant'
        }),
      });

      if (!response.ok) {
        // Melhor tratamento de erro com informações específicas
        const errorText = await response.text();
        console.error(`❌ Erro na requisição (${response.status}):`, errorText);
        throw new Error(`Erro na requisição (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log('📝 Resposta da Edge Function:', data);
      
      // Verifica se a resposta veio do fallback
      if (data.source === "fallback") {
        console.warn('⚠️ Usando resposta de fallback:', data.debug);
        // Ainda retorna a mensagem de fallback, que é válida
        return data.message;
      }
      
      // Verifica se o N8N retornou uma resposta válida
      // Primeiro tenta acessar 'output' (formato atual)
      if (data && data.output) {
        return data.output;
      }
      // Fallback para 'response' (formato anterior)
      else if (data && data.response) {
        return data.response;
      }
      // Se não encontrar 'output' nem 'response', tenta mensagem direta
      else if (data && data.message) {
        return data.message;
      }
      // Fallback se a resposta vier vazia ou com formato inesperado
      else {
        console.warn('⚠️ Resposta N8N em formato inesperado:', data);
        throw new Error('Resposta em formato inesperado');
      }
      
    } catch (error) {
      console.error('❌ Erro completo na comunicação com N8N:', error);
      throw error; // Re-throw para permitir fallback na função que chama
    }
  };

  // Função de fallback para respostas locais (caso o N8N falhe)
  const getFallbackResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Respostas específicas por palavras-chave
    if (lowerMessage.includes("rotina") || lowerMessage.includes("cronograma")) {
      return "📋 **Organizando sua rotina:**\n\n• Defina horários fixos para atividades importantes\n• Use blocos de tempo de 25-50 minutos (Técnica Pomodoro)\n• Reserve tempo para pausas regulares\n• Priorize tarefas por urgência e importância\n• Mantenha uma lista de tarefas atualizada";
    }
    
    if (lowerMessage.includes("produtividade") || lowerMessage.includes("foco")) {
      return "🎯 **Dicas de produtividade:**\n\n• **Elimine distrações** - desligue notificações desnecessárias\n• **Técnica Pomodoro** - 25 min foco + 5 min pausa\n• **Regra dos 2 minutos** - faça imediatamente tarefas rápidas\n• **Planeje o dia anterior** - saiba o que fazer ao acordar\n• **Uma tarefa por vez** - evite multitasking";
    }
    
    if (lowerMessage.includes("hub") || lowerMessage.includes("navegação") || lowerMessage.includes("usar")) {
      return "🏢 **Navegando no Hub de Produtividade:**\n\n• **Deposito** - Gerencie estoque e produtos\n• **Clientes** - Cadastre e acompanhe clientes\n• **Vendas** - Registre e controle vendas\n• **Relatórios** - Analise dados e métricas\n• **Configurações** - Personalize o sistema\n\nUse o menu lateral para navegar entre as seções!";
    }
    
    if (lowerMessage.includes("estoque") || lowerMessage.includes("produto")) {
      return "📦 **Gestão de Estoque:**\n\n• Acesse a seção **Deposito** no menu\n• Cadastre produtos com códigos únicos\n• Monitore níveis mínimos de estoque\n• Configure alertas de reposição\n• Realize inventários periódicos\n• Use relatórios para análise de giro";
    }
    
    if (lowerMessage.includes("cliente") || lowerMessage.includes("cadastro")) {
      return "👥 **Gestão de Clientes:**\n\n• Acesse **Clientes** no menu principal\n• Complete dados de contato e endereço\n• Mantenha histórico de compras\n• Segmente clientes por perfil\n• Configure lembretes de contato\n• Use filtros para busca rápida";
    }
    
    if (lowerMessage.includes("venda") || lowerMessage.includes("vendas")) {
      return "💰 **Sistema de Vendas:**\n\n• Acesse **Vendas** para registrar\n• Selecione cliente e produtos\n• Configure formas de pagamento\n• Gere cupons fiscais\n• Acompanhe metas mensais\n• Analise performance por período";
    }
    
    if (lowerMessage.includes("relatório") || lowerMessage.includes("análise")) {
      return "📊 **Relatórios e Análises:**\n\n• **Vendas por período** - performance temporal\n• **Produtos mais vendidos** - itens populares\n• **Clientes ativos** - engajamento\n• **Margem de lucro** - rentabilidade\n• **Estoque atual** - situação produtos\n• Exporte dados em Excel/PDF";
    }
    
    // Respostas genéricas
    const responses = [
      "💡 Posso ajudar com **organização de rotinas**, **dicas de produtividade** ou **navegação no Hub**. O que você gostaria de saber?",
      "🤔 Interessante! Posso orientar sobre **gestão de tempo**, **uso do sistema** ou **melhores práticas**. Em que posso ajudar?",
      "✨ Estou aqui para ajudar! Pergunte sobre **rotinas**, **produtividade** ou **como usar as funcionalidades do Hub**.",
      "🎯 Como assistente de produtividade, posso ajudar com **organização**, **eficiência** e **navegação no sistema**. Qual é sua dúvida?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const simulateResponse = async (userMessage: string) => {
    setIsTyping(true);
    
    try {
      // Tentativa de comunicação com N8N via Edge Function
      const aiResponse = await sendToN8N(userMessage);
      
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [...prev, { 
          text: aiResponse, 
          isUser: false, 
          timestamp: new Date() 
        }]);
      }, Math.random() * 1000 + 1000); // Random delay between 1-2 seconds
      
    } catch (error) {
      // Se falhar, usa a resposta local
      console.warn('Falha na comunicação com N8N, usando resposta local:', error);
      const fallbackResponse = getFallbackResponse(userMessage);
      
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [...prev, { 
          text: fallbackResponse, 
          isUser: false, 
          timestamp: new Date() 
        }]);
      }, Math.random() * 1000 + 1000);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (input.trim() === "") return;
    
    const userMessage = input;
    // Só reseta a flag se o usuário estiver próximo do final
    // Isso evita scroll forçado se ele estiver lendo mensagens antigas
    if (isNearBottom()) {
      userScrolledAwayRef.current = false;
    }
    
    setMessages((prev) => [...prev, { 
      text: userMessage, 
      isUser: true, 
      timestamp: new Date() 
    }]);
    setInput("");
    
    simulateResponse(userMessage);
  };

  const clearChat = () => {
    setMessages([]);
    userScrolledAwayRef.current = false;
  };

  const copyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    // Simple feedback - could be enhanced with toast
    console.log('Mensagem copiada!');
  };

  // Controle inteligente de scroll baseado na mudança de mensagens
  useEffect(() => {
    const currentMessageCount = messages.length;
    const previousMessageCount = lastMessageCountRef.current;
    
    // Só faz scroll se:
    // 1. Há novas mensagens
    // 2. O usuário não está visualizando mensagens antigas (não rolou para longe)
    if (currentMessageCount > previousMessageCount) {
      // Pequeno delay para garantir que o DOM foi atualizado
      setTimeout(() => {
        scrollToBottom();
      }, 50);
    }
    
    lastMessageCountRef.current = currentMessageCount;
  }, [messages]);

  // Scroll quando o assistente para de digitar
  useEffect(() => {
    if (!isTyping && messages.length > 0) {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [isTyping, messages.length]);

  // Detecta quando usuário rola manualmente para longe do final
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    
    const isAtBottom = isNearBottom();
    userScrolledAwayRef.current = !isAtBottom;
    
    // Se o usuário voltar para próximo do final, reativa o auto-scroll
    if (isAtBottom) {
      userScrolledAwayRef.current = false;
    }
  };

  // Debounced scroll handler para melhor performance
  const debouncedHandleScroll = useRef<NodeJS.Timeout | null>(null);
  
  const handleScrollDebounced = () => {
    if (debouncedHandleScroll.current) {
      clearTimeout(debouncedHandleScroll.current);
    }
    
    debouncedHandleScroll.current = setTimeout(() => {
      handleScroll();
    }, 100);
  };

  return (
    <div className={cn("w-full bg-background rounded-xl border border-border shadow-lg overflow-hidden", className)}>
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 p-4 border-b border-border/50 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
              <Sparkles className="text-primary-foreground h-5 w-5" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          <div>
            <h3 className="text-foreground font-semibold text-base">Assistente de Produtividade</h3>
            <p className="text-sm text-muted-foreground">Seu assistente inteligente sempre disponível</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChat}
            className="h-8 w-8 p-0 hover:bg-muted/80 transition-colors"
            title="Limpar conversa"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-8 w-8 p-0 hover:bg-muted/80 transition-colors"
            title={isMinimized ? "Expandir" : "Minimizar"}
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      {/* Content - conditionally rendered based on minimized state */}
      {!isMinimized && (
        <>
          {/* Enhanced Messages container */}
          <div 
            ref={messagesContainerRef}
            onScroll={handleScrollDebounced}
            className="p-4 h-[350px] overflow-y-auto bg-gradient-to-b from-background to-muted/10 scroll-smooth"
            style={{ scrollBehavior: 'smooth' }}
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="relative mb-2">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-md">
                    <span className="text-xs text-primary-foreground font-bold">AI</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-foreground font-semibold text-lg">Como posso ajudar você?</h4>
                  <p className="text-muted-foreground text-sm max-w-xs">
                    Pergunte sobre rotinas, produtividade ou navegação no Hub de Produtividade
                  </p>
                </div>
                <div className="space-y-3 w-full max-w-sm">
                  <div className="text-xs text-muted-foreground font-medium">💡 Sugestões populares:</div>
                  <div className="grid gap-2">
                    {[
                      { text: "Como organizar rotinas?", icon: "📋" },
                      { text: "Dicas de produtividade", icon: "🎯" },
                      { text: "Como usar o Hub?", icon: "🏢" }
                    ].map((suggestion) => (
                      <button
                        key={suggestion.text}
                        onClick={() => setInput(suggestion.text)}
                        className="text-sm bg-muted/80 hover:bg-muted hover:shadow-sm border border-border/50 px-3 py-2 rounded-lg transition-all duration-200 text-left flex items-center gap-2"
                      >
                        <span>{suggestion.icon}</span>
                        <span>{suggestion.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {messages.map((msg, index) => (
                  <ChatBubble
                    key={index}
                    variant={msg.isUser ? "sent" : "received"}
                  >
                    {!msg.isUser && (
                      <Avatar className="h-8 w-8 shadow-sm">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-xs font-semibold">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex flex-col w-full">
                      <ChatBubbleMessage variant={msg.isUser ? "sent" : "received"}>
                        <div className="whitespace-pre-line leading-relaxed">{processMarkdown(msg.text)}</div>
                      </ChatBubbleMessage>
                      
                      {!msg.isUser && (
                        <button
                          onClick={() => copyMessage(msg.text)}
                          className="self-start mt-2 p-1.5 hover:bg-muted rounded-md transition-colors group"
                          title="Copiar mensagem"
                        >
                          <Copy className="h-3 w-3 text-muted-foreground group-hover:text-foreground" />
                        </button>
                      )}
                    </div>
                    {msg.isUser && (
                      <Avatar className="h-8 w-8 shadow-sm">
                        <AvatarFallback className="bg-gradient-to-br from-muted to-muted/80 text-foreground text-xs font-semibold">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </ChatBubble>
                ))}
                {isTyping && (
                  <ChatBubble variant="received">
                    <Avatar className="h-8 w-8 shadow-sm">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-xs font-semibold">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <ChatBubbleMessage isLoading />
                  </ChatBubble>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          {/* Enhanced Input form */}
          <form 
            onSubmit={handleSubmit}
            className="p-4 border-t border-border/50 bg-background"
          >
            <div className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="w-full bg-muted/50 border border-border rounded-xl py-3 pl-4 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-200"
                />
                <button
                  type="submit"
                  disabled={input.trim() === "" || isTyping}
                  className={cn(
                    "absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 transition-all duration-200",
                    input.trim() === "" || isTyping
                      ? "text-muted-foreground bg-muted/50 cursor-not-allowed"
                      : "text-primary-foreground bg-gradient-to-br from-primary to-primary/90 hover:shadow-md hover:scale-105 shadow-primary/20"
                  )}
                >
                  {isTyping ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
