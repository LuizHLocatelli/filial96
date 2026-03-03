import { CalculatorThemeProvider } from "@/components/theme/calculator-theme";
import Aniversariantes from "./Aniversariantes";

export default function AniversariantesWrapper() {
  return (
    <CalculatorThemeProvider>
      <Aniversariantes />
    </CalculatorThemeProvider>
  );
}
