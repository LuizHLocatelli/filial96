import { useState, useEffect } from 'react';

interface ResponsiveBreakpoints {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLarge: boolean;
  xxl: boolean;
  xl: boolean;
  lg: boolean;
  md: boolean;
  sm: boolean;
}

export function useResponsive(): ResponsiveBreakpoints {
  const [breakpoints, setBreakpoints] = useState<ResponsiveBreakpoints>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isLarge: false,
    xxl: false,
    xl: false,
    lg: false,
    md: false,
    sm: false,
  });

  useEffect(() => {
    const updateBreakpoints = () => {
      const width = window.innerWidth;
      
      setBreakpoints({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024 && width < 1920,
        isLarge: width >= 1920,
        xxl: width >= 1536,
        xl: width >= 1280 && width < 1536,
        lg: width >= 1024 && width < 1280,
        md: width >= 768 && width < 1024,
        sm: width >= 640 && width < 768,
      });
    };

    updateBreakpoints();
    window.addEventListener('resize', updateBreakpoints);
    
    return () => window.removeEventListener('resize', updateBreakpoints);
  }, []);

  return breakpoints;
}
