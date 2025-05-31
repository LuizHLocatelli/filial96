
import { z } from "zod";
import { UserRole } from "@/types";

export const signupSchema = z.object({
  name: z.string().min(3, "O nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("E-mail inválido").min(1, "E-mail é obrigatório"),
  phone: z.string()
    .min(10, "Telefone deve ter no mínimo 10 dígitos")
    .regex(/^[\d\s\(\)\-\+]+$/, "Formato de telefone inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  role: z.enum(["gerente", "crediarista", "consultor_moveis", "consultor_moda"] as const),
});

export type SignupFormValues = z.infer<typeof signupSchema>;
