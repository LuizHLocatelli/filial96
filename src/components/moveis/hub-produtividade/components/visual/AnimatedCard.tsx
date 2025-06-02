
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AnimatedCardProps } from './types/animationTypes';
import { fadeInScale } from './utils/animationVariants';

export function AnimatedCard({
  children,
  className,
  hoverScale = 1.02,
  hoverRotate = 0,
  onClick,
  isActive = false,
  reduceMotion = false
}: AnimatedCardProps) {
  
  const hoverAnimation = !reduceMotion ? {
    scale: hoverScale,
    rotate: hoverRotate,
    transition: { duration: 0.2, ease: "easeOut" }
  } : {};

  const tapAnimation = !reduceMotion ? {
    scale: 0.98,
    transition: { duration: 0.1 }
  } : {};

  return (
    <motion.div
      className={cn(
        "transition-shadow duration-200",
        onClick && "cursor-pointer",
        isActive && "ring-2 ring-primary",
        className
      )}
      whileHover={hoverAnimation}
      whileTap={tapAnimation}
      onClick={onClick}
      variants={fadeInScale}
      layout={!reduceMotion}
    >
      {children}
    </motion.div>
  );
}
