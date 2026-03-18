
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Filter } from "lucide-react";

interface ReservasFiltersProps {
  filters: {
    status: string;
    forma_pagamento: string;
    cliente_vip: string;
    search: string;
  };
  onFilterChange: (key: string, value: string) => void;
}

export function ReservasFilters({ filters, onFilterChange }: ReservasFiltersProps) {
  const statusOptions = [
    { value: "all", label: "Todos os Status" },
    { value: "ativa", label: "Ativas" },
    { value: "expirada", label: "Expiradas" },
    { value: "convertida", label: "Convertidas" },
    { value: "cancelada", label: "Canceladas" },
  ];

  const pagamentoOptions = [
    { value: "all", label: "Todas as Formas" },
    { value: "crediario", label: "Crediário" },
    { value: "cartao_credito", label: "Cartão de Crédito" },
    { value: "cartao_debito", label: "Cartão de Débito" },
    { value: "pix", label: "PIX" },
  ];

  const vipOptions = [
    { value: "all", label: "Todos os Clientes" },
    { value: "vip", label: "Clientes VIP" },
    { value: "regular", label: "Clientes Regulares" },
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Status da Reserva</Label>
        <Select
          value={filters.status}
          onValueChange={(value) => onFilterChange("status", value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Forma de Pagamento</Label>
        <Select
          value={filters.forma_pagamento}
          onValueChange={(value) => onFilterChange("forma_pagamento", value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pagamentoOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Tipo de Cliente</Label>
        <Select
          value={filters.cliente_vip}
          onValueChange={(value) => onFilterChange("cliente_vip", value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {vipOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
