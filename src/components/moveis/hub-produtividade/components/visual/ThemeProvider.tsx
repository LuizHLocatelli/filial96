import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type ColorScheme = 'blue' | 'green' | 'purple' | 'orange' | 'red';
export type Density = 'compact' | 'normal' | 'comfortable';
export type AnimationLevel = 'none' | 'reduced' | 'full';

interface ThemeConfig {
  theme: Theme;
  colorScheme: ColorScheme;
  density: Density;
  animationLevel: AnimationLevel;
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: number; // Scale: 0.8 to 1.2
  borderRadius: number; // Scale: 0 to 1
}

interface ThemeContextType {
  config: ThemeConfig;
  setTheme: (theme: Theme) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  setDensity: (density: Density) => void;
  setAnimationLevel: (level: AnimationLevel) => void;
  toggleHighContrast: () => void;
  setFontSize: (size: number) => void;
  setBorderRadius: (radius: number) => void;
  resetToDefaults: () => void;
  exportConfig: () => string;
  importConfig: (config: string) => void;
}

const defaultConfig: ThemeConfig = {
  theme: 'system',
  colorScheme: 'blue',
  density: 'normal',
  animationLevel: 'full',
  reducedMotion: false,
  highContrast: false,
  fontSize: 1,
  borderRadius: 0.5
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'hub-theme-config'
}: ThemeProviderProps) {
  const [config, setConfig] = useState<ThemeConfig>(() => {
    if (typeof window === 'undefined') {
      return { ...defaultConfig, theme: defaultTheme };
    }

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return { ...defaultConfig, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn('Failed to load theme config from localStorage');
    }

    return { ...defaultConfig, theme: defaultTheme };
  });

  const updateConfig = (updates: Partial<ThemeConfig>) => {
    setConfig(prev => {
      const newConfig = { ...prev, ...updates };
      try {
        localStorage.setItem(storageKey, JSON.stringify(newConfig));
      } catch (error) {
        console.warn('Failed to save theme config to localStorage');
      }
      return newConfig;
    });
  };

  const setTheme = (theme: Theme) => updateConfig({ theme });
  const setColorScheme = (colorScheme: ColorScheme) => updateConfig({ colorScheme });
  const setDensity = (density: Density) => updateConfig({ density });
  const setAnimationLevel = (animationLevel: AnimationLevel) => updateConfig({ animationLevel });
  const toggleHighContrast = () => updateConfig({ highContrast: !config.highContrast });
  const setFontSize = (fontSize: number) => updateConfig({ fontSize });
  const setBorderRadius = (borderRadius: number) => updateConfig({ borderRadius });

  const resetToDefaults = () => {
    setConfig(defaultConfig);
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn('Failed to remove theme config from localStorage');
    }
  };

  const exportConfig = () => JSON.stringify(config, null, 2);
  
  const importConfig = (configString: string) => {
    try {
      const importedConfig = JSON.parse(configString);
      updateConfig(importedConfig);
    } catch (error) {
      console.error('Failed to import theme config:', error);
    }
  };

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Determinar o tema atual
    const currentTheme = config.theme === 'system' 
      ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      : config.theme;

    // Aplicar classe do tema
    root.classList.remove('light', 'dark');
    root.classList.add(currentTheme);

    // Aplicar esquema de cores
    root.setAttribute('data-color-scheme', config.colorScheme);

    // Aplicar densidade
    root.setAttribute('data-density', config.density);

    // Aplicar nível de animação
    root.setAttribute('data-animation-level', config.animationLevel);

    // Aplicar alto contraste
    if (config.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Aplicar redução de movimento
    if (config.reducedMotion || config.animationLevel === 'none') {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Aplicar escala de fonte
    root.style.setProperty('--font-scale', config.fontSize.toString());

    // Aplicar border radius
    root.style.setProperty('--radius-scale', config.borderRadius.toString());

    // CSS Custom Properties para diferentes densidades
    const densityMap = {
      compact: {
        '--spacing-xs': '0.25rem',
        '--spacing-sm': '0.5rem',
        '--spacing-md': '0.75rem',
        '--spacing-lg': '1rem',
        '--spacing-xl': '1.5rem'
      },
      normal: {
        '--spacing-xs': '0.5rem',
        '--spacing-sm': '0.75rem',
        '--spacing-md': '1rem',
        '--spacing-lg': '1.5rem',
        '--spacing-xl': '2rem'
      },
      comfortable: {
        '--spacing-xs': '0.75rem',
        '--spacing-sm': '1rem',
        '--spacing-md': '1.5rem',
        '--spacing-lg': '2rem',
        '--spacing-xl': '3rem'
      }
    };

    Object.entries(densityMap[config.density]).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    // Color scheme variables
    const colorSchemes = {
      blue: {
        '--primary-hue': '217',
        '--primary-saturation': '91%',
        '--primary-lightness': '60%'
      },
      green: {
        '--primary-hue': '142',
        '--primary-saturation': '76%',
        '--primary-lightness': '36%'
      },
      purple: {
        '--primary-hue': '262',
        '--primary-saturation': '83%',
        '--primary-lightness': '58%'
      },
      orange: {
        '--primary-hue': '25',
        '--primary-saturation': '95%',
        '--primary-lightness': '53%'
      },
      red: {
        '--primary-hue': '0',
        '--primary-saturation': '84%',
        '--primary-lightness': '60%'
      }
    };

    Object.entries(colorSchemes[config.colorScheme]).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

  }, [config]);

  // Listen for system theme changes
  useEffect(() => {
    if (config.theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => setConfig(prev => ({ ...prev })); // Trigger re-render

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [config.theme]);

  // Listen for system motion preferences
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      updateConfig({ reducedMotion: e.matches });
    };

    mediaQuery.addEventListener('change', handleChange);
    updateConfig({ reducedMotion: mediaQuery.matches });

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const value: ThemeContextType = {
    config,
    setTheme,
    setColorScheme,
    setDensity,
    setAnimationLevel,
    toggleHighContrast,
    setFontSize,
    setBorderRadius,
    resetToDefaults,
    exportConfig,
    importConfig
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// CSS-in-JS helper para componentes
export const getThemeClasses = (config: ThemeConfig) => {
  const classes = [];
  
  if (config.density === 'compact') classes.push('theme-compact');
  if (config.density === 'comfortable') classes.push('theme-comfortable');
  if (config.animationLevel === 'none') classes.push('no-animations');
  if (config.animationLevel === 'reduced') classes.push('reduced-animations');
  if (config.highContrast) classes.push('high-contrast');
  
  return classes.join(' ');
};

// Hook para detectar preferências do sistema
export const useSystemPreferences = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Dark mode
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeQuery.matches);
    
    const handleDarkModeChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    darkModeQuery.addEventListener('change', handleDarkModeChange);

    // Reduced motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);
    
    const handleMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    motionQuery.addEventListener('change', handleMotionChange);

    return () => {
      darkModeQuery.removeEventListener('change', handleDarkModeChange);
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  return { isDarkMode, prefersReducedMotion };
}; 