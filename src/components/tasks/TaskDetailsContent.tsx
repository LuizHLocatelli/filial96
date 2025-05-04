
import { Task } from "@/types";
import { Phone, MapPin, Package, Calendar, CalendarClock, CalendarDays, User, Hash } from "lucide-react";
import { format } from "date-fns";

interface TaskDetailsContentProps {
  task: Task;
}

export function TaskDetailsContent({ task }: TaskDetailsContentProps) {
  // Helper function to format dates or return a default message
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Não definida";
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch (error) {
      return "Data inválida";
    }
  };

  return (
    <div className="space-y-4">
      {task.description && (
        <div>
          <h4 className="font-semibold text-sm">Descrição</h4>
          <p className="text-sm text-muted-foreground">{task.description || "Nenhuma"}</p>
        </div>
      )}

      {task.invoiceNumber && (
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-sm">Número da Nota Fiscal</h4>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Hash size={14} /> {task.invoiceNumber}
          </p>
        </div>
      )}
      
      {task.products && (
        <div className="flex items-start gap-2">
          <h4 className="font-semibold text-sm">Produtos</h4>
          <p className="text-sm text-muted-foreground flex items-start gap-1">
            <Package size={14} className="mt-0.5" /> {task.products}
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-sm">Status</h4>
          <p className="text-sm text-muted-foreground capitalize">
            {task.status.replace('_', ' ')}
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-sm">Prioridade</h4>
          <p className="text-sm text-muted-foreground capitalize">
            {task.priority}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {task.purchaseDate && (
          <div className="flex items-start gap-2">
            <h4 className="font-semibold text-sm">Data da Compra</h4>
            <p className="text-sm text-muted-foreground flex items-start gap-1">
              <Calendar size={14} className="mt-0.5" /> {formatDate(task.purchaseDate)}
            </p>
          </div>
        )}

        {task.expectedArrivalDate && (
          <div className="flex items-start gap-2">
            <h4 className="font-semibold text-sm">Previsão de Chegada</h4>
            <p className="text-sm text-muted-foreground flex items-start gap-1">
              <CalendarClock size={14} className="mt-0.5" /> {formatDate(task.expectedArrivalDate)}
            </p>
          </div>
        )}
      </div>

      {task.expectedDeliveryDate && (
        <div className="flex items-start gap-2">
          <h4 className="font-semibold text-sm">Previsão de Entrega/Retirada</h4>
          <p className="text-sm text-muted-foreground flex items-start gap-1">
            <CalendarDays size={14} className="mt-0.5" /> {formatDate(task.expectedDeliveryDate)}
          </p>
        </div>
      )}
      
      {task.clientName && (
        <div className="flex items-start gap-2">
          <h4 className="font-semibold text-sm">Cliente</h4>
          <p className="text-sm text-muted-foreground flex items-start gap-1">
            <User size={14} className="mt-0.5" /> {task.clientName}
          </p>
        </div>
      )}

      {task.clientCpf && (
        <div className="flex items-start gap-2">
          <h4 className="font-semibold text-sm">CPF do Cliente</h4>
          <p className="text-sm text-muted-foreground">
            {task.clientCpf}
          </p>
        </div>
      )}
      
      {task.clientPhone && (
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-sm">Telefone</h4>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Phone size={14} /> {task.clientPhone}
          </p>
        </div>
      )}
      
      {task.clientAddress && (
        <div className="flex items-start gap-2">
          <h4 className="font-semibold text-sm">Endereço</h4>
          <p className="text-sm text-muted-foreground flex items-start gap-1">
            <MapPin size={14} className="mt-0.5" /> {task.clientAddress}
          </p>
        </div>
      )}
    </div>
  );
}
