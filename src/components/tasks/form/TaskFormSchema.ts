
import { z } from "zod";
import { TaskType } from "@/types";

// Define status and priority as enums with specific allowed values
const taskStatusEnum = z.enum(["pendente", "em_andamento", "concluida", "cancelada", "aguardando_cliente"]);
const taskPriorityEnum = z.enum(["baixa", "media", "alta"]);
const taskTypeEnum = z.enum(["entrega", "retirada", "montagem", "garantia", "organizacao", "cobranca"]);

// Define a schema for form validation
export const taskFormSchema = z.object({
  type: taskTypeEnum.default("entrega"),
  title: z.string().optional(),
  description: z.string().optional(),
  invoiceNumber: z.string().min(1, "O número da nota fiscal é obrigatório"),
  observation: z.string().optional(),
  status: taskStatusEnum.default("pendente"),
  priority: taskPriorityEnum.default("media"),
  clientName: z.string().min(1, "O nome do cliente é obrigatório"),
  clientPhone: z.string().min(8, "O telefone deve ter pelo menos 8 dígitos"),
  clientAddress: z.string().min(5, "O endereço deve ter pelo menos 5 caracteres"),
  products: z.string().min(1, "Os produtos são obrigatórios"),
  purchaseDate: z.date().optional(),
  expectedArrivalDate: z.date().optional(),
  expectedDeliveryDate: z.date().optional(),
  clientCpf: z.string().optional(),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;
