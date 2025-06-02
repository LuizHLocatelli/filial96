
import { motion } from 'framer-motion';
import { AnimatedContainerProps } from './types/animationTypes';
import { animationVariants } from './utils/animationVariants';

export function AnimatedContainer({
  children,
  className,
  variant = 'fadeInUp',
  delay = 0,
  duration = 0.3,
  stagger = 0.1,
  reduceMotion = false
}: AnimatedContainerProps) {
  
  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay
      }
    }
  };

  return (
    <motion.div
      className={className}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={containerVariants}
      transition={{ duration }}
    >
      {children}
    </motion.div>
  );
}
