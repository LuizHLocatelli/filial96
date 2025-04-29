
import { Badge } from "@/components/ui/badge";
import { TaskType } from "@/types";

interface TaskTypeBadgeProps {
  type: TaskType;
}

export function TaskTypeBadge({ type }: TaskTypeBadgeProps) {
  const typeConfig = {
    entrega: {
      label: "Entrega",
      className: "bg-brand-blue-100 text-brand-blue-800 hover:bg-brand-blue-200",
    },
    retirada: {
      label: "Retirada",
      className: "bg-purple-100 text-purple-800 hover:bg-purple-200",
    },
    montagem: {
      label: "Montagem",
      className: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
    },
    garantia: {
      label: "Garantia",
      className: "bg-amber-100 text-amber-800 hover:bg-amber-200",
    },
    organizacao: {
      label: "Organização",
      className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
    },
    cobranca: {
      label: "Cobrança",
      className: "bg-pink-100 text-pink-800 hover:bg-pink-200",
    },
  };

  const config = typeConfig[type];

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
