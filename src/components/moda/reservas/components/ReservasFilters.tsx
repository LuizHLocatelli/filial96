
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, Clock, CreditCard, Crown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

  const statusOptions = [
    { value: "all", label: "📋 Todos os Status", icon: "📋" },
    { value: "ativa", label: "🟢 Ativas", icon: "🟢" },
    { value: "expirada", label: "🔴 Expiradas", icon: "🔴" },
    { value: "convertida", label: "✅ Convertidas", icon: "✅" },
    { value: "cancelada", label: "❌ Canceladas", icon: "❌" }
  ];

  const pagamentoOptions = [
    { value: "all", label: "💳 Todas as Formas", icon: "💳" },
    { value: "crediario", label: "🏪 Crediário", icon: "🏪" },
    { value: "cartao_credito", label: "💳 Cartão de Crédito", icon: "💳" },
    { value: "cartao_debito", label: "💰 Cartão de Débito", icon: "💰" },
    { value: "pix", label: "⚡ PIX", icon: "⚡" }
  ];

  const vipOptions = [
    { value: "all", label: "👥 Todos os Clientes", icon: "👥" },
    { value: "vip", label: "👑 Clientes VIP", icon: "👑" },
    { value: "regular", label: "👤 Clientes Regulares", icon: "👤" }
  ];

  if (isMobile) {
    return (
      <div className="space-y-4 p-4">
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-green-700 dark:text-green-300 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Status da Reserva
          </Label>
          <Select value={filters.status} onValueChange={(value) => onFilterChange('status', value)}>
            <SelectTrigger className="h-11 text-sm rounded-xl border-green-200/50 dark:border-green-600/30 bg-white/80 dark:bg-gray-700/30 shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-white/95 dark:bg-gray-800/95 border-green-200/50 dark:border-green-600/30 shadow-lg">
              {statusOptions.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  className="text-sm focus:bg-green-50/80 dark:focus:bg-green-900/20"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-semibold text-green-700 dark:text-green-300 flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Forma de Pagamento
          </Label>
          <Select value={filters.forma_pagamento} onValueChange={(value) => onFilterChange('forma_pagamento', value)}>
            <SelectTrigger className="h-11 text-sm rounded-xl border-green-200/50 dark:border-green-600/30 bg-white/80 dark:bg-gray-700/30 shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-white/95 dark:bg-gray-800/95 border-green-200/50 dark:border-green-600/30 shadow-lg">
              {pagamentoOptions.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  className="text-sm focus:bg-green-50/80 dark:focus:bg-green-900/20"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-semibold text-green-700 dark:text-green-300 flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Tipo de Cliente
          </Label>
          <Select value={filters.cliente_vip} onValueChange={(value) => onFilterChange('cliente_vip', value)}>
            <SelectTrigger className="h-11 text-sm rounded-xl border-green-200/50 dark:border-green-600/30 bg-white/80 dark:bg-gray-700/30 shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-white/95 dark:bg-gray-800/95 border-green-200/50 dark:border-green-600/30 shadow-lg">
              {vipOptions.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  className="text-sm focus:bg-green-50/80 dark:focus:bg-green-900/20"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }

  return (
    <Card className="border-0 bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-gray-800/40 dark:to-gray-700/40 backdrop-blur-sm shadow-lg border-green-200/30 dark:border-green-700/20">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center shadow-sm">
            <Filter className="h-4 w-4 text-white" />
          </div>
          <CardTitle className="text-lg font-bold text-green-800 dark:text-green-200">
            Filtros
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-green-700 dark:text-green-300 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Status da Reserva
          </Label>
          <Select value={filters.status} onValueChange={(value) => onFilterChange('status', value)}>
            <SelectTrigger className="h-11 text-sm rounded-xl border-green-200/50 dark:border-green-600/30 bg-white/80 dark:bg-gray-700/30 shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-white/95 dark:bg-gray-800/95 border-green-200/50 dark:border-green-600/30 shadow-lg">
              {statusOptions.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  className="text-sm focus:bg-green-50/80 dark:focus:bg-green-900/20"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-semibold text-green-700 dark:text-green-300 flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Forma de Pagamento
          </Label>
          <Select value={filters.forma_pagamento} onValueChange={(value) => onFilterChange('forma_pagamento', value)}>
            <SelectTrigger className="h-11 text-sm rounded-xl border-green-200/50 dark:border-green-600/30 bg-white/80 dark:bg-gray-700/30 shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-white/95 dark:bg-gray-800/95 border-green-200/50 dark:border-green-600/30 shadow-lg">
              {pagamentoOptions.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  className="text-sm focus:bg-green-50/80 dark:focus:bg-green-900/20"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-semibold text-green-700 dark:text-green-300 flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Tipo de Cliente
          </Label>
          <Select value={filters.cliente_vip} onValueChange={(value) => onFilterChange('cliente_vip', value)}>
            <SelectTrigger className="h-11 text-sm rounded-xl border-green-200/50 dark:border-green-600/30 bg-white/80 dark:bg-gray-700/30 shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-white/95 dark:bg-gray-800/95 border-green-200/50 dark:border-green-600/30 shadow-lg">
              {vipOptions.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  className="text-sm focus:bg-green-50/80 dark:focus:bg-green-900/20"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
