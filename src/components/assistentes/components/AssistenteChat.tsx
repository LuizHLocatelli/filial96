import { useEffect, useRef, useState } from "react";
import { useChatSession } from "../hooks/useChatSession";
import { ChatInput, type ChatDocument } from "./ChatInput";
import { ChatToolBadges } from "./ChatToolBadges";
import { ExportDropdown } from "./ExportDropdown";
import { AssistenteImageViewer } from "./AssistenteImageViewer";
import type { AIAssistant, AIChatSession } from "../types";
import { Bot, User, ArrowLeft, Square, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";

interface TransitionMessage {
  id: string;
  content: string;
  images: string[];
}

interface AssistenteChatProps {
  assistant: AIAssistant;
  session: AIChatSession | null;
  onNewSession: () => void;
  onSendWithoutSession?: (message: string, images: string[], documents?: ChatDocument[]) => void;
  onBack?: () => void;
  transitionMessage?: TransitionMessage | null;
  onTransitionMessageComplete?: () => void;
}

export function AssistenteChat({ assistant, session, onNewSession, onSendWithoutSession, onBack, transitionMessage, onTransitionMessageComplete }: AssistenteChatProps) {
  const { messages, isLoading, isSending, streamingContent, activeTools, sendMessage, cancelStream } = useChatSession(session?.id || null, assistant);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.closest('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
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

  const [isInitializing, setIsInitializing] = useState(false);
  const hasMatchedTransitionMessage = Boolean(
    transitionMessage && messages.some((msg) => msg.role === "user" && msg.content === transitionMessage.content)
  );

  useEffect(() => {
    if (!hasMatchedTransitionMessage) return;

    const timer = window.setTimeout(() => {
      onTransitionMessageComplete?.();
    }, 220);

    return () => window.clearTimeout(timer);
  }, [hasMatchedTransitionMessage, onTransitionMessageComplete]);

  const handleSend = async (message: string, images: string[], documents?: ChatDocument[]) => {
    if (!session) {
      setIsInitializing(true);
      onSendWithoutSession?.(message, images, documents);
      return;
    }
    await sendMessage.mutateAsync({ content: message, images, documents });
  };

  if (!session) {
    return (
      <motion.div
        animate={{
          filter: isInitializing ? "blur(10px)" : "blur(0px)",
          scale: isInitializing ? 0.985 : 1,
        }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center justify-center h-full gap-4 text-center p-4 sm:p-8 relative overflow-hidden bg-background"
      >
        {/* Glow de fundo */}
        <motion.div
          animate={{ opacity: isInitializing ? 0.22 : 0.5, scale: isInitializing ? 1.08 : 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none dark:opacity-30 mix-blend-screen"
        />
        
        {onBack && (
          <Button variant="ghost" size="icon" className="sm:hidden absolute top-4 left-4 z-10" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}

        <motion.div
          animate={{ opacity: isInitializing ? 0.3 : 1, y: isInitializing ? -14 : 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center justify-center gap-4 max-w-3xl w-full z-10"
        >
          <motion.div 
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", duration: 0.8, bounce: 0.4 }}
            className="w-24 h-24 rounded-3xl bg-gradient-to-br from-background to-muted border border-border/50 shadow-xl shadow-primary/5 flex items-center justify-center text-4xl overflow-hidden ring-1 ring-white/10"
          >
            {assistant.avatar_icon ? (
              <span className="drop-shadow-sm">{assistant.avatar_icon}</span>
            ) : (
              <Sparkles className="w-10 h-10 text-primary" />
            )}
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="space-y-3 max-w-2xl px-4"
          >
            <h3 className="text-3xl sm:text-4xl font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70 pb-1">
              {assistant.name}
            </h3>
            <p className="text-muted-foreground text-[15px] sm:text-base leading-relaxed max-w-lg mx-auto">
              {assistant.description}
            </p>
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {transitionMessage && (
            <motion.div
              layoutId={`transition-message-${transitionMessage.id}`}
              initial={{ opacity: 0, scale: 0.92, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="z-20 flex w-full max-w-3xl justify-end px-4"
            >
              <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-left text-[13px] text-primary-foreground shadow-lg shadow-primary/20">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{transitionMessage.content}</ReactMarkdown>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          layoutId={`chat-input-container-${assistant.id}`}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: isInitializing ? 18 : 0, opacity: isInitializing ? 0.82 : 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 100, damping: 20 }}
          className="w-full mt-6 flex justify-center z-20"
        >
          <div className="w-full max-w-3xl">
            <ChatInput onSend={(msg, imgs, docs) => handleSend(msg, imgs, docs)} disabled={isInitializing} variant="floating" />
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <Card className="flex flex-col h-full border-x-0 sm:border-x rounded-none sm:rounded-xl overflow-hidden shadow-sm relative">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="border-b px-4 py-3 bg-gradient-to-r from-muted/40 to-muted/20 flex items-center gap-3 shrink-0 backdrop-blur-sm"
      >
        {onBack && (
          <Button variant="ghost" size="icon" className="sm:hidden shrink-0 -ml-2" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary shrink-0 border border-primary/10 shadow-sm text-lg">
          {assistant.avatar_icon ? (
            <span className="drop-shadow-sm">{assistant.avatar_icon}</span>
          ) : (
            <Bot className="w-5 h-5" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm">{assistant.name}</h3>
          <p className="text-xs text-muted-foreground line-clamp-1">{session.title}</p>
        </div>
        <ExportDropdown messages={messages} assistant={assistant} session={session} />
      </motion.div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" id="chat-scroll-area">
        <div className="flex flex-col gap-5 max-w-3xl mx-auto w-full pb-4 min-w-0 overflow-hidden">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={msg.id || idx}
                layoutId={
                  transitionMessage && msg.role === "user" && msg.content === transitionMessage.content
                    ? `transition-message-${transitionMessage.id}`
                    : undefined
                }
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 min-w-0 overflow-hidden ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-gradient-to-br from-muted to-muted/60 text-foreground border border-border/50'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`flex flex-col gap-1.5 min-w-0 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {/* Tool badges for saved model messages */}
                  {msg.role === 'model' && msg.tools_used && msg.tools_used.length > 0 && (
                    <ChatToolBadges tools={msg.tools_used} />
                  )}
                  {msg.image_urls?.length > 0 && (
                    <div className={`flex flex-wrap gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.image_urls.map((img, i) => (
                        <img 
                          key={i} 
                          src={img} 
                          alt="Anexo" 
                          className="max-w-32 sm:max-w-48 max-h-32 sm:max-h-48 rounded-xl object-cover border shadow-sm cursor-pointer hover:opacity-90 hover:shadow-md transition-all duration-200" 
                          onClick={() => setSelectedImage(img)} 
                        />
                      ))}
                    </div>
                  )}
                  <div className={`px-4 py-3 min-w-0 overflow-hidden ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-md shadow-sm shadow-primary/20' 
                      : 'bg-card border border-border/50 rounded-2xl rounded-tl-md shadow-sm'
                  }`}>
                    <div className="text-[13px] prose dark:prose-invert prose-sm prose-p:leading-relaxed prose-pre:bg-muted prose-pre:border prose-pre:overflow-x-auto prose-code:text-xs prose-p:my-1.5 prose-headings:my-2 prose-table:w-full prose-table:text-xs prose-th:bg-muted/50 prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:font-medium prose-td:px-3 prose-td:py-2 prose-td:border-t prose-td:border-border/50 max-w-none [overflow-wrap:anywhere] [word-break:break-word] overflow-x-auto">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground/60 px-1">
                    {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {transitionMessage && !hasMatchedTransitionMessage && (
              <motion.div
                layoutId={`transition-message-${transitionMessage.id}`}
                initial={{ opacity: 0.96, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="flex gap-3 min-w-0 overflow-hidden flex-row-reverse"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm bg-primary text-primary-foreground">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex flex-col gap-1.5 min-w-0 max-w-[85%] items-end">
                  <div className="px-4 py-3 min-w-0 overflow-hidden bg-primary text-primary-foreground rounded-2xl rounded-tr-md shadow-sm shadow-primary/20">
                    <div className="text-[13px] prose prose-sm prose-p:my-1.5 max-w-none text-primary-foreground [&_*]:text-inherit [overflow-wrap:anywhere] [word-break:break-word]">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{transitionMessage.content}</ReactMarkdown>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground/60 px-1">agora</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Streaming response */}
          {isSending && streamingContent && (
            <motion.div 
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 flex-row"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-muted to-muted/60 text-foreground flex items-center justify-center shrink-0 border border-border/50 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div className="flex flex-col gap-1.5 max-w-[85%] items-start">
                {activeTools.length > 0 && (
                  <ChatToolBadges tools={activeTools} isStreaming />
                )}
                <div className="px-4 py-3 bg-card border border-border/50 rounded-2xl rounded-tl-md shadow-sm">
                  <div className="text-[13px] prose dark:prose-invert prose-sm prose-p:leading-relaxed prose-pre:bg-muted prose-pre:border prose-pre:overflow-x-auto prose-code:text-xs prose-p:my-1.5 prose-table:w-full prose-table:text-xs prose-th:bg-muted/50 prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:font-medium prose-td:px-3 prose-td:py-2 prose-td:border-t prose-td:border-border/50 max-w-none [overflow-wrap:anywhere] [word-break:break-word] overflow-x-auto">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamingContent}</ReactMarkdown>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-destructive h-7 px-2" onClick={cancelStream}>
                  <Square className="w-3 h-3 mr-1" /> Parar
                </Button>
              </div>
            </motion.div>
          )}

          {/* Loading indicator */}
          {isSending && !streamingContent && (
            <motion.div 
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 flex-row"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-muted to-muted/60 text-foreground flex items-center justify-center shrink-0 border border-border/50 shadow-sm">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="flex flex-col gap-1.5 items-start">
                {activeTools.length > 0 && (
                  <ChatToolBadges tools={activeTools} isStreaming />
                )}
                <div className="px-4 py-3 bg-card border border-border/50 rounded-2xl rounded-tl-md shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={scrollRef} className="h-1" />
        </div>
      </ScrollArea>

      <motion.div 
        layoutId={`chat-input-container-${assistant.id}`}
        className="shrink-0 mt-auto"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <ChatInput onSend={handleSend} disabled={isSending || !session} />
      </motion.div>

      <AssistenteImageViewer imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
    </Card>
  );
}
