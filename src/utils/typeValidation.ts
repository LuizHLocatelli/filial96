
import { TaskType, TaskStatus } from "@/types";

export const validateTaskType = (type: string): TaskType => {
  const validTypes: TaskType[] = ['entrega', 'retirada', 'montagem', 'garantia', 'organizacao', 'cobranca'];
  return validTypes.includes(type as TaskType) ? type as TaskType : 'entrega';
};

export const validateTaskStatus = (status: string): TaskStatus => {
  const validStatuses: TaskStatus[] = ['pendente', 'em_andamento', 'concluida', 'cancelada', 'aguardando_cliente'];
  return validStatuses.includes(status as TaskStatus) ? status as TaskStatus : 'pendente';
};

export const validatePriority = (priority: string): 'baixa' | 'media' | 'alta' => {
  const validPriorities = ['baixa', 'media', 'alta'];
  return validPriorities.includes(priority as 'baixa' | 'media' | 'alta') 
    ? priority as 'baixa' | 'media' | 'alta' 
    : 'media';
};
