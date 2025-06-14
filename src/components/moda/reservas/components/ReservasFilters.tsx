
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, Crown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

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
  return (
    <Card className="border shadow-sm bg-white dark:bg-gray-800/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-gray-200">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-sm">
            <Filter className="h-4 w-4 text-white" />
          </div>
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="search" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Busca Rápida
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />
            <Input
              id="search"
              placeholder="Cliente, produto, código..."
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              className="pl-10 h-11 rounded-xl border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 focus:border-green-500 focus:ring-green-500 dark:focus:border-green-400 dark:placeholder:text-gray-400 dark:text-gray-100 shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Status da Reserva
          </Label>
          <Select value={filters.status} onValueChange={(value) => onFilterChange('status', value)}>
            <SelectTrigger className="h-11 rounded-xl border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 focus:border-green-500 focus:ring-green-500 dark:focus:border-green-400 dark:text-gray-100 shadow-sm">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 shadow-lg backdrop-blur-sm">
              <SelectItem value="all" className="focus:bg-gray-50 dark:focus:bg-gray-700 focus:text-gray-800 dark:focus:text-gray-200">✨ Todos</SelectItem>
              <SelectItem value="ativa" className="focus:bg-gray-50 dark:focus:bg-gray-700 focus:text-gray-800 dark:focus:text-gray-200">🟢 Ativa</SelectItem>
              <SelectItem value="expirada" className="focus:bg-gray-50 dark:focus:bg-gray-700 focus:text-gray-800 dark:focus:text-gray-200">🔴 Expirada</SelectItem>
              <SelectItem value="convertida" className="focus:bg-gray-50 dark:focus:bg-gray-700 focus:text-gray-800 dark:focus:text-gray-200">✅ Convertida</SelectItem>
              <SelectItem value="cancelada" className="focus:bg-gray-50 dark:focus:bg-gray-700 focus:text-gray-800 dark:focus:text-gray-200">❌ Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cliente_vip" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <div className="w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-sm">
              <Crown className="h-3 w-3 text-white" />
            </div>
            Tipo de Cliente
          </Label>
          <Select value={filters.cliente_vip} onValueChange={(value) => onFilterChange('cliente_vip', value)}>
            <SelectTrigger className="h-11 rounded-xl border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 focus:border-green-500 focus:ring-green-500 dark:focus:border-green-400 dark:text-gray-100 shadow-sm">
              <SelectValue placeholder="Todos os clientes" />
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 shadow-lg backdrop-blur-sm">
              <SelectItem value="all" className="focus:bg-gray-50 dark:focus:bg-gray-700 focus:text-gray-800 dark:focus:text-gray-200">👥 Todos</SelectItem>
              <SelectItem value="vip" className="focus:bg-gray-50 dark:focus:bg-gray-700 focus:text-gray-800 dark:focus:text-gray-200">👑 Apenas VIP</SelectItem>
              <SelectItem value="regular" className="focus:bg-gray-50 dark:focus:bg-gray-700 focus:text-gray-800 dark:focus:text-gray-200">👤 Apenas Regulares</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="forma_pagamento" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Forma de Pagamento
          </Label>
          <Select value={filters.forma_pagamento} onValueChange={(value) => onFilterChange('forma_pagamento', value)}>
            <SelectTrigger className="h-11 rounded-xl border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 focus:border-green-500 focus:ring-green-500 dark:focus:border-green-400 dark:text-gray-100 shadow-sm">
              <SelectValue placeholder="Todas as formas" />
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 shadow-lg backdrop-blur-sm">
              <SelectItem value="all" className="focus:bg-gray-50 dark:focus:bg-gray-700 focus:text-gray-800 dark:focus:text-gray-200">💳 Todas</SelectItem>
              <SelectItem value="crediario" className="focus:bg-gray-50 dark:focus:bg-gray-700 focus:text-gray-800 dark:focus:text-gray-200">🏪 Crediário</SelectItem>
              <SelectItem value="cartao_credito" className="focus:bg-gray-50 dark:focus:bg-gray-700 focus:text-gray-800 dark:focus:text-gray-200">💳 Cartão de Crédito</SelectItem>
              <SelectItem value="cartao_debito" className="focus:bg-gray-50 dark:focus:bg-gray-700 focus:text-gray-800 dark:focus:text-gray-200">💳 Cartão de Débito</SelectItem>
              <SelectItem value="pix" className="focus:bg-gray-50 dark:focus:bg-gray-700 focus:text-gray-800 dark:focus:text-gray-200">⚡ PIX</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Resumo dos filtros aplicados */}
        {(filters.status !== 'all' || filters.forma_pagamento !== 'all' || filters.cliente_vip !== 'all' || filters.search) && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 backdrop-blur-sm">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Filtros Aplicados:
              </h4>
              <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                {filters.search && <div>• Busca: "{filters.search}"</div>}
                {filters.status !== 'all' && <div>• Status: {filters.status}</div>}
                {filters.forma_pagamento !== 'all' && <div>• Pagamento: {filters.forma_pagamento}</div>}
                {filters.cliente_vip !== 'all' && <div>• Cliente: {filters.cliente_vip}</div>}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
