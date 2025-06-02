
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedButtonProps } from './types/animationTypes';

export function AnimatedButton({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  onClick,
  disabled = false,
  reduceMotion = false
}: AnimatedButtonProps) {

  const buttonVariants = {
    idle: { scale: 1 },
    hover: !reduceMotion ? { 
      scale: 1.05,
      transition: { duration: 0.2, ease: "easeOut" }
    } : {},
    tap: !reduceMotion ? { 
      scale: 0.95,
      transition: { duration: 0.1 }
    } : {},
    loading: !reduceMotion ? {
      scale: [1, 1.02, 1],
      transition: { duration: 1, repeat: Infinity, ease: "easeInOut" }
    } : {}
  };

  return (
    <motion.button
      className={cn(
        "relative overflow-hidden",
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      variants={buttonVariants}
      initial="idle"
      whileHover={!disabled ? "hover" : "idle"}
      whileTap={!disabled ? "tap" : "idle"}
      animate={isLoading ? "loading" : "idle"}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Carregando...</span>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
