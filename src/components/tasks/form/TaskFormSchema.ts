
import { z } from "zod";

export const taskFormSchema = z.object({
  type: z.enum(["entrega", "retirada", "montagem", "garantia", "organizacao", "cobranca"]).default("entrega"),
  title: z.string().min(1, "Título é obrigatório"),
  invoiceNumber: z.string().optional(),
  products: z.string().optional(),
  observation: z.string().optional(),
  status: z.enum(["pendente", "em_andamento", "aguardando_cliente", "concluida", "cancelada"]).default("pendente"),
  priority: z.enum(["baixa", "media", "alta"]).default("media"),
  clientName: z.string().min(1, "Nome do cliente é obrigatório"),
  clientPhone: z.string().min(1, "Telefone do cliente é obrigatório"),
  clientAddress: z.string().min(1, "Endereço do cliente é obrigatório"),
  clientCpf: z.string().optional(),
  purchaseDate: z.date().optional(),
  expectedArrivalDate: z.date().optional(),
  expectedDeliveryDate: z.date().optional(),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;
