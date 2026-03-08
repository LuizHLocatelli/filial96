import { useEffect, useRef, useState } from "react";
import { useChatSession } from "../hooks/useChatSession";
import { ChatInput, type ChatDocument } from "./ChatInput";
import { ChatToolBadges } from "./ChatToolBadges";
import { ExportDropdown } from "./ExportDropdown";
import { AssistenteImageViewer } from "./AssistenteImageViewer";
import type { AIAssistant, AIChatSession } from "../types";
import { Bot, User, ArrowLeft, Square } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

interface AssistenteChatProps {
  assistant: AIAssistant;
  session: AIChatSession | null;
  onNewSession: () => void;
  onSendWithoutSession?: (message: string, images: string[], documents?: ChatDocument[]) => void;
  onBack?: () => void;
}

export function AssistenteChat({ assistant, session, onNewSession, onSendWithoutSession, onBack }: AssistenteChatProps) {
  const { messages, isLoading, isSending, streamingContent, activeTools, sendMessage, cancelStream } = useChatSession(session?.id || null, assistant);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isSending, streamingContent]);

  // Listen for pending messages from auto-session creation
  useEffect(() => {
    if (!session) return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.sessionId === session.id) {
        sendMessage.mutateAsync({ content: detail.content, images: detail.images, documents: detail.documents });
      }
    };
    window.addEventListener('pending-message', handler);
    return () => window.removeEventListener('pending-message', handler);
  }, [session, sendMessage]);

  const handleSend = async (message: string, images: string[], documents?: ChatDocument[]) => {
    if (!session) {
      onSendWithoutSession?.(message, images, documents);
      return;
    }
    await sendMessage.mutateAsync({ content: message, images, documents });
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
        <p className="text-muted-foreground max-w-md">{assistant.description}</p>
        <div className="w-full max-w-2xl mt-6">
          <ChatInput onSend={(msg, imgs, docs) => onSendWithoutSession?.(msg, imgs, docs)} disabled={false} />
        </div>
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
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm">{assistant.name}</h3>
          <p className="text-xs text-muted-foreground line-clamp-1">{session.title}</p>
        </div>
        <ExportDropdown messages={messages} assistant={assistant} session={session} />
      </div>

      <ScrollArea className="flex-1 p-4" id="chat-scroll-area">
        <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full pb-4">
          {messages.map((msg, idx) => (
            <div key={msg.id || idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {/* Tool badges for saved model messages */}
                {msg.role === 'model' && msg.tools_used && msg.tools_used.length > 0 && (
                  <ChatToolBadges tools={msg.tools_used} />
                )}
                {msg.image_urls?.length > 0 && (
                  <div className={`flex flex-wrap gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.image_urls.map((img, i) => (
                      <img key={i} src={img} alt="Anexo" className="max-w-48 max-h-48 rounded-lg object-cover border cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setSelectedImage(img)} />
                    ))}
                  </div>
                )}
                <div className={`p-3 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted rounded-tl-sm'}`}>
                  <div className="text-sm prose dark:prose-invert prose-p:leading-relaxed prose-pre:bg-background/50 prose-pre:border prose-code:text-xs max-w-none break-words">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isSending && streamingContent && (
            <div className="flex gap-4 flex-row">
              <div className="w-8 h-8 rounded-full bg-muted text-foreground flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="flex flex-col gap-2 max-w-[85%] items-start">
                {/* Active tool badges during streaming */}
                {activeTools.length > 0 && (
                  <ChatToolBadges tools={activeTools} isStreaming />
                )}
                <div className="p-3 bg-muted rounded-2xl rounded-tl-sm">
                  <div className="text-sm prose dark:prose-invert prose-p:leading-relaxed prose-pre:bg-background/50 prose-pre:border prose-code:text-xs max-w-none break-words">
                    <ReactMarkdown>{streamingContent}</ReactMarkdown>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={cancelStream}>
                  <Square className="w-3 h-3 mr-1" /> Parar
                </Button>
              </div>
            </div>
          )}

          {isSending && !streamingContent && (
            <div className="flex gap-4 flex-row">
              <div className="w-8 h-8 rounded-full bg-muted text-foreground flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="flex flex-col gap-2 items-start">
                {/* Active tool badges during loading */}
                {activeTools.length > 0 && (
                  <ChatToolBadges tools={activeTools} isStreaming />
                )}
                <div className="p-3 bg-muted rounded-2xl rounded-tl-sm flex items-center gap-1">
                  <div className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={scrollRef} className="h-1" />
        </div>
      </ScrollArea>

      <div className="shrink-0 mt-auto">
        <ChatInput onSend={handleSend} disabled={isSending || !session} />
      </div>

      <AssistenteImageViewer imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
    </Card>
  );
}
