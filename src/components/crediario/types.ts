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

export const indicatorOptions = [
  { value: "nao-compareceu", label: "Não Compareceu" },
  { value: "pagamento", label: "Pagamento" },
  { value: "negociacao", label: "Negociação" },
  { value: "relamado", label: "Relamado" },
  { value: "sem-contato", label: "Sem Contato" },
];

export const getIndicatorColor = (indicator: string): string => {
  const colors: Record<string, string> = {
    "nao-compareceu": "bg-red-500",
    "pagamento": "bg-green-500",
    "negociacao": "bg-blue-500",
    "relamado": "bg-yellow-500",
    "sem-contato": "bg-gray-500",
  };
  return colors[indicator] || "bg-gray-400";
};

