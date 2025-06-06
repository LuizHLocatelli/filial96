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
  indicator: z.string().optional(),
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
  indicator?: string | null;
}

export type Indicator = "FPD" | "Pontual" | "M1" | "M2" | "M3" | null;

export const indicatorOptions = [
  { value: "FPD", label: "FPD" },
  { value: "Pontual", label: "Pontual" },
  { value: "M1", label: "M1" },
  { value: "M2", label: "M2" },
  { value: "M3", label: "M3" },
];

export const getIndicatorColor = (indicator: string | null) => {
  switch(indicator) {
    case "FPD": return "bg-red-500 dark:bg-red-600";
    case "Pontual": return "bg-green-500 dark:bg-green-600";
    case "M1": return "bg-yellow-500 dark:bg-yellow-600";
    case "M2": return "bg-orange-500 dark:bg-orange-600";
    case "M3": return "bg-purple-500 dark:bg-purple-600";
    default: return "bg-gray-500 dark:bg-gray-600";
  }
};
