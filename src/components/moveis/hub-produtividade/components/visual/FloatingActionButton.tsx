
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { FloatingActionButtonProps } from './types/animationTypes';

export function FloatingActionButton({
  children,
  onClick,
  className,
  position = 'bottom-right',
  reduceMotion = false
}: FloatingActionButtonProps) {

  const positionClasses = {
    'bottom-right': 'fixed bottom-4 right-4',
    'bottom-left': 'fixed bottom-4 left-4',
    'top-right': 'fixed top-4 right-4',
    'top-left': 'fixed top-4 left-4'
  };

  const fabVariants = {
    idle: { scale: 1, y: 0 },
    hover: !reduceMotion ? {
      scale: 1.1,
      y: -2,
      transition: { duration: 0.2, ease: "easeOut" }
    } : {},
    tap: !reduceMotion ? {
      scale: 0.95,
      transition: { duration: 0.1 }
    } : {}
  };

  return (
    <motion.button
      className={cn(
        "z-50 p-4 rounded-full shadow-lg",
        "bg-primary text-primary-foreground",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
        positionClasses[position],
        className
      )}
      variants={fabVariants}
      initial="idle"
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}
