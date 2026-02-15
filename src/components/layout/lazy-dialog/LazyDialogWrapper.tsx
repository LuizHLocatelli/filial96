import { Suspense, ReactNode, ComponentType, lazy, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useLazyComponent, usePreloadOnHover } from '@/hooks/useLazyComponent';
import { LazyLoadingWrapper } from '../LazyLoadingWrapper';

export interface DialogComponentProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

interface LazyDialogWrapperProps {
  trigger: ReactNode;
  importFunction: () => Promise<{ default: ComponentType<DialogComponentProps> }>;
  dialogProps?: Record<string, unknown>;
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
      return (trigger as (props: Record<string, unknown>) => ReactNode)(getTriggerProps());
    }
    
    if (typeof trigger === 'object' && trigger !== null && 'type' in trigger) {
      const Component = (trigger as { type: ComponentType<unknown> }).type;
      const props = (trigger as { props: Record<string, unknown> }).props;
      return (
        <Component 
          {...props}
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
