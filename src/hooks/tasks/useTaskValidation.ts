
import { TaskStatus } from "@/types";

/**
 * Validates that a status value is one of the valid TaskStatus enum values
 */
export function validateTaskStatus(status: string): TaskStatus {
  const validStatuses: TaskStatus[] = ['pendente', 'em_andamento', 'concluida', 'cancelada', 'aguardando_cliente'];
  return validStatuses.includes(status as TaskStatus) ? status as TaskStatus : 'pendente';
}

/**
 * Validates that a priority value is one of the valid priority values
 */
export function validateTaskPriority(priority: string): "baixa" | "media" | "alta" {
  const validPriorities = ['baixa', 'media', 'alta'];
  return validPriorities.includes(priority as "baixa" | "media" | "alta") 
    ? priority as "baixa" | "media" | "alta" 
    : 'media';
}

/**
 * Generates a default title for a task based on the type and invoice number
 */
export function generateTaskTitle(type: string | undefined, invoiceNumber: string): string {
  return `${type === 'entrega' ? 'Entrega' : 'Retirada'} - NF ${invoiceNumber}`;
}
