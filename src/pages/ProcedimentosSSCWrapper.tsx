import { CalculatorThemeProvider } from "@/components/theme/calculator-theme";
import ProcedimentosSSC from "./ProcedimentosSSC";

export default function ProcedimentosSSCWrapper() {
  return (
    <CalculatorThemeProvider>
      <ProcedimentosSSC />
    </CalculatorThemeProvider>
  );
}
