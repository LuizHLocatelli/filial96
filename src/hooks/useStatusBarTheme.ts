import { useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

const useStatusBarTheme = () => {
  const { isDarkMode } = useTheme();

  useEffect(() => {
    // Função para atualizar a meta tag theme-color
    const updateThemeColor = (color: string) => {
      let themeColorMeta = document.querySelector('meta[name="theme-color"]');
      
      if (!themeColorMeta) {
        themeColorMeta = document.createElement('meta');
        themeColorMeta.setAttribute('name', 'theme-color');
        document.head.appendChild(themeColorMeta);
      }
      
      themeColorMeta.setAttribute('content', color);
    };

    // Função para atualizar a status bar style do iOS
    const updateAppleStatusBarStyle = (style: string) => {
      const appleStatusBarMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
      
      if (appleStatusBarMeta) {
        appleStatusBarMeta.setAttribute('content', style);
      }
    };

    // Determinar as cores baseadas no tema
    const getThemeColors = () => {
      if (isDarkMode) {
        return {
          themeColor: '#0a0a0a', // Cor de fundo escura
          statusBarStyle: 'black-translucent'
        };
      } else {
        return {
          themeColor: '#ffffff', // Cor de fundo clara
          statusBarStyle: 'black-translucent'
        };
      }
    };

    const { themeColor, statusBarStyle } = getThemeColors();
    
    // Atualizar as meta tags
    updateThemeColor(themeColor);
    updateAppleStatusBarStyle(statusBarStyle);

  }, [isDarkMode]);
};

export default useStatusBarTheme; 