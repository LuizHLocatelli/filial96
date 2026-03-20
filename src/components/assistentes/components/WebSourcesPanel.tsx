import { motion } from "framer-motion";
import { Globe, ExternalLink, CheckCircle2, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WebSource } from "../types";

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

interface WebSourcesPanelProps {
  sources: WebSource[];
  className?: string;
}

export function WebSourcesPanel({ sources, className }: WebSourcesPanelProps) {
  if (!sources || sources.length === 0) return null;

  const uniqueSources = sources
    .filter((s, i, arr) => arr.findIndex(x => x.uri === s.uri) === i)
    .filter(s => isValidUrl(s.uri));

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("w-full max-w-full sm:max-w-[360px] mb-3 min-w-0", className)}
    >
      <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-blue-500/5 to-blue-500/10 backdrop-blur-sm overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 flex items-center gap-2 border-b border-border/30 min-w-0">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 shrink-0">
            <Globe className="w-3 h-3 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-xs font-medium text-foreground/80 truncate">
            Fontes da Web
          </span>
          <span className="ml-auto shrink-0 flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 font-medium">
            <CheckCircle2 className="w-3 h-3" />
            Verificado
          </span>
        </div>

        {/* Content */}
        <div className="p-3 space-y-2">
          {uniqueSources.slice(0, 5).map((source, index) => (
            <motion.a
              key={source.uri}
              href={source.uri}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm hover:bg-card/80 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-200 group"
            >
              {/* Icon */}
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 shrink-0 group-hover:from-blue-500/20 group-hover:to-blue-500/10 transition-colors">
                <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground/90 line-clamp-2 leading-snug">
                  {source.title}
                </p>
                <div className="flex items-center gap-1.5 mt-1 min-w-0">
                  <Link2 className="w-3 h-3 text-muted-foreground/50" />
                  <span className="text-[10px] text-muted-foreground/70 truncate">
                    {source.domain}
                  </span>
                </div>
              </div>

              {/* External link indicator */}
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted/50 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <ExternalLink className="w-3 h-3 text-muted-foreground/70" />
              </div>
            </motion.a>
          ))}

          {uniqueSources.length > 5 && (
            <p className="text-[10px] text-center text-muted-foreground/60 py-1">
              +{uniqueSources.length - 5} mais fontes
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
