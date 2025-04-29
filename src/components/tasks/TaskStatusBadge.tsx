
import { Badge } from "@/components/ui/badge";
import { TaskStatus } from "@/types";

interface TaskStatusBadgeProps {
  status: TaskStatus;
}

export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  const statusConfig = {
    pendente: {
      label: "Pendente",
      className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    },
    em_andamento: {
      label: "Em andamento",
      className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    },
    concluida: {
      label: "Concluída",
      className: "bg-green-100 text-green-800 hover:bg-green-200",
    },
    cancelada: {
      label: "Cancelada",
      className: "bg-red-100 text-red-800 hover:bg-red-200",
    },
  };

  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
