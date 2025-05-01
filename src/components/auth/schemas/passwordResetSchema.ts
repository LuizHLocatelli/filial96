
import { z } from "zod";

export const passwordResetSchema = z.object({
  email: z.string().email("E-mail inválido").min(1, "E-mail é obrigatório"),
});

export type PasswordResetFormValues = z.infer<typeof passwordResetSchema>;
