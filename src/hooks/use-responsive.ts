import { useState, useEffect } from 'react';

export interface Breakpoints {
  xs: boolean; // < 480px
  sm: boolean; // 480px - 768px
  md: boolean; // 768px - 1024px
  lg: boolean; // 1024px - 1280px
  xl: boolean; // 1280px - 1536px
  xxl: boolean; // > 1536px
}

export interface ResponsiveState {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  breakpoints: Breakpoints;
  orientation: 'portrait' | 'landscape';
}

const getBreakpoints = (width: number): Breakpoints => ({
  xs: width < 480,
  sm: width >= 480 && width < 768,
  md: width >= 768 && width < 1024,
  lg: width >= 1024 && width < 1280,
  xl: width >= 1280 && width < 1536,
  xxl: width >= 1536
});

const getResponsiveState = (): ResponsiveState => {
  const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const height = typeof window !== 'undefined' ? window.innerHeight : 768;
  
  return {
    width,
    height,
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024,
    breakpoints: getBreakpoints(width),
    orientation: height > width ? 'portrait' : 'landscape'
  };
};

export function useResponsive() {
  const [state, setState] = useState<ResponsiveState>(getResponsiveState);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setState(getResponsiveState());
      }, 100); // Debounce para performance
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return state;
}

// Hook para breakpoint específico
export function useBreakpoint(breakpoint: keyof Breakpoints) {
  const { breakpoints } = useResponsive();
  return breakpoints[breakpoint];
}

// Hook para media queries
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
} 