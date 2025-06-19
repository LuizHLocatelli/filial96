
import { ThemeProvider as BaseThemeProvider } from "@/contexts/ThemeContext";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: "dark" | "light" | "system";
  storageKey?: string;
}

export function ThemeProvider({ 
  children, 
  defaultTheme = "light", 
  storageKey = "vite-ui-theme" 
}: ThemeProviderProps) {
  return (
    <BaseThemeProvider>
      {children}
    </BaseThemeProvider>
  );
}
