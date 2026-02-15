export interface ThemeProviderProps {
  children: React.ReactNode;
}

export interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}
