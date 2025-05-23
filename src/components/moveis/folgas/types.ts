
import { z } from "zod";

export interface Consultor {
  id: string;
  nome: string;
  avatar?: string;
}

export interface Folga {
  id: string;
  data: Date;
  consultorId: string;
  motivo?: string;
  createdAt?: string;
  createdBy?: string;
}

export const folgaFormSchema = z.object({
  data: z.date({ required_error: "A data da folga é obrigatória" }),
  consultorId: z.string({ required_error: "O consultor é obrigatório" }),
  motivo: z.string().optional(),
});

export type FolgaFormValues = z.infer<typeof folgaFormSchema>;
