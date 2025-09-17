import { CalculatorThemeProvider } from "@/components/theme/CalculatorThemeProvider";
import CalculadoraIgreen from "./CalculadoraIgreen";

export default function CalculadoraIgreenWrapper() {
  return (
    <CalculatorThemeProvider>
      <CalculadoraIgreen />
    </CalculatorThemeProvider>
  );
}
