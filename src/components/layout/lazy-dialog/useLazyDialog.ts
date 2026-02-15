import { useState, ComponentType } from 'react';
import { useLazyComponent } from '@/hooks/useLazyComponent';
import type { DialogComponentProps } from './LazyDialogWrapper';

export function useLazyDialog(
  importFunction: () => Promise<{ default: ComponentType<DialogComponentProps> }>,
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

  return {
    isOpen,
    shouldLoadContent,
    LazyDialogContent,
    openDialog,
    closeDialog,
    setIsOpen
  };
}
