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
    <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/70 dark:to-green-800/70 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-bold">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
            <Filter className="h-4 w-4 text-white" />
          </div>
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="search" className="text-sm font-semibold text-green-700 dark:text-green-300">
            Busca Rápida
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              id="search"
              placeholder="Cliente, produto, código..."
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              className="pl-10 h-11 rounded-xl border-green-200 dark:border-green-600/50 bg-white/80 dark:bg-gradient-to-r dark:from-green-800/90 dark:to-green-700/70 focus:border-green-500 focus:ring-green-500 dark:focus:border-green-400 dark:placeholder:text-green-300 dark:text-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status" className="text-sm font-semibold text-green-700 dark:text-green-300">
            Status da Reserva
          </Label>
          <Select value={filters.status} onValueChange={(value) => onFilterChange('status', value)}>
            <SelectTrigger className="h-11 rounded-xl border-green-200 dark:border-green-600/50 bg-white/80 dark:bg-gradient-to-r dark:from-green-800/90 dark:to-green-700/70 focus:border-green-500 focus:ring-green-500 dark:focus:border-green-400 dark:text-white">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">✨ Todos</SelectItem>
              <SelectItem value="ativa">🟢 Ativa</SelectItem>
              <SelectItem value="expirada">🔴 Expirada</SelectItem>
              <SelectItem value="convertida">✅ Convertida</SelectItem>
              <SelectItem value="cancelada">❌ Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cliente_vip" className="flex items-center gap-2 text-sm font-semibold text-green-700 dark:text-green-300">
            <div className="w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Crown className="h-3 w-3 text-white" />
            </div>
            Tipo de Cliente
          </Label>
          <Select value={filters.cliente_vip} onValueChange={(value) => onFilterChange('cliente_vip', value)}>
            <SelectTrigger className="h-11 rounded-xl border-green-200 dark:border-green-600/50 bg-white/80 dark:bg-gradient-to-r dark:from-green-800/90 dark:to-green-700/70 focus:border-green-500 focus:ring-green-500 dark:focus:border-green-400 dark:text-white">
              <SelectValue placeholder="Todos os clientes" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">👥 Todos</SelectItem>
              <SelectItem value="vip">👑 Apenas VIP</SelectItem>
              <SelectItem value="regular">👤 Apenas Regulares</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="forma_pagamento" className="text-sm font-semibold text-green-700 dark:text-green-300">
            Forma de Pagamento
          </Label>
          <Select value={filters.forma_pagamento} onValueChange={(value) => onFilterChange('forma_pagamento', value)}>
            <SelectTrigger className="h-11 rounded-xl border-green-200 dark:border-green-600/50 bg-white/80 dark:bg-gradient-to-r dark:from-green-800/90 dark:to-green-700/70 focus:border-green-500 focus:ring-green-500 dark:focus:border-green-400 dark:text-white">
              <SelectValue placeholder="Todas as formas" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">💳 Todas</SelectItem>
              <SelectItem value="crediario">🏪 Crediário</SelectItem>
              <SelectItem value="cartao_credito">💳 Cartão de Crédito</SelectItem>
              <SelectItem value="cartao_debito">💳 Cartão de Débito</SelectItem>
              <SelectItem value="pix">⚡ PIX</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Resumo dos filtros aplicados */}
        {(filters.status !== 'all' || filters.forma_pagamento !== 'all' || filters.cliente_vip !== 'all' || filters.search) && (
          <div className="pt-4 border-t border-green-200 dark:border-green-600/50">
            <div className="p-3 bg-green-100 dark:bg-gradient-to-r dark:from-green-800/60 dark:to-green-700/60 rounded-xl">
              <h4 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2">
                Filtros Aplicados:
              </h4>
              <div className="space-y-1 text-xs text-green-600 dark:text-green-400">
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
