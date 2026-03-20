import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Brain, Search, BookOpen, Wand2, FileText, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ThoughtStep, ThoughtType } from "../types";

interface ThoughtProcessPanelProps {
  thoughts: ThoughtStep[];
  className?: string;
}

const getThoughtIcon = (type: ThoughtType) => {
  switch (type) {
    case 'search':
      return Search;
    case 'rag':
      return BookOpen;
    case 'reasoning':
      return Brain;
    case 'generating':
      return Wand2;
    case 'analyzing':
      return FileText;
    default:
      return Sparkles;
  }
};

const getThoughtColor = (type: ThoughtType) => {
  switch (type) {
    case 'search':
      return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    case 'rag':
      return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    case 'reasoning':
      return "text-purple-500 bg-purple-500/10 border-purple-500/20";
    case 'generating':
      return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    case 'analyzing':
      return "text-orange-500 bg-orange-500/10 border-orange-500/20";
    default:
      return "text-primary bg-primary/10 border-primary/20";
  }
};

export function ThoughtProcessPanel({ thoughts, className }: ThoughtProcessPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!thoughts || thoughts.length === 0) return null;

  const lastThought = thoughts[thoughts.length - 1];
  const Icon = getThoughtIcon(lastThought?.type || 'reasoning');
  const colorClass = getThoughtColor(lastThought?.type || 'reasoning');

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("w-full max-w-[360px] mb-3", className)}
    >
      <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-muted/40 to-muted/20 backdrop-blur-sm overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className={cn("flex items-center justify-center w-6 h-6 rounded-full", colorClass.split(' ').slice(1).join(' '))}>
              <Icon className="w-3 h-3" />
            </div>
            <span className="text-xs font-medium text-foreground/80">Pensamento do Assistente</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground/60" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground/60" />
          )}
        </button>

        {/* Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-3 space-y-2">
                {thoughts.map((thought, index) => {
                  const ThoughtIcon = getThoughtIcon(thought.type);
                  const thoughtColorClass = getThoughtColor(thought.type);
                  const isLatest = index === thoughts.length - 1;

                  return (
                    <motion.div
                      key={thought.id}
                      initial={{ opacity: 0, x: -10, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: 'auto' }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="flex items-start gap-2"
                    >
                      {/* Timeline dot */}
                      <div className="flex flex-col items-center mt-1">
                        <div className={cn(
                          "w-2 h-2 rounded-full border",
                          thoughtColorClass.split(' ').slice(1).join(' ')
                        )}>
                          {isLatest && (
                            <motion.div
                              className="w-full h-full rounded-full bg-current"
                              animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            />
                          )}
                        </div>
                        {index < thoughts.length - 1 && (
                          <div className="w-px h-4 bg-border/60 mt-1" />
                        )}
                      </div>

                      {/* Content */}
                      <div className={cn(
                        "flex-1 min-w-0 px-2.5 py-1.5 rounded-lg text-xs",
                        isLatest ? "bg-muted/60 border border-border/50" : "bg-muted/30"
                      )}>
                        <p className={cn(
                          "leading-relaxed",
                          isLatest ? "text-foreground/90" : "text-muted-foreground/80"
                        )}>
                          {thought.text}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
