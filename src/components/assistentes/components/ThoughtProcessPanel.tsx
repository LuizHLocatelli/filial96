import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Brain, Search, BookOpen, Wand2, FileText, Sparkles, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ThoughtStep, ThoughtType } from "../types";

interface ThoughtProcessPanelProps {
  thoughts: ThoughtStep[];
  className?: string;
}

const getThoughtIcon = (type: ThoughtType) => {
  switch (type) {
    case 'search': return Search;
    case 'rag': return BookOpen;
    case 'reasoning': return Brain;
    case 'generating': return Wand2;
    case 'analyzing': return FileText;
    default: return Sparkles;
  }
};

const getThoughtAccent = (type: ThoughtType) => {
  switch (type) {
    case 'search': return { dot: "bg-blue-500", text: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/8" };
    case 'rag': return { dot: "bg-amber-500", text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/8" };
    case 'reasoning': return { dot: "bg-violet-500", text: "text-violet-600 dark:text-violet-400", bg: "bg-violet-500/8" };
    case 'generating': return { dot: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/8" };
    case 'analyzing': return { dot: "bg-orange-500", text: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/8" };
    default: return { dot: "bg-primary", text: "text-primary", bg: "bg-primary/8" };
  }
};

export function ThoughtProcessPanel({ thoughts, className }: ThoughtProcessPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!thoughts || thoughts.length === 0) return null;

  const lastThought = thoughts[thoughts.length - 1];
  const lastAccent = getThoughtAccent(lastThought?.type || 'reasoning');

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn("w-full max-w-[220px] xs:max-w-[260px] sm:max-w-[340px] mb-3 min-w-0", className)}
    >
      <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden">
        {/* Compact header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted/20 transition-colors group"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", lastAccent.dot)} />
            <span className="text-[11px] font-medium text-muted-foreground/80 truncate text-left">
              {isExpanded ? "Pensamento" : lastThought?.text || "Pensamento"}
            </span>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors shrink-0" />
          </motion.div>
        </button>

        {/* Expandable content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="px-3 pb-2.5 space-y-1 min-w-0">
                {thoughts.map((thought, index) => {
                  const accent = getThoughtAccent(thought.type);
                  const isLatest = index === thoughts.length - 1;

                  return (
                    <motion.div
                      key={thought.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
                      className="flex items-start gap-2 min-w-0"
                    >
                      {/* Timeline connector */}
                      <div className="flex flex-col items-center mt-[7px] shrink-0">
                        <div className="relative">
                          <div className={cn(
                            "w-[6px] h-[6px] rounded-full transition-colors duration-300",
                            isLatest ? accent.dot : "bg-muted-foreground/20"
                          )} />
                          {isLatest && (
                            <motion.div
                              className={cn("absolute -inset-1 rounded-full", accent.dot)}
                              animate={{ scale: [1, 2, 1], opacity: [0.4, 0, 0.4] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            />
                          )}
                        </div>
                        {index < thoughts.length - 1 && (
                          <div className="w-px h-3 bg-border/40 mt-1" />
                        )}
                      </div>

                      {/* Text */}
                      <p className={cn(
                        "text-[11px] leading-relaxed break-words [word-break:break-word] max-w-full py-0.5",
                        isLatest ? "text-foreground/80" : "text-muted-foreground/50"
                      )}>
                        {thought.text}
                      </p>
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
