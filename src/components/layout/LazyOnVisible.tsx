
import { ReactNode } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { LazyLoadingWrapper } from './LazyLoadingWrapper';

interface LazyOnVisibleProps {
  children: ReactNode;
  fallback?: ReactNode;
  threshold?: number;
  rootMargin?: string;
  className?: string;
  placeholder?: ReactNode;
}

export function LazyOnVisible({
  children,
  fallback,
  threshold = 0.1,
  rootMargin = '100px',
  className,
  placeholder
}: LazyOnVisibleProps) {
  const { ref, isIntersecting, hasTriggered } = useIntersectionObserver({
    threshold,
    rootMargin,
    triggerOnce: true
  });

  const defaultPlaceholder = (
    <div className="w-full h-48 bg-muted/30 animate-pulse rounded-lg flex items-center justify-center">
      <div className="text-sm text-muted-foreground">Carregando conteúdo...</div>
    </div>
  );

  return (
    <div ref={ref} className={className}>
      {hasTriggered || isIntersecting ? (
        <LazyLoadingWrapper fallback={fallback}>
          {children}
        </LazyLoadingWrapper>
      ) : (
        placeholder || defaultPlaceholder
      )}
    </div>
  );
}
