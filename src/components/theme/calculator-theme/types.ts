export interface CalculatorThemeProviderProps {
  children: React.ReactNode;
}

export interface CalculatorThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}
