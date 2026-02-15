import { useEffect, useRef } from 'react';

export function useDialogScroll() {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = contentRef.current;
    if (!element) return;

    // Forçar scroll habilitado via inline styles (mais específico que classes)
    element.style.setProperty('overflow-y', 'auto', 'important');
    element.style.setProperty('overscroll-behavior', 'contain', 'important');
    element.style.setProperty('-webkit-overflow-scrolling', 'touch', 'important');
    element.style.setProperty('touch-action', 'pan-y', 'important');
    element.style.setProperty('pointer-events', 'auto', 'important');
    element.style.setProperty('position', 'relative', 'important');
    
    // Remover atributos que bloqueiam scroll
    element.removeAttribute('data-scroll-lock-isolate');
    element.removeAttribute('data-radix-scroll-area-viewport');
    element.removeAttribute('aria-hidden');
    
    // Garantir que elementos pai não bloqueiem scroll
    let parent = element.parentElement;
    while (parent) {
      if (parent.getAttribute('data-radix-dialog-content')) {
        parent.style.setProperty('overflow', 'hidden', 'important');
        break;
      }
      parent = parent.parentElement;
    }
    
    // Handler para eventos de touch - permite scroll normal
    const handleTouchStart = (e: TouchEvent) => {
      // Permitir que o evento prossiga normalmente
      e.stopPropagation();
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      const scrollableElement = target.closest('[data-scroll-lock-ignore]') as HTMLElement;
      
      if (scrollableElement && scrollableElement === element) {
        const { scrollTop, scrollHeight, clientHeight } = scrollableElement;
        const touch = e.touches[0];
        
        // Calcular se estamos no topo ou no final do scroll
        const isAtTop = scrollTop <= 0;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight;
        
        // Permitir scroll normal sem interferir
        e.stopPropagation();
      }
    };
    
    const handleWheel = (e: WheelEvent) => {
      // Permitir scroll de roda do mouse
      e.stopPropagation();
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return contentRef;
}
