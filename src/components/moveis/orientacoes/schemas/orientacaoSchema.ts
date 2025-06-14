
import { z } from "zod";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-excel", // .xls
  "application/msword", // .doc
];

export const orientacaoFormSchema = z.object({
  titulo: z.string().min(3, { message: "Título deve ter pelo menos 3 caracteres" }),
  tipo: z.enum(["vm", "informativo", "outro"], {
    required_error: "Selecione um tipo",
  }),
  descricao: z.string().min(10, { message: "Descrição deve ter pelo menos 10 caracteres" }),
  arquivo: z
    .instanceof(File, { message: "Selecione um arquivo" })
    .refine((file) => file.size > 0, "Arquivo obrigatório")
    .refine((file) => file.size <= MAX_FILE_SIZE, `O arquivo deve ter no máximo ${MAX_FILE_SIZE / 1024 / 1024}MB`)
    .refine(
      (file) => ALLOWED_FILE_TYPES.includes(file.type),
      "Tipo de arquivo não suportado. Apenas imagens, PDFs e documentos do Office são permitidos."
    ),
});

export type OrientacaoFormValues = z.infer<typeof orientacaoFormSchema>;
