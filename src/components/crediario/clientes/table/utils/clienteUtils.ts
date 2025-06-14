
import { differenceInDays } from "date-fns";
import { Cliente } from "@/components/crediario/types";

export const calcularDiasAtraso = (cliente: Cliente): number => {
  const hoje = new Date();
  const diaPagamento = new Date(cliente.diaPagamento);
  if (isNaN(diaPagamento.getTime())) {
    return 0;
  }
  const diasAtraso = differenceInDays(hoje, diaPagamento);
  return Math.max(0, diasAtraso);
};
