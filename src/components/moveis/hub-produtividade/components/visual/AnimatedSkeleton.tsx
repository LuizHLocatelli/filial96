
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AnimatedSkeletonProps } from './types/animationTypes';

export function AnimatedSkeleton({
  className,
  lines = 3,
  avatar = false,
  reduceMotion = false
}: AnimatedSkeletonProps) {

  const shimmerAnimation = !reduceMotion ? {
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
