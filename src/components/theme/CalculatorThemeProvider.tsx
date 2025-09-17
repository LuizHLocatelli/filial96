import React, { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

type CalculatorThemeProviderProps = {
  children: ReactNode;
};

type CalculatorThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
};

const CalculatorThemeContext = createContext<CalculatorThemeContextType | undefined>(undefined);

export function CalculatorThemeProvider({ children }: CalculatorThemeProviderProps) {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // Para a CalculadoraIgreen, sempre inicia em modo escuro
    // Mas permite que o usuário mude se desejar
    if (typeof window !== 'undefined') {
      const savedCalculatorTheme = localStorage.getItem("calculadora-theme");
      // Se não houver preferência salva específica para a calculadora, usa modo escuro
      return savedCalculatorTheme !== "light";
    }
    return true; // Modo escuro por padrão
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("calculadora-theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("calculadora-theme", "light");
      }
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <CalculatorThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </CalculatorThemeContext.Provider>
  );
}

export const useCalculatorTheme = (): CalculatorThemeContextType => {
  const context = useContext(CalculatorThemeContext);
  
  if (context === undefined) {
    throw new Error("useCalculatorTheme must be used within a CalculatorThemeProvider");
  }
  
  return context;
};
