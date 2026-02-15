import { CalculatorThemeProvider } from "@/components/theme/calculator-theme";
import CalculadoraIgreen from "./CalculadoraIgreen";

export default function CalculadoraIgreenWrapper() {
  return (
    <CalculatorThemeProvider>
      <CalculadoraIgreen />
    </CalculatorThemeProvider>
  );
}
