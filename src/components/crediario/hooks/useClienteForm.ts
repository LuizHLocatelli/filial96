
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Cliente, ClienteFormValues, clienteFormSchema } from "../types";

export function useClienteForm(
  cliente: Cliente | null | undefined,
  onSubmit: (data: ClienteFormValues) => Promise<void>
) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteFormSchema),
    defaultValues: cliente ? {
      nome: cliente.nome,
      conta: cliente.conta,
      diaContato: cliente.diaContato,
      diaPagamento: cliente.diaPagamento,
      tipo: cliente.tipo,
      valorParcelas: cliente.valorParcelas || "",
      contratosNegociados: cliente.contratosNegociados || "",
      valorEntrada: cliente.valorEntrada || "",
      qtdParcelas: cliente.qtdParcelas || "",
      valorCadaParcela: cliente.valorCadaParcela || "",
      observacao: cliente.observacao || "",
      indicator: cliente.indicator || "",
    } : {
      nome: "",
      conta: "",
      tipo: "pagamento",
      valorParcelas: "",
      contratosNegociados: "",
      valorEntrada: "",
      qtdParcelas: "",
      valorCadaParcela: "",
      observacao: "",
      indicator: "",
    }
  });
  
  const tipoAgendamento = form.watch("tipo");
  
  const handleFormSubmit = async (data: ClienteFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    tipoAgendamento,
    handleFormSubmit
  };
}
