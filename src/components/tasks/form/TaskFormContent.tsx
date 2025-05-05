
import { Control } from "react-hook-form";
import { DatePickerField } from "./DatePickerField";
import { InputField } from "./InputField";
import { SelectField } from "./SelectField";
import { TextareaField } from "./TextareaField";

interface TaskFormContentProps {
  control: Control<any>;
}

export function TaskFormContent({ control }: TaskFormContentProps) {
  const priorityOptions = [
    { value: "baixa", label: "Baixa" },
    { value: "media", label: "Média" },
    { value: "alta", label: "Alta" },
  ];

  const statusOptions = [
    { value: "pendente", label: "Pendente" },
    { value: "em_andamento", label: "Em Andamento" },
    { value: "aguardando_cliente", label: "Aguardando Cliente" },
    { value: "concluida", label: "Concluída" },
    { value: "cancelada", label: "Cancelada" },
  ];

  return (
    <div className="space-y-4">
      <InputField 
        control={control}
        name="title"
        label="Título"
        placeholder="Título da tarefa"
      />
      
      <InputField 
        control={control}
        name="invoiceNumber"
        label="Número da Nota Fiscal"
        placeholder="Ex: NF-e 123456"
        required
      />

      <InputField 
        control={control}
        name="products"
        label="Produtos Comprados"
        placeholder="Ex: Sofá 3 lugares, Mesa de centro"
        required
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DatePickerField 
          control={control}
          name="purchaseDate"
          label="Data da Compra"
        />

        <DatePickerField 
          control={control}
          name="expectedArrivalDate"
          label="Previsão de Chegada"
        />
      </div>

      <DatePickerField 
        control={control}
        name="expectedDeliveryDate"
        label="Previsão de Entrega/Retirada"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField 
          control={control}
          name="priority"
          label="Prioridade*"
          placeholder="Selecione a prioridade"
          options={priorityOptions}
        />

        <SelectField 
          control={control}
          name="status"
          label="Status*"
          placeholder="Selecione o status"
          options={statusOptions}
        />
      </div>

      <TextareaField 
        control={control}
        name="observation"
        label="Observação"
        placeholder="Observações adicionais"
        rows={2}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField 
          control={control}
          name="clientName"
          label="Nome do Cliente"
          placeholder="Nome completo"
          required
        />

        <InputField 
          control={control}
          name="clientCpf"
          label="CPF do Cliente"
          placeholder="000.000.000-00"
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <InputField 
          control={control}
          name="clientPhone"
          label="Telefone do Cliente"
          placeholder="(00) 00000-0000"
          required
        />
      </div>

      <InputField 
        control={control}
        name="clientAddress"
        label="Endereço do Cliente"
        placeholder="Endereço completo"
        required
      />
    </div>
  );
}
