import { motion } from 'framer-motion';
import type { TypingIndicatorProps } from '../types';

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className={`flex gap-3 justify-start ${className || ''}`}
    >
      <div className="bg-muted/50 dark:bg-muted/30 backdrop-blur-sm rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-primary/5 dark:border-primary/10">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((dot) => (
            <motion.div
              key={dot}
              className="w-2 h-2 bg-primary/60 dark:bg-primary/70 rounded-full"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                repeat: Infinity,
                duration: 0.8,
                delay: dot * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
