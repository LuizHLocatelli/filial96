
import { ReactNode } from 'react';

export interface BaseAnimationProps {
  children: ReactNode;
  className?: string;
  reduceMotion?: boolean;
}

export interface AnimationVariant {
  initial: Record<string, any>;
  animate: Record<string, any>;
  exit: Record<string, any>;
}

export type AnimationVariantType = 'fadeInUp' | 'fadeInScale' | 'slideInLeft' | 'slideInRight';

export interface AnimatedContainerProps extends BaseAnimationProps {
  variant?: AnimationVariantType;
  delay?: number;
  duration?: number;
  stagger?: number;
}

export interface AnimatedCardProps extends BaseAnimationProps {
  hoverScale?: number;
  hoverRotate?: number;
  onClick?: () => void;
  isActive?: boolean;
}

export interface AnimatedButtonProps extends BaseAnimationProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export interface AnimatedListProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
  reduceMotion?: boolean;
}

export interface AnimatedBadgeProps extends BaseAnimationProps {
  count?: number;
  showPulse?: boolean;
  color?: 'primary' | 'secondary' | 'destructive' | 'warning';
}

export interface AnimatedProgressProps {
  value: number;
  max?: number;
  className?: string;
  showPercentage?: boolean;
  color?: string;
  reduceMotion?: boolean;
}

export interface AnimatedSkeletonProps {
  className?: string;
  lines?: number;
  avatar?: boolean;
  reduceMotion?: boolean;
}

export interface FloatingActionButtonProps extends BaseAnimationProps {
  onClick: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}
