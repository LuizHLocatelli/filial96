import { CalculatorThemeProvider } from "@/components/theme/CalculatorThemeProvider";
import ProcedimentosSSC from "./ProcedimentosSSC";

export default function ProcedimentosSSCWrapper() {
  return (
    <CalculatorThemeProvider>
      <ProcedimentosSSC />
    </CalculatorThemeProvider>
  );
}
