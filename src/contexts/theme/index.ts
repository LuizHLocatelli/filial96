import React, { useContext } from "react";
import { ThemeContext } from "./ThemeContext";
import { ThemeProvider } from "./ThemeProvider";

export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  
  return context;
};

export { ThemeProvider, ThemeContext };
export type { ThemeContextType, ThemeProviderProps } from "./types";
