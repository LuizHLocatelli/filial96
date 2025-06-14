
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
    <Card className="border shadow-sm bg-white/70 dark:bg-gray-800/30 backdrop-blur-sm border-gray-200/50 dark:border-gray-600/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-gray-200/90">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500/80 to-green-600/80 rounded-full flex items-center justify-center shadow-sm">
            <Filter className="h-4 w-4 text-white" />
          </div>
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="search" className="text-sm font-semibold text-gray-700 dark:text-gray-300/90">
            Busca Rápida
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400/80 h-4 w-4" />
            <Input
              id="search"
              placeholder="Cliente, produto, código..."
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              className="pl-10 h-11 rounded-xl border-gray-200/50 dark:border-gray-600/30 bg-white/80 dark:bg-gray-700/30 focus:border-green-500/80 focus:ring-green-500/80 dark:focus:border-green-400/80 dark:placeholder:text-gray-400/80 dark:text-gray-100/90 shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status" className="text-sm font-semibold text-gray-700 dark:text-gray-300/90">
            Status da Reserva
          </Label>
          <Select value={filters.status} onValueChange={(value) => onFilterChange('status', value)}>
            <SelectTrigger className="h-11 rounded-xl border-gray-200/50 dark:border-gray-600/30 bg-white/80 dark:bg-gray-700/30 focus:border-green-500/80 focus:ring-green-500/80 dark:focus:border-green-400/80 dark:text-gray-100/90 shadow-sm">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-white/95 dark:bg-gray-800/95 border-gray-200/50 dark:border-gray-600/30 shadow-lg backdrop-blur-sm">
              <SelectItem value="all" className="focus:bg-gray-50/80 dark:focus:bg-gray-700/50 focus:text-gray-800 dark:focus:text-gray-200/90">✨ Todos</SelectItem>
              <SelectItem value="ativa" className="focus:bg-gray-50/80 dark:focus:bg-gray-700/50 focus:text-gray-800 dark:focus:text-gray-200/90">🟢 Ativa</SelectItem>
              <SelectItem value="expirada" className="focus:bg-gray-50/80 dark:focus:bg-gray-700/50 focus:text-gray-800 dark:focus:text-gray-200/90">🔴 Expirada</SelectItem>
              <SelectItem value="convertida" className="focus:bg-gray-50/80 dark:focus:bg-gray-700/50 focus:text-gray-800 dark:focus:text-gray-200/90">✅ Convertida</SelectItem>
              <SelectItem value="cancelada" className="focus:bg-gray-50/80 dark:focus:bg-gray-700/50 focus:text-gray-800 dark:focus:text-gray-200/90">❌ Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cliente_vip" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300/90">
            <div className="w-5 h-5 bg-gradient-to-br from-yellow-400/80 to-orange-500/80 rounded-full flex items-center justify-center shadow-sm">
              <Crown className="h-3 w-3 text-white" />
            </div>
            Tipo de Cliente
          </Label>
          <Select value={filters.cliente_vip} onValueChange={(value) => onFilterChange('cliente_vip', value)}>
            <SelectTrigger className="h-11 rounded-xl border-gray-200/50 dark:border-gray-600/30 bg-white/80 dark:bg-gray-700/30 focus:border-green-500/80 focus:ring-green-500/80 dark:focus:border-green-400/80 dark:text-gray-100/90 shadow-sm">
              <SelectValue placeholder="Todos os clientes" />
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-white/95 dark:bg-gray-800/95 border-gray-200/50 dark:border-gray-600/30 shadow-lg backdrop-blur-sm">
              <SelectItem value="all" className="focus:bg-gray-50/80 dark:focus:bg-gray-700/50 focus:text-gray-800 dark:focus:text-gray-200/90">👥 Todos</SelectItem>
              <SelectItem value="vip" className="focus:bg-gray-50/80 dark:focus:bg-gray-700/50 focus:text-gray-800 dark:focus:text-gray-200/90">👑 Apenas VIP</SelectItem>
              <SelectItem value="regular" className="focus:bg-gray-50/80 dark:focus:bg-gray-700/50 focus:text-gray-800 dark:focus:text-gray-200/90">👤 Apenas Regulares</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="forma_pagamento" className="text-sm font-semibold text-gray-700 dark:text-gray-300/90">
            Forma de Pagamento
          </Label>
          <Select value={filters.forma_pagamento} onValueChange={(value) => onFilterChange('forma_pagamento', value)}>
            <SelectTrigger className="h-11 rounded-xl border-gray-200/50 dark:border-gray-600/30 bg-white/80 dark:bg-gray-700/30 focus:border-green-500/80 focus:ring-green-500/80 dark:focus:border-green-400/80 dark:text-gray-100/90 shadow-sm">
              <SelectValue placeholder="Todas as formas" />
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-white/95 dark:bg-gray-800/95 border-gray-200/50 dark:border-gray-600/30 shadow-lg backdrop-blur-sm">
              <SelectItem value="all" className="focus:bg-gray-50/80 dark:focus:bg-gray-700/50 focus:text-gray-800 dark:focus:text-gray-200/90">💳 Todas</SelectItem>
              <SelectItem value="crediario" className="focus:bg-gray-50/80 dark:focus:bg-gray-700/50 focus:text-gray-800 dark:focus:text-gray-200/90">🏪 Crediário</SelectItem>
              <SelectItem value="cartao_credito" className="focus:bg-gray-50/80 dark:focus:bg-gray-700/50 focus:text-gray-800 dark:focus:text-gray-200/90">💳 Cartão de Crédito</SelectItem>
              <SelectItem value="cartao_debito" className="focus:bg-gray-50/80 dark:focus:bg-gray-700/50 focus:text-gray-800 dark:focus:text-gray-200/90">💳 Cartão de Débito</SelectItem>
              <SelectItem value="pix" className="focus:bg-gray-50/80 dark:focus:bg-gray-700/50 focus:text-gray-800 dark:focus:text-gray-200/90">⚡ PIX</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Resumo dos filtros aplicados */}
        {(filters.status !== 'all' || filters.forma_pagamento !== 'all' || filters.cliente_vip !== 'all' || filters.search) && (
          <div className="pt-4 border-t border-gray-200/50 dark:border-gray-600/30">
            <div className="p-3 bg-gray-50/50 dark:bg-gray-700/30 rounded-xl border border-gray-200/50 dark:border-gray-600/30 backdrop-blur-sm">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300/90 mb-2">
                Filtros Aplicados:
              </h4>
              <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400/80">
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
