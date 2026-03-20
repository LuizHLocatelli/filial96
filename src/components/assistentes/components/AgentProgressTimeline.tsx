import { motion } from "framer-motion";
import { Brain, Search, BookOpen, Wand2, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StreamStatus } from "../types";

interface AgentProgressTimelineProps {
  status: StreamStatus;
  activeTools: string[];
  className?: string;
}

interface TimelineStep {
  id: string;
  label: string;
  icon: typeof Brain;
  status: 'pending' | 'active' | 'completed';
}

export function AgentProgressTimeline({ status, activeTools, className }: AgentProgressTimelineProps) {
  const steps: TimelineStep[] = [
    {
      id: 'thinking',
      label: 'Pensando',
      icon: Brain,
      status: status === 'thinking' ? 'active' : status !== 'idle' ? 'completed' : 'pending',
    },
    {
      id: 'using_tools',
      label: 'Consultando',
      icon: activeTools.includes('web_search') || activeTools.includes('rag') || activeTools.includes('document_analysis') ? Search : BookOpen,
      status: status === 'using_tools' ? 'active' : ['using_tools', 'generating', 'done'].includes(status) ? 'completed' : 'pending',
    },
    {
      id: 'generating',
      label: 'Gerando',
      icon: Wand2,
      status: status === 'generating' ? 'active' : status === 'done' ? 'completed' : 'pending',
    },
    {
      id: 'done',
      label: 'Pronto',
      icon: CheckCircle2,
      status: status === 'done' ? 'completed' : 'pending',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("w-full max-w-[200px] xs:max-w-[240px] sm:max-w-[320px] mb-3 min-w-0", className)}
    >
      <div className="relative px-1 py-2 sm:px-2 sm:py-3 rounded-2xl bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/10 backdrop-blur-sm overflow-hidden">
        {/* Animated gradient background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
          animate={status !== 'idle' && status !== 'done' ? { x: ['-200%', '200%'] } : { x: '-200%' }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />

        <div className="relative flex items-center justify-between w-full">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === steps.length - 1;

            return (
              <div key={step.id} className={cn("flex items-center min-w-0", !isLast && "flex-1")}>
                <div className="flex flex-col items-center gap-1.5 min-w-0 w-full">
                  {/* Step icon */}
                  <div
                    className={cn(
                      "relative flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 rounded-full transition-all duration-300",
                      step.status === 'completed' && "bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 border border-emerald-500/30",
                      step.status === 'active' && "bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 shadow-lg shadow-primary/20",
                      step.status === 'pending' && "bg-muted/50 border border-dashed border-muted-foreground/20"
                    )}
                  >
                    {/* Glow effect for active step */}
                    {step.status === 'active' && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-primary/30"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}

                    {/* Icon */}
                    {step.status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : step.status === 'active' ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      >
                        <Loader2 className="w-4 h-4 text-primary" />
                      </motion.div>
                    ) : (
                      <Icon className="w-4 h-4 text-muted-foreground/50" />
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={cn(
                      "text-[10px] font-medium transition-colors duration-300 text-center leading-tight break-words max-w-full",
                      step.status === 'completed' && "text-emerald-600 dark:text-emerald-400",
                      step.status === 'active' && "text-primary",
                      step.status === 'pending' && "text-muted-foreground/50"
                    )}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connector line */}
                {!isLast && (
                  <div className="flex-1 min-w-[4px] max-w-[24px] h-[3px] mx-1 sm:mx-2 relative overflow-hidden rounded-full shrink-1">
                    <div className="absolute inset-0 bg-muted-foreground/20" />
                    {step.status === 'completed' && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-400"
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                    {step.status === 'active' && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-primary to-primary/50"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
