import { useState, useEffect, ReactNode, useRef } from 'react';
import { motion, AnimatePresence, useAnimation, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTheme } from './ThemeProvider';
import { Loader2 } from 'lucide-react';

// Variantes de animação base
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const fadeInScale = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
};

const slideInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};

const slideInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
};

const bounce = {
  initial: { scale: 1 },
  animate: { scale: [1, 1.05, 1] },
  transition: { duration: 0.3, ease: "easeInOut" }
};

// Wrapper principal para animações
interface AnimatedContainerProps {
  children: ReactNode;
  className?: string;
  variant?: 'fadeInUp' | 'fadeInScale' | 'slideInLeft' | 'slideInRight';
  delay?: number;
  duration?: number;
  stagger?: number;
}

export function AnimatedContainer({
  children,
  className,
  variant = 'fadeInUp',
  delay = 0,
  duration = 0.3,
  stagger = 0.1
}: AnimatedContainerProps) {
  const { config } = useTheme();
  
  if (config.animationLevel === 'none') {
    return <div className={className}>{children}</div>;
  }

  const variants = {
    fadeInUp,
    fadeInScale,
    slideInLeft,
    slideInRight
  };

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
      transition={{ duration: config.animationLevel === 'reduced' ? duration * 0.5 : duration }}
    >
      {children}
    </motion.div>
  );
}

// Card animado com hover effects
interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  hoverScale?: number;
  hoverRotate?: number;
  onClick?: () => void;
  isActive?: boolean;
}

export function AnimatedCard({
  children,
  className,
  hoverScale = 1.02,
  hoverRotate = 0,
  onClick,
  isActive = false
}: AnimatedCardProps) {
  const { config } = useTheme();
  
  const hoverAnimation = config.animationLevel !== 'none' ? {
    scale: hoverScale,
    rotate: hoverRotate,
    transition: { duration: 0.2, ease: "easeOut" }
  } : {};

  const tapAnimation = config.animationLevel !== 'none' ? {
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
      layout={config.animationLevel === 'full'}
    >
      {children}
    </motion.div>
  );
}

// Button com animações avançadas
interface AnimatedButtonProps {
  children: ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export function AnimatedButton({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  onClick,
  disabled = false
}: AnimatedButtonProps) {
  const { config } = useTheme();

  const buttonVariants = {
    idle: { scale: 1 },
    hover: config.animationLevel !== 'none' ? { 
      scale: 1.05,
      transition: { duration: 0.2, ease: "easeOut" }
    } : {},
    tap: config.animationLevel !== 'none' ? { 
      scale: 0.95,
      transition: { duration: 0.1 }
    } : {},
    loading: config.animationLevel !== 'none' ? {
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

// Lista animada com stagger
interface AnimatedListProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
}

export function AnimatedList({
  children,
  className,
  staggerDelay = 0.1
}: AnimatedListProps) {
  const { config } = useTheme();

  const listVariants = {
    animate: {
      transition: {
        staggerChildren: config.animationLevel === 'none' ? 0 : staggerDelay
      }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: config.animationLevel === 'reduced' ? 0.15 : 0.3 }
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

// Badge com micro-animações
interface AnimatedBadgeProps {
  children: ReactNode;
  className?: string;
  count?: number;
  showPulse?: boolean;
  color?: 'primary' | 'secondary' | 'destructive' | 'warning';
}

export function AnimatedBadge({
  children,
  className,
  count,
  showPulse = false,
  color = 'primary'
}: AnimatedBadgeProps) {
  const { config } = useTheme();

  const pulseAnimation = config.animationLevel === 'full' && showPulse ? {
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

// Progress bar animado
interface AnimatedProgressProps {
  value: number;
  max?: number;
  className?: string;
  showPercentage?: boolean;
  color?: string;
}

export function AnimatedProgress({
  value,
  max = 100,
  className,
  showPercentage = true,
  color = "hsl(var(--primary))"
}: AnimatedProgressProps) {
  const { config } = useTheme();
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between items-center mb-1">
        {showPercentage && (
          <motion.span
            className="text-sm font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key={percentage}
          >
            {Math.round(percentage)}%
          </motion.span>
        )}
      </div>
      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: config.animationLevel === 'none' ? 0 : 
                     config.animationLevel === 'reduced' ? 0.5 : 1,
            ease: "easeOut"
          }}
        />
      </div>
    </div>
  );
}

// Loading skeleton animado
interface AnimatedSkeletonProps {
  className?: string;
  lines?: number;
  avatar?: boolean;
}

export function AnimatedSkeleton({
  className,
  lines = 3,
  avatar = false
}: AnimatedSkeletonProps) {
  const { config } = useTheme();

  const shimmerAnimation = config.animationLevel !== 'none' ? {
    x: [-100, 100],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  } : {};

  return (
    <div className={cn("animate-pulse", className)}>
      <div className="flex space-x-4">
        {avatar && (
          <div className="rounded-full bg-muted h-10 w-10 relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={shimmerAnimation}
            />
          </div>
        )}
        <div className="flex-1 space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-4 bg-muted rounded relative overflow-hidden",
                i === lines - 1 && "w-3/4"
              )}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={shimmerAnimation}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Floating Action Button com animações
interface FloatingActionButtonProps {
  children: ReactNode;
  onClick: () => void;
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export function FloatingActionButton({
  children,
  onClick,
  className,
  position = 'bottom-right'
}: FloatingActionButtonProps) {
  const { config } = useTheme();

  const positionClasses = {
    'bottom-right': 'fixed bottom-4 right-4',
    'bottom-left': 'fixed bottom-4 left-4',
    'top-right': 'fixed top-4 right-4',
    'top-left': 'fixed top-4 left-4'
  };

  const fabVariants = {
    idle: { scale: 1, y: 0 },
    hover: config.animationLevel !== 'none' ? {
      scale: 1.1,
      y: -2,
      transition: { duration: 0.2, ease: "easeOut" }
    } : {},
    tap: config.animationLevel !== 'none' ? {
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

// Hook para animações baseadas no scroll
export function useScrollAnimation() {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.1
  });

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [controls, isInView]);

  return { ref, controls };
} 