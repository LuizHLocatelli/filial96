import { useEffect, useRef } from "react";
import { useChatSession } from "../hooks/useChatSession";
import { ChatInput } from "./ChatInput";
import type { AIAssistant, AIChatSession } from "../types";
import { Bot, User, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import DOMPurify from "dompurify";

interface AssistenteChatProps {
  assistant: AIAssistant;
  session: AIChatSession | null;
  onNewSession: () => void;
  onBack?: () => void;
}

export function AssistenteChat({ assistant, session, onNewSession, onBack }: AssistenteChatProps) {
  const { messages, isLoading, isSending, sendMessage } = useChatSession(session?.id || null, assistant);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isSending]);

  const handleSend = async (message: string, images: string[]) => {
    if (!session) {
      // Must create session first (handled by parent before this point ideally, 
      // but if not, trigger callback)
      onNewSession();
      // Then send message (might fail if session is not ready, better handle this in parent)
      // Actually, if session is null, we block input or create session first.
      return;
    }
    await sendMessage.mutateAsync({ content: message, images });
  };

  const renderMessageContent = (content: string) => {
    // Basic Markdown rendering (bold, italic, code blocks, lists)
    const html = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/```(.*?)```/gs, '<pre className="bg-muted p-2 rounded-md overflow-x-auto"><code>$1</code></pre>')
      .replace(/`(.*?)`/g, '<code className="bg-muted px-1 rounded">$1</code>')
      .replace(/\n/g, '<br/>');

    // Make safe
    const safeHtml = DOMPurify.sanitize(html);
    return <div dangerouslySetInnerHTML={{ __html: safeHtml }} className="text-sm prose dark:prose-invert prose-p:leading-relaxed max-w-none break-words" />;
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8 bg-background/50 relative">
        {onBack && (
          <Button variant="ghost" size="icon" className="sm:hidden absolute top-4 left-4" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Bot className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-medium">{assistant.name}</h3>
        <p className="text-muted-foreground">{assistant.description}</p>
        <Button onClick={onNewSession} className="mt-4">Iniciar Conversa</Button>
      </div>
    );
  }

  return (
    <Card className="flex flex-col h-full border-x-0 sm:border-x rounded-none sm:rounded-xl overflow-hidden shadow-sm relative">
      <div className="border-b px-4 py-3 bg-muted/30 flex items-center gap-3 shrink-0">
        {onBack && (
          <Button variant="ghost" size="icon" className="sm:hidden shrink-0 -ml-2" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-medium text-sm">{assistant.name}</h3>
          <p className="text-xs text-muted-foreground line-clamp-1">{session.title}</p>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" id="chat-scroll-area">
        <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full pb-4">
          {messages.map((msg, idx) => (
            <div 
              key={msg.id || idx} 
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              
              <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {msg.image_urls?.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-end">
                    {msg.image_urls.map((img, i) => (
                      <img key={i} src={img} alt="Anexo" className="max-w-48 max-h-48 rounded-lg object-cover border" />
                    ))}
                  </div>
                )}
                <div className={`p-3 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted rounded-tl-sm'}`}>
                  {renderMessageContent(msg.content)}
                </div>
              </div>
            </div>
          ))}

          {isSending && (
            <div className="flex gap-4 flex-row">
              <div className="w-8 h-8 rounded-full bg-muted text-foreground flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="p-3 bg-muted rounded-2xl rounded-tl-sm flex items-center gap-1">
                <div className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          
          <div ref={scrollRef} className="h-1" />
        </div>
      </ScrollArea>

      <div className="shrink-0 mt-auto">
        <ChatInput onSend={handleSend} disabled={isSending || !session} />
      </div>
    </Card>
  );
}
