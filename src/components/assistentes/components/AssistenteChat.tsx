import { useEffect, useRef, useState } from "react";
import { useChatSession } from "../hooks/useChatSession";
import { ChatInput, type ChatDocument } from "./ChatInput";
import { ChatToolBadges } from "./ChatToolBadges";
import { ExportDropdown } from "./ExportDropdown";
import { AssistenteImageViewer } from "./AssistenteImageViewer";
import { EnhancedStreamingMessage } from "./EnhancedStreamingMessage";
import type { AIAssistant, AIChatSession } from "../types";
import { Bot, User, ArrowLeft, Square, Sparkles } from "lucide-react";
import { LoadingIndicator } from "./LoadingIndicator";
import { StreamingMarkdown } from "./StreamingMarkdown";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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
  const { messages, isLoading, isSending, streamingContent, activeTools, streamStatus, thoughtSteps, ragReferences, webSources, sendMessage, cancelStream } = useChatSession(session?.id || null, assistant);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const prevMessagesLength = useRef(0);

  useEffect(() => {
    if (!scrollRef.current) return;
    
    const viewport = scrollRef.current.closest('[data-radix-scroll-area-viewport]');
    
    const isInitialLoad = prevMessagesLength.current === 0 && messages.length > 0;
    const isNewUserMessage = messages.length > prevMessagesLength.current && messages[messages.length - 1]?.role === 'user';
    
    if (isInitialLoad || isNewUserMessage) {
      if (viewport) {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
    
    prevMessagesLength.current = messages.length;
  }, [messages]);

  useEffect(() => {
    if (isSending && scrollRef.current) {
      const viewport = scrollRef.current.closest('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [isSending]);

  useEffect(() => {
    if (streamStatus === 'using_tools' && scrollRef.current) {
      const viewport = scrollRef.current.closest('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [streamStatus]);

  useEffect(() => {
    if (activeTools.length > 0 && scrollRef.current) {
      const viewport = scrollRef.current.closest('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [activeTools]);

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
        className="flex flex-col items-center justify-center h-full gap-4 text-center px-2.5 py-6 sm:p-8 relative overflow-hidden bg-background"
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
          className="flex flex-col items-center justify-center gap-4 max-w-4xl w-full z-10"
        >
          <motion.div 
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", duration: 0.8, bounce: 0.4 }}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-background to-muted border border-border/50 shadow-xl shadow-primary/5 flex items-center justify-center text-3xl sm:text-4xl overflow-hidden ring-1 ring-white/10"
          >
            {assistant.avatar_icon ? (
              <span className="drop-shadow-sm">{assistant.avatar_icon}</span>
            ) : (
              <span className="text-4xl drop-shadow-sm">🧠</span>
            )}
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="space-y-3 max-w-2xl px-4"
          >
            <h3 className="text-2xl sm:text-4xl font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70 pb-1">
              {assistant.name}
            </h3>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
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
              className="z-20 flex w-full max-w-4xl justify-end px-4"
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
          <div className="w-full max-w-4xl">
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
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary shrink-0 border border-primary/10 shadow-sm text-lg">
          {assistant.avatar_icon ? (
            <span className="drop-shadow-sm">{assistant.avatar_icon}</span>
          ) : (
            <span className="drop-shadow-sm text-base">🧠</span>
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
        <div className="flex flex-col gap-5 max-w-4xl mx-auto w-full pb-4 min-w-0 overflow-hidden">
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
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-gradient-to-br from-muted to-muted/60 text-foreground border border-border/50'
                }`}>
                  {msg.role === 'user' ? <span className="text-sm">❔</span> : <span className="text-sm">🧠</span>}
                </div>
                <div className={`flex flex-col gap-1.5 min-w-0 max-w-[calc(100%-3rem)] sm:max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
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
                    <div className="text-[13px] leading-relaxed">
                      <style>{`
                        .msg-markdown table {
                          width: 100%;
                          border-collapse: collapse;
                          margin: 0.75rem 0;
                          font-size: 0.7rem;
                          overflow-x: auto;
                          display: block;
                        }
                        .msg-markdown thead { background: hsl(var(--muted) / 0.5); }
                        .msg-markdown th { padding: 0.375rem 0.5rem; text-align: left; font-weight: 500; border-bottom: 1px solid hsl(var(--border)); }
                        .msg-markdown td { padding: 0.375rem 0.5rem; border-top: 1px solid hsl(var(--border) / 0.5); }
                        .msg-markdown pre { background: hsl(var(--muted)); border: 1px solid hsl(var(--border)); border-radius: 0.375rem; padding: 0.5rem 0.75rem; overflow-x: auto; margin: 0.5rem 0; }
                        .msg-markdown code { font-size: 0.7rem; font-family: ui-monospace, monospace; }
                        .msg-markdown :not(pre) > code { background: hsl(var(--muted)); padding: 0.1rem 0.3rem; border-radius: 0.2rem; }
                        .msg-markdown ul, .msg-markdown ol { margin: 0.375rem 0; padding-left: 1.25rem; }
                        .msg-markdown li { margin: 0.2rem 0; }
                        .msg-markdown p { margin: 0.375rem 0; }
                        .msg-markdown h1, .msg-markdown h2, .msg-markdown h3, .msg-markdown h4 { margin: 0.75rem 0 0.375rem 0; font-weight: 600; }
                        .msg-markdown blockquote { border-left: 3px solid hsl(var(--primary)); padding-left: 0.75rem; margin: 0.5rem 0; color: hsl(var(--muted-foreground)); }
                        .msg-markdown a { color: hsl(var(--primary)); text-decoration: underline; text-underline-offset: 2px; }
                        .msg-markdown strong { font-weight: 600; }
                        .msg-markdown hr { border: none; border-top: 1px solid hsl(var(--border)); margin: 0.75rem 0; }
                      `}</style>
                      <div className="msg-markdown max-w-none [overflow-wrap:anywhere] [word-break:break-word]">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                      </div>
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
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-sm bg-primary text-primary-foreground">
                  <span className="text-sm">❔</span>
                </div>
                <div className="flex flex-col gap-1.5 min-w-0 max-w-[calc(100%-3rem)] sm:max-w-[85%] items-end">
                  <div className="px-4 py-3 min-w-0 overflow-hidden bg-primary text-primary-foreground rounded-2xl rounded-tr-md shadow-sm shadow-primary/20">
                    <div className="text-[13px] leading-relaxed">
                      <style>{`
                        .transition-markdown table { width: 100%; border-collapse: collapse; margin: 0.75rem 0; font-size: 0.7rem; }
                        .transition-markdown th { padding: 0.375rem 0.5rem; text-align: left; font-weight: 500; border-bottom: 1px solid hsl(var(--primary-foreground) / 0.2); }
                        .transition-markdown td { padding: 0.375rem 0.5rem; border-top: 1px solid hsl(var(--primary-foreground) / 0.1); }
                        .transition-markdown pre { background: hsl(var(--primary-foreground) / 0.1); border-radius: 0.375rem; padding: 0.5rem 0.75rem; overflow-x: auto; margin: 0.5rem 0; }
                        .transition-markdown code { font-size: 0.7rem; font-family: ui-monospace, monospace; }
                        .transition-markdown :not(pre) > code { background: hsl(var(--primary-foreground) / 0.15); padding: 0.1rem 0.3rem; border-radius: 0.2rem; }
                        .transition-markdown ul, .transition-markdown ol { margin: 0.375rem 0; padding-left: 1.25rem; }
                        .transition-markdown li { margin: 0.2rem 0; }
                        .transition-markdown p { margin: 0.375rem 0; }
                        .transition-markdown h1, .transition-markdown h2, .transition-markdown h3 { margin: 0.75rem 0 0.375rem 0; font-weight: 600; }
                        .transition-markdown a { text-decoration: underline; text-underline-offset: 2px; }
                        .transition-markdown strong { font-weight: 600; }
                      `}</style>
                      <div className="transition-markdown max-w-none text-primary-foreground [&_*]:text-inherit [overflow-wrap:anywhere] [word-break:break-word]">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{transitionMessage.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground/60 px-1">agora</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Streaming response */}
          {isSending && (
            <EnhancedStreamingMessage
              assistantAvatar={assistant.avatar_icon}
              assistantName={assistant.name}
              streamingContent={streamingContent}
              isStreaming={isSending}
              streamStatus={streamStatus}
              activeTools={activeTools}
              thoughtSteps={thoughtSteps}
              ragReferences={ragReferences}
              webSources={webSources}
              onCancel={cancelStream}
              className="w-full flex-1 min-w-0 overflow-hidden"
            />
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
