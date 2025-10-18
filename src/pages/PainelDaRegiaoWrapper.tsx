import { CalculatorThemeProvider } from "@/components/theme/CalculatorThemeProvider";
import PainelDaRegiao from "./PainelDaRegiao";

export default function PainelDaRegiaoWrapper() {
  return (
    <CalculatorThemeProvider>
      <PainelDaRegiao />
    </CalculatorThemeProvider>
  );
}
