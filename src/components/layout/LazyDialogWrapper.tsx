import { Suspense, ReactNode, ComponentType, lazy, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useLazyComponent, usePreloadOnHover } from '@/hooks/useLazyComponent';
import { LazyLoadingWrapper } from './LazyLoadingWrapper';

interface LazyDialogWrapperProps {
  trigger: ReactNode;
  importFunction: () => Promise<{ default: ComponentType<any> }>;
  dialogProps?: any;
  componentName: string;
  preloadStrategy?: 'hover' | 'immediate' | 'visible';
  className?: string;
}

export function LazyDialogWrapper({
  trigger,
  importFunction,
  dialogProps = {},
  componentName,
  preloadStrategy = 'immediate',
  className
}: LazyDialogWrapperProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldLoadContent, setShouldLoadContent] = useState(false);
  const { preloadOnHover } = usePreloadOnHover();

  // Lazy load do componente do dialog
  const LazyDialogContent = useLazyComponent(importFunction, componentName);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && !shouldLoadContent) {
      setShouldLoadContent(true);
    }
  };

  const getTriggerProps = () => {
    const baseProps = {
      onClick: () => handleOpenChange(true),
      className
    };

    if (preloadStrategy === 'hover') {
      return {
        ...baseProps,
        ...preloadOnHover(importFunction, componentName)
      };
    }

    return baseProps;
  };

  const renderTrigger = () => {
    if (typeof trigger === 'function') {
      return (trigger as Function)(getTriggerProps());
    }
    
    // Se for um elemento React, clonamos com as props necessárias
    if (typeof trigger === 'object' && trigger !== null && 'type' in trigger) {
      const Component = (trigger as any).type;
      return (
        <Component 
          {...(trigger as any).props}
          {...getTriggerProps()}
        />
      );
    }

    return (
      <div {...getTriggerProps()}>
        {trigger}
      </div>
    );
  };

  return (
    <>
      {renderTrigger()}
      
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        {shouldLoadContent && (
          <LazyLoadingWrapper type="dialog">
            <LazyDialogContent 
              {...dialogProps}
              open={isOpen}
              onOpenChange={handleOpenChange}
            />
          </LazyLoadingWrapper>
        )}
      </Dialog>
    </>
  );
}

// Hook para usar lazy dialogs de forma mais simples
export function useLazyDialog(
  importFunction: () => Promise<{ default: ComponentType<any> }>,
  componentName: string
) {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldLoadContent, setShouldLoadContent] = useState(false);

  const LazyDialogContent = useLazyComponent(importFunction, componentName);

  const openDialog = () => {
    setIsOpen(true);
    if (!shouldLoadContent) {
      setShouldLoadContent(true);
    }
  };

  const closeDialog = () => {
    setIsOpen(false);
  };

  const DialogComponent = ({ children, ...props }: { children?: ReactNode; [key: string]: any }) => (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {shouldLoadContent ? (
        <LazyLoadingWrapper type="dialog">
          <LazyDialogContent
            {...props}
            open={isOpen}
            onOpenChange={setIsOpen}
          >
            {children}
          </LazyDialogContent>
        </LazyLoadingWrapper>
      ) : null}
    </Dialog>
  );

  return {
    isOpen,
    openDialog,
    closeDialog,
    DialogComponent
  };
}

// Componente para lazy loading de conteúdo dentro de dialogs já existentes
interface LazyDialogContentWrapperProps {
  importFunction: () => Promise<{ default: ComponentType<any> }>;
  componentName: string;
  shouldLoad: boolean;
  fallback?: ReactNode;
  [key: string]: any;
}

export function LazyDialogContentWrapper({
  importFunction,
  componentName,
  shouldLoad,
  fallback,
  ...props
}: LazyDialogContentWrapperProps) {
  const LazyContent = useLazyComponent(importFunction, componentName);

  if (!shouldLoad) {
    return fallback || null;
  }

  return (
    <Suspense fallback={
      fallback || (
        <div className="flex items-center justify-center p-8">
          <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
            <p className="text-xs text-muted-foreground">Carregando...</p>
          </div>
        </div>
      )
    }>
      <LazyContent {...props} />
    </Suspense>
  );
} 