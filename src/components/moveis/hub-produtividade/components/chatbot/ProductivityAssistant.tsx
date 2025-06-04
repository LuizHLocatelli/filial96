import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Loader2, RefreshCcw, Copy, Minimize2, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { API_ENDPOINTS, CORS_CONFIG } from "@/lib/constants";

// Message Loading Animation Component
function MessageLoading() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className="text-muted-foreground"
    >
      <circle cx="4" cy="12" r="2" fill="currentColor">
        <animate
          id="spinner_qFRN"
          begin="0;spinner_OcgL.end+0.25s"
          attributeName="cy"
          calcMode="spline"
          dur="0.6s"
          values="12;6;12"
          keySplines=".33,.66,.66,1;.33,0,.66,.33"
        />
      </circle>
      <circle cx="12" cy="12" r="2" fill="currentColor">
        <animate
          begin="spinner_qFRN.begin+0.1s"
          attributeName="cy"
          calcMode="spline"
          dur="0.6s"
          values="12;6;12"
          keySplines=".33,.66,.66,1;.33,0,.66,.33"
        />
      </circle>
      <circle cx="20" cy="12" r="2" fill="currentColor">
        <animate
          id="spinner_OcgL"
          begin="spinner_qFRN.begin+0.2s"
          attributeName="cy"
          calcMode="spline"
          dur="0.6s"
          values="12;6;12"
          keySplines=".33,.66,.66,1;.33,0,.66,.33"
        />
      </circle>
    </svg>
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
        "flex items-start gap-2 mb-3",
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
        "rounded-lg p-2.5 text-sm max-w-[85%]",
        variant === "sent" 
          ? "bg-primary text-primary-foreground ml-auto" 
          : "bg-muted text-foreground",
        className
      )}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <MessageLoading />
          <span className="text-xs">Assistente está digitando...</span>
        </div>
      ) : (
        children
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

  // N8N Webhook URL - USANDO PROXY SUPABASE (RESOLVE CORS)
  const N8N_WEBHOOK_URL = API_ENDPOINTS.N8N_PROXY;

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
        throw new Error(`Erro na requisição (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      
      // Verifica se o N8N retornou uma resposta válida
      // Primeiro tenta acessar 'output' (formato atual)
      if (data && data.output) {
        return data.output;
      }
      // Fallback para 'response' (formato anterior)
      else if (data && data.response) {
        return data.response;
      }
      // Fallback para 'message'
      else if (data && data.message) {
        return data.message;
      }
      // Se não há resposta estruturada, usa o conteúdo da resposta
      else {
        return typeof data === 'string' ? data : JSON.stringify(data);
      }
      
    } catch (error) {
      // Log específico para problema de CORS (se ainda existir)
      if (error.message.includes('CORS') || error.message.includes('blocked')) {
        console.error('⚠️  Problema de CORS detectado - verifique se a Edge Function está funcionando:', error);
      } else {
        console.error('❌ Erro ao enviar mensagem para N8N via proxy:', error);
      }
      throw error;
    }
  };

  // Função de fallback para respostas locais (caso o N8N falhe)
  const getFallbackResponse = (userMessage: string): string => {
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
  };

  // Simulate AI typing effect
  const simulateResponse = async (userMessage: string) => {
    setIsTyping(true);
    
    try {
      // Tenta enviar para o N8N primeiro
      const response = await sendToN8N(userMessage);
      
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [...prev, { 
          text: response, 
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
  };

  const copyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className={cn("w-full bg-background rounded-lg border border-border shadow-sm", className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/3 p-3 border-b border-border flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Sparkles className="text-primary h-5 w-5" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-background"></div>
          </div>
          <div>
            <h3 className="text-foreground font-semibold text-sm">Assistente de Produtividade</h3>
            <p className="text-xs text-muted-foreground">Seu assistente inteligente sempre disponível</p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChat}
            className="h-7 w-7 p-0"
            title="Limpar conversa"
          >
            <RefreshCcw className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-7 w-7 p-0"
            title={isMinimized ? "Expandir" : "Minimizar"}
          >
            {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
          </Button>
        </div>
      </div>
      
      {/* Content - conditionally rendered based on minimized state */}
      {!isMinimized && (
        <>
          {/* Messages container */}
          <div className="p-3 h-[300px] overflow-y-auto bg-background">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="relative mb-3">
                  <Sparkles className="h-12 w-12 text-primary" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-xs text-primary-foreground font-bold">AI</span>
                  </div>
                </div>
                <h4 className="text-foreground font-medium mb-1">Como posso ajudar você?</h4>
                <p className="text-muted-foreground text-xs mb-3 max-w-xs">
                  Pergunte sobre rotinas, produtividade ou navegação no Hub
                </p>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Sugestões:</div>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {["Como organizar rotinas?", "Dicas de produtividade", "Como usar o Hub?"].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setInput(suggestion)}
                        className="text-xs bg-muted hover:bg-muted/80 px-2 py-1 rounded-md transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg, index) => (
                  <ChatBubble
                    key={index}
                    variant={msg.isUser ? "sent" : "received"}
                  >
                    {!msg.isUser && (
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">AI</AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex flex-col w-full">
                      <ChatBubbleMessage variant={msg.isUser ? "sent" : "received"}>
                        <p className="whitespace-pre-line">{msg.text}</p>
                      </ChatBubbleMessage>
                      
                      {!msg.isUser && (
                        <button
                          onClick={() => copyMessage(msg.text)}
                          className="self-start mt-1 p-1 hover:bg-muted rounded-sm transition-colors"
                          title="Copiar mensagem"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                    {msg.isUser && (
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-muted text-foreground text-xs">EU</AvatarFallback>
                      </Avatar>
                    )}
                  </ChatBubble>
                ))}
                {isTyping && (
                  <ChatBubble variant="received">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">AI</AvatarFallback>
                    </Avatar>
                    <ChatBubbleMessage isLoading />
                  </ChatBubble>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          {/* Input form */}
          <form 
            onSubmit={handleSubmit}
            className="p-3 border-t border-border bg-background"
          >
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="w-full bg-background border border-input rounded-lg py-2 pl-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              <button
                type="submit"
                disabled={input.trim() === "" || isTyping}
                className={`absolute right-1 rounded-md p-1.5 transition-all ${
                  input.trim() === "" || isTyping
                    ? "text-muted-foreground bg-muted cursor-not-allowed"
                    : "text-primary-foreground bg-primary hover:bg-primary/90"
                }`}
              >
                {isTyping ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Send className="h-3 w-3" />
                )}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
