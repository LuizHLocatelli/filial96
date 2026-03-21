import { motion } from "framer-motion";
import { Brain, Search, BookOpen, Wand2, CheckCircle2 } from "lucide-react";
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
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn("w-full max-w-[220px] xs:max-w-[260px] sm:max-w-[340px] mb-3 min-w-0", className)}
    >
      <div className="relative px-2 py-2.5 sm:px-3 sm:py-3 rounded-xl bg-card/80 border border-border/60 backdrop-blur-sm overflow-hidden">
        {/* Subtle animated background */}
        {status !== 'idle' && status !== 'done' && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/[0.04] to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
        )}

        <div className="relative flex items-center justify-between w-full gap-0.5">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === steps.length - 1;

            return (
              <div key={step.id} className={cn("flex items-center min-w-0", !isLast && "flex-1")}>
                <div className="flex flex-col items-center gap-1 min-w-0 w-full">
                  {/* Step circle */}
                  <div className="relative">
                    {/* Pulse ring for active */}
                    {step.status === 'active' && (
                      <motion.div
                        className="absolute -inset-1 rounded-full border border-primary/40"
                        animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                      />
                    )}

                    <motion.div
                      className={cn(
                        "relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full transition-all duration-500",
                        step.status === 'completed' && "bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-300/60 dark:border-emerald-700/50",
                        step.status === 'active' && "bg-primary/15 border border-primary/40 shadow-sm shadow-primary/10",
                        step.status === 'pending' && "bg-muted/40 border border-dashed border-muted-foreground/15"
                      )}
                      animate={step.status === 'active' ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      {step.status === 'completed' ? (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        </motion.div>
                      ) : step.status === 'active' ? (
                        <Icon className="w-3.5 h-3.5 text-primary" />
                      ) : (
                        <Icon className="w-3.5 h-3.5 text-muted-foreground/35" />
                      )}
                    </motion.div>
                  </div>

                  {/* Label */}
                  <span className={cn(
                    "text-[9px] sm:text-[10px] font-medium transition-colors duration-500 text-center leading-tight max-w-full",
                    step.status === 'completed' && "text-emerald-600 dark:text-emerald-400",
                    step.status === 'active' && "text-primary font-semibold",
                    step.status === 'pending' && "text-muted-foreground/35"
                  )}>
                    {step.label}
                  </span>
                </div>

                {/* Connector */}
                {!isLast && (
                  <div className="flex-1 min-w-[6px] max-w-[28px] h-[2px] mx-0.5 sm:mx-1.5 relative overflow-hidden rounded-full shrink-1 self-start mt-3.5 sm:mt-4">
                    <div className="absolute inset-0 bg-muted-foreground/10 rounded-full" />
                    {step.status === 'completed' && (
                      <motion.div
                        className="absolute inset-0 bg-emerald-400 dark:bg-emerald-500 rounded-full"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        style={{ transformOrigin: 'left' }}
                      />
                    )}
                    {step.status === 'active' && (
                      <motion.div
                        className="absolute inset-0 w-1/2 bg-primary/60 rounded-full"
                        animate={{ x: ['-50%', '200%'] }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
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
