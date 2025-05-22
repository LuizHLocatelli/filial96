
import { z } from "zod";

export const orientacaoFormSchema = z.object({
  titulo: z.string().min(3, { message: "Título deve ter pelo menos 3 caracteres" }),
  tipo: z.enum(["vm", "informativo", "outro"], {
    required_error: "Selecione um tipo",
  }),
  descricao: z.string().min(10, { message: "Descrição deve ter pelo menos 10 caracteres" }),
  arquivo: z
    .instanceof(File, { message: "Selecione um arquivo" })
    .refine((file) => file.size > 0, { message: "Arquivo obrigatório" })
    .refine((file) => file.size <= 10 * 1024 * 1024, { message: "O arquivo deve ter no máximo 10MB" }),
});

export type OrientacaoFormValues = z.infer<typeof orientacaoFormSchema>;
