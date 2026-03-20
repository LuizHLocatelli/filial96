import { motion } from "framer-motion";
import { Bot, Square, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StreamingMarkdown } from "./StreamingMarkdown";
import { ChatToolBadges } from "./ChatToolBadges";
import { AgentProgressTimeline } from "./AgentProgressTimeline";
import { ThoughtProcessPanel } from "./ThoughtProcessPanel";
import { RAGReferencesCards } from "./RAGReferencesCards";
import { WebSourcesPanel } from "./WebSourcesPanel";
import { cn } from "@/lib/utils";
import type { StreamStatus, ThoughtStep, RAGReference, WebSource } from "../types";

interface EnhancedStreamingMessageProps {
  assistantAvatar?: string;
  assistantName?: string;
  streamingContent: string;
  isStreaming: boolean;
  streamStatus: StreamStatus;
  activeTools: string[];
  thoughtSteps: ThoughtStep[];
  ragReferences: RAGReference[];
  webSources: WebSource[];
  onCancel?: () => void;
  className?: string;
}

export function EnhancedStreamingMessage({
  assistantAvatar,
  assistantName,
  streamingContent,
  isStreaming,
  streamStatus,
  activeTools,
  thoughtSteps,
  ragReferences,
  webSources,
  onCancel,
  className,
}: EnhancedStreamingMessageProps) {
  const showProgress = streamStatus !== 'idle' && streamStatus !== 'done';
  const showThoughtPanel = thoughtSteps.length > 0;
  const showRAGRefs = ragReferences.length > 0;
  const showWebSources = webSources.length > 0;
  const isGeneratingText = streamingContent.trim() !== '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className={cn("flex gap-3 flex-row", className)}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 shadow-sm flex items-center justify-center text-lg overflow-hidden">
          {assistantAvatar ? (
            <span className="drop-shadow-sm">{assistantAvatar}</span>
          ) : (
            <span className="drop-shadow-sm text-base">🧠</span>
          )}
        </div>
        
        {/* Online/Streaming indicator */}
        <motion.div
          className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-border"
          animate={isStreaming ? { scale: [1, 1.2, 1], opacity: [1, 0.7, 1] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 min-w-0 flex-1 max-w-[calc(100%-3rem)] sm:max-w-[85%] overflow-hidden">
        {/* Progress Timeline */}
        {showProgress && (
          <AgentProgressTimeline
            status={streamStatus}
            activeTools={activeTools}
          />
        )}

        {/* Thought Process Panel */}
        {showThoughtPanel && (
          <ThoughtProcessPanel thoughts={thoughtSteps} />
        )}

        {/* Tool Badges */}
        {activeTools.length > 0 && (
          <ChatToolBadges
            tools={activeTools}
            isStreaming={isStreaming}
            isGeneratingText={isGeneratingText}
          />
        )}

        {/* Loading state when no content yet */}
        {!streamingContent && !showProgress && !showThoughtPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl rounded-tl-md bg-card border border-border/50 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs text-muted-foreground">Iniciando...</span>
          </motion.div>
        )}

        {/* Streaming content */}
        {streamingContent && (
          <>
            <div className="px-4 py-3 bg-card border border-border/50 rounded-2xl rounded-tl-md shadow-sm">
              <StreamingMarkdown content={streamingContent} isStreaming={isStreaming} />
            </div>

            {/* Stop button */}
            {isStreaming && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-destructive h-7 px-2 self-start"
                onClick={onCancel}
              >
                <Square className="w-3 h-3 mr-1" />
                Parar
              </Button>
            )}
          </>
        )}

        {/* RAG References */}
        {showRAGRefs && (
          <RAGReferencesCards references={ragReferences} />
        )}

        {/* Web Sources */}
        {showWebSources && (
          <WebSourcesPanel sources={webSources} />
        )}
      </div>
    </motion.div>
  );
}
