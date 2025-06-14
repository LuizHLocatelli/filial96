
import { Badge } from "@/components/ui/badge";
import { Cliente } from "@/components/crediario/types";
import { calcularDiasAtraso } from "../utils/clienteUtils";

interface ClienteStatusBadgeProps {
  cliente: Cliente;
}

export function ClienteStatusBadge({ cliente }: ClienteStatusBadgeProps) {
  const diasAtraso = calcularDiasAtraso(cliente);
  
  if (diasAtraso === 0) {
    return <Badge className="bg-green-500/10 text-green-600 border-green-500/20 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30">Em dia</Badge>;
  } else if (diasAtraso <= 7) {
    return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/30">{diasAtraso}d atraso</Badge>;
  } else if (diasAtraso <= 30) {
    return <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30">{diasAtraso}d atraso</Badge>;
  } else {
    return <Badge className="bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30">{diasAtraso}d atraso</Badge>;
  }
}
