
import { z } from "zod";

// Define a schema for form validation
export const taskFormSchema = z.object({
  title: z.string().min(1, "O título é obrigatório"),
  observation: z.string().optional(),
  status: z.string().default("pendente"),
  priority: z.string().default("media"),
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
