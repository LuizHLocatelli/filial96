import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AnimatedProgressProps } from './types/animationTypes';

export function AnimatedProgress({
  value,
  max = 100,
  className,
  showPercentage = true,
  color = "hsl(var(--primary))",
  reduceMotion = false
}: AnimatedProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between items-center mb-1">
        {showPercentage && (
          <motion.span
            className="text-sm font-medium text-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key={percentage}
          >
            {Math.round(percentage)}%
          </motion.span>
        )}
      </div>
      <div className="w-full bg-muted/60 dark:bg-muted/40 border border-border/50 rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-full rounded-full relative"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: reduceMotion ? 0 : 1,
            ease: "easeOut"
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full" />
        </motion.div>
      </div>
    </div>
  );
}
