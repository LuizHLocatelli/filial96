import { createContext } from "react";
import { CalculatorThemeContextType } from "./types";

export const CalculatorThemeContext = createContext<CalculatorThemeContextType | undefined>(undefined);
