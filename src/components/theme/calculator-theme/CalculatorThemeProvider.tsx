import React, { useEffect, useState } from "react";
import { CalculatorThemeContext } from "./CalculatorThemeContext";
import { CalculatorThemeProviderProps } from "./types";

export function CalculatorThemeProvider({ children }: CalculatorThemeProviderProps) {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedCalculatorTheme = localStorage.getItem("calculadora-theme");
      return savedCalculatorTheme !== "light";
    }
    return true;
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
