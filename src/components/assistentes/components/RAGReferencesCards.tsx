import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, FileText, BookOpen, Star, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { RAGReference } from "../types";

interface RAGReferencesCardsProps {
  references: RAGReference[];
  className?: string;
}

export function RAGReferencesCards({ references, className }: RAGReferencesCardsProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  if (!references || references.length === 0) return null;

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("w-full max-w-full sm:max-w-[360px] mb-3 min-w-0", className)}
    >
      <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-amber-500/5 to-amber-500/10 backdrop-blur-sm overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 flex items-center gap-2 border-b border-border/30 min-w-0">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 shrink-0">
            <BookOpen className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          </div>
          <span className="text-xs font-medium text-foreground/80 truncate">
            Base de Conhecimento
          </span>
          <span className="ml-auto shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-medium">
            {references.length} {references.length === 1 ? 'documento' : 'documentos'}
          </span>
        </div>

        {/* Content */}
        <div className="p-3 space-y-2">
          {references.map((ref, index) => {
            const isExpanded = expandedIds.has(ref.fileUrl);
            const relevanceClass = ref.relevanceScore >= 90
              ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              : ref.relevanceScore >= 70
              ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
              : "bg-muted text-muted-foreground";

            return (
              <motion.div
                key={ref.fileUrl || ref.fileName}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
                className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden"
              >
                {/* Card header */}
                <button
                  onClick={() => toggleExpanded(ref.fileUrl)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/30 transition-colors text-left"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 shrink-0">
                    <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground/90 truncate pr-2">
                      {ref.fileName}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", relevanceClass)}>
                        {ref.relevanceScore}% relevância
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {ref.fileUrl && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        asChild
                      >
                        <a
                          href={ref.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </Button>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                    )}
                  </div>
                </button>

                {/* Expanded content */}
                <AnimatePresence>
                  {isExpanded && ref.excerpt && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-3">
                        <div className="p-3 rounded-lg bg-muted/40 border border-border/30">
                          <div className="flex items-center gap-1 mb-2">
                            <Star className="w-3 h-3 text-amber-500" />
                            <span className="text-[10px] font-medium text-muted-foreground/80">
                              Trecho utilizado
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground/90 leading-relaxed italic">
                            "{ref.excerpt}"
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
