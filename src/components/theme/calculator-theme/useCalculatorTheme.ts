import { useContext } from "react";
import { CalculatorThemeContext } from "./CalculatorThemeContext";

export const useCalculatorTheme = () => {
  const context = useContext(CalculatorThemeContext);
  
  if (context === undefined) {
    throw new Error("useCalculatorTheme must be used within a CalculatorThemeProvider");
  }
  
  return context;
};
