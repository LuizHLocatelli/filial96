
import { motion } from 'framer-motion';
import { AnimatedListProps } from './types/animationTypes';

export function AnimatedList({
  children,
  className,
  staggerDelay = 0.1,
  reduceMotion = false
}: AnimatedListProps) {

  const listVariants = {
    animate: {
      transition: {
        staggerChildren: reduceMotion ? 0 : staggerDelay
      }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: reduceMotion ? 0.15 : 0.3 }
    }
  };

  return (
    <motion.div
      className={className}
      variants={listVariants}
      initial="initial"
      animate="animate"
    >
      {children.map((child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
