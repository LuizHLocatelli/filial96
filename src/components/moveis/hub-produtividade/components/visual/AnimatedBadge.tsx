
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AnimatedBadgeProps } from './types/animationTypes';

export function AnimatedBadge({
  children,
  className,
  count,
  showPulse = false,
  color = 'primary',
  reduceMotion = false
}: AnimatedBadgeProps) {

  const pulseAnimation = !reduceMotion && showPulse ? {
    scale: [1, 1.1, 1],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  } : {};

  return (
    <motion.div
      className={cn("relative", className)}
      animate={pulseAnimation}
    >
      {children}
      <AnimatePresence>
        {count && count > 0 && (
          <motion.div
            key={count}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className={cn(
              "absolute -top-2 -right-2 h-5 w-5 rounded-full",
              "flex items-center justify-center text-xs font-bold",
              "text-white",
              color === 'primary' && "bg-primary",
              color === 'secondary' && "bg-secondary",
              color === 'destructive' && "bg-destructive",
              color === 'warning' && "bg-orange-500"
            )}
          >
            {count > 99 ? '99+' : count}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
