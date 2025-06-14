
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, User, CreditCard, ShoppingBag, Package, Hash, Crown, Eye, Trash2, CheckCircle, XCircle, Calendar } from "lucide-react";
import { ModaReserva } from "../types";
import { ReservaCountdown } from "./ReservaCountdown";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ReservaCardProps {
  reserva: ModaReserva;
  onUpdateStatus: (id: string, status: ModaReserva['status']) => void;
  onDelete: (id: string) => void;
}

const statusConfig = {
  ativa: {
    color: "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 dark:from-gray-800/50 dark:to-gray-750/50 dark:border-gray-600/30",
    badge: "bg-green-100 text-green-800 border-green-300 dark:bg-gray-700/60 dark:text-green-300 dark:border-gray-600/50",
    icon: Clock,
    label: "Ativa"
  },
  expirada: {
    color: "bg-gradient-to-br from-red-50 to-rose-50 border-red-200 dark:from-gray-800/50 dark:to-gray-750/50 dark:border-gray-600/30",
    badge: "bg-red-100 text-red-800 border-red-300 dark:bg-gray-700/60 dark:text-red-300 dark:border-gray-600/50",
    icon: XCircle,
    label: "Expirada"
  },
  convertida: {
    color: "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 dark:from-gray-800/50 dark:to-gray-750/50 dark:border-gray-600/30",
    badge: "bg-green-100 text-green-800 border-green-300 dark:bg-gray-700/60 dark:text-green-300 dark:border-gray-600/50",
    icon: CheckCircle,
    label: "Convertida"
  },
  cancelada: {
    color: "bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200 dark:from-gray-800/50 dark:to-gray-750/50 dark:border-gray-600/30",
    badge: "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700/60 dark:text-gray-300 dark:border-gray-600/50",
    icon: XCircle,
    label: "Cancelada"
  }
};

const pagamentoConfig = {
  crediario: { icon: "💳", label: "Crediário", color: "text-purple-600 dark:text-purple-400" },
  cartao_credito: { icon: "💳", label: "Cartão de Crédito", color: "text-blue-600 dark:text-blue-400" },
  cartao_debito: { icon: "💳", label: "Cartão de Débito", color: "text-green-600 dark:text-green-400" },
  pix: { icon: "⚡", label: "PIX", color: "text-orange-600 dark:text-orange-400" }
};

export function ReservaCard({ reserva, onUpdateStatus, onDelete }: ReservaCardProps) {
  const totalQuantidade = reserva.produtos.reduce((sum, produto) => sum + produto.quantidade, 0);
  const status = statusConfig[reserva.status];
  const StatusIcon = status.icon;
  const pagamento = pagamentoConfig[reserva.forma_pagamento];

  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl",
      "border-0 shadow-lg backdrop-blur-sm",
      status.color
    )}>
      {/* Overlay decorativo */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-white/5 dark:to-transparent pointer-events-none" />
      
      {/* Header moderno */}
      <CardHeader className="relative pb-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <CardTitle className="text-lg font-bold leading-tight line-clamp-2 text-gray-900 dark:text-gray-100">
                  {reserva.produtos.length === 1 
                    ? reserva.produtos[0].nome 
                    : `${reserva.produtos.length} produtos selecionados`
                  }
                </CardTitle>
                {reserva.cliente_vip && (
                  <Badge className="mt-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-md">
                    <Crown className="h-3 w-3 mr-1" />
                    Cliente VIP
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Informações rápidas */}
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Package className="h-4 w-4" />
                <span className="font-medium">{totalQuantidade} {totalQuantidade === 1 ? 'item' : 'itens'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(reserva.created_at), "dd/MM", { locale: ptBR })}</span>
              </div>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className="flex flex-col items-end gap-2">
            <Badge className={cn("border shadow-sm", status.badge)}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {status.label}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-6">
        {/* Produtos - Design compacto e elegante */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            Produtos
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {reserva.produtos.map((produto, index) => (
              <div key={index} className="group/produto p-3 bg-white/60 dark:bg-gray-700/30 rounded-xl border border-white/20 dark:border-gray-600/20 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-700/50 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate text-gray-900 dark:text-gray-100">{produto.nome}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mt-1">
                      <Hash className="h-3 w-3" />
                      <span className="font-mono">{produto.codigo}</span>
                      {produto.tamanho && (
                        <>
                          <span>•</span>
                          <span>Tam: {produto.tamanho}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="ml-3 text-right">
                    <div className="text-sm font-bold text-green-600 dark:text-green-400">
                      {produto.quantidade}x
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cliente e Pagamento */}
        <div className="grid grid-cols-1 gap-4">
          {/* Cliente */}
          <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-700/30 rounded-xl border border-white/20 dark:border-gray-600/20 backdrop-blur-sm">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate text-gray-900 dark:text-gray-100">{reserva.cliente_nome}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 font-mono">{reserva.cliente_cpf}</div>
            </div>
          </div>

          {/* Pagamento */}
          <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-700/30 rounded-xl border border-white/20 dark:border-gray-600/20 backdrop-blur-sm">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-sm">
                {pagamento.icon}
              </div>
            </div>
            <div className="flex-1">
              <div className={cn("font-medium text-sm", pagamento.color)}>
                {pagamento.label}
              </div>
            </div>
          </div>
        </div>

        {/* Countdown - apenas para reservas ativas */}
        {reserva.status === 'ativa' && (
          <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-gray-700/50 dark:to-gray-600/50 rounded-xl border border-orange-200 dark:border-gray-600/40">
            <ReservaCountdown 
              dataExpiracao={reserva.data_expiracao} 
              status={reserva.status}
              clienteVip={reserva.cliente_vip}
            />
          </div>
        )}

        {/* Observações */}
        {reserva.observacoes && (
          <div className="p-3 bg-white/60 dark:bg-gray-700/30 rounded-xl border border-white/20 dark:border-gray-600/20 backdrop-blur-sm">
            <div className="text-sm">
              <span className="font-semibold text-gray-600 dark:text-gray-400">Observações:</span>
              <p className="mt-1 text-gray-600 dark:text-gray-300">{reserva.observacoes}</p>
            </div>
          </div>
        )}

        {/* Actions modernas */}
        <div className="pt-2 space-y-3">
          {reserva.status === 'ativa' && (
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => onUpdateStatus(reserva.id, 'convertida')}
                className="flex-1 h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-md transition-all duration-200"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Converter em Venda
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdateStatus(reserva.id, 'cancelada')}
                className="h-11 px-4 border-2 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 hover:text-red-700 dark:hover:text-red-400 transition-all duration-200 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          )}

          {(reserva.status === 'cancelada' || reserva.status === 'expirada') && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(reserva.id)}
              className="w-full h-11 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 border-0 shadow-md transition-all duration-200"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remover Reserva
            </Button>
          )}

          {reserva.status === 'convertida' && (
            <div className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700/50 dark:to-gray-600/50 rounded-xl border border-green-200 dark:border-gray-600/40">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                Reserva convertida em venda
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
