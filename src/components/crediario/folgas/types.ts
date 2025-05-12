
import { z } from "zod";

export interface Crediarista {
  id: string;
  nome: string;
  avatar?: string;
}

export interface Folga {
  id: string;
  data: Date;
  crediaristaId: string;
  motivo?: string;
  createdAt?: string;
  createdBy?: string;
}

export const folgaFormSchema = z.object({
  data: z.date({ required_error: "A data da folga é obrigatória" }),
  crediaristaId: z.string({ required_error: "O crediarista é obrigatório" }),
  motivo: z.string().optional(),
});

export type FolgaFormValues = z.infer<typeof folgaFormSchema>;
