
import { z } from "zod";

// Define the form schema
export const clienteFormSchema = z.object({
  nome: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  conta: z.string().min(1, { message: "Número da conta é obrigatório" }),
  diaContato: z.date({ required_error: "Data de contato é obrigatória" }),
  diaPagamento: z.date({ required_error: "Data de pagamento é obrigatória" }),
  tipo: z.enum(["pagamento", "renegociacao"], { required_error: "Tipo é obrigatório" }),
  valorParcelas: z.string().optional(),
  contratosNegociados: z.string().optional(),
  valorEntrada: z.string().optional(),
  qtdParcelas: z.string().optional(),
  valorCadaParcela: z.string().optional(),
  observacao: z.string().optional(),
});

export type ClienteFormValues = z.infer<typeof clienteFormSchema>;

export interface Cliente {
  id: string;
  nome: string;
  conta: string;
  diaContato: Date;
  diaPagamento: Date;
  tipo: "pagamento" | "renegociacao";
  valorParcelas?: string;
  contratosNegociados?: string;
  valorEntrada?: string;
  qtdParcelas?: string;
  valorCadaParcela?: string;
  observacao?: string;
}
