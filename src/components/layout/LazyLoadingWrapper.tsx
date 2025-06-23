
import { Suspense, ReactNode } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface LazyLoadingWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  type?: 'page' | 'component' | 'dialog';
  className?: string;
}

const LoadingSpinner = ({ type, isMobile }: { type: string; isMobile: boolean }) => {
  const getLoadingContent = () => {
    switch (type) {
      case 'page':
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Carregando página...</p>
            </div>
          </div>
        );
      case 'dialog':
        return (
          <div className="flex items-center justify-center p-8">
            <div className="flex flex-col items-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              <p className="text-xs text-muted-foreground">Carregando...</p>
            </div>
          </div>
        );
      default:
        return (
          <div className={cn(
            "flex items-center justify-center p-4",
            isMobile ? "min-h-[200px]" : "min-h-[300px]"
          )}>
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        );
    }
  };

  return getLoadingContent();
};

export function LazyLoadingWrapper({ 
  children, 
  fallback, 
  type = 'component',
  className 
}: LazyLoadingWrapperProps) {
  const isMobile = useIsMobile();

  const defaultFallback = <LoadingSpinner type={type} isMobile={isMobile} />;

  return (
    <div className={cn("w-full", className)}>
      <Suspense fallback={fallback || defaultFallback}>
        {children}
      </Suspense>
    </div>
  );
}
