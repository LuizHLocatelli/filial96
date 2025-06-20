import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, User, CreditCard, ShoppingBag, Package, Hash, Crown, Eye, Trash2, CheckCircle, XCircle, Calendar, Edit } from "lucide-react";
import { ModaReserva } from "../types";
import { ReservaCountdown } from "./ReservaCountdown";
import { EditReservaDialog } from "./EditReservaDialog";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

interface ReservaCardProps {
  reserva: ModaReserva;
  onUpdateStatus: (id: string, status: ModaReserva['status']) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

const statusConfig = {
  ativa: {
    color: "bg-gradient-to-br from-green-50/80 to-emerald-50/80 border-green-200/60 dark:from-gray-800/50 dark:to-gray-750/50 dark:border-green-700/30",
    badge: "bg-green-100/90 text-green-800 border-green-300/60 dark:bg-green-900/40 dark:text-green-300 dark:border-green-600/50",
    icon: Clock,
    label: "Ativa"
  },
  expirada: {
    color: "bg-gradient-to-br from-red-50/80 to-rose-50/80 border-red-200/60 dark:from-gray-800/50 dark:to-gray-750/50 dark:border-red-700/30",
    badge: "bg-red-100/90 text-red-800 border-red-300/60 dark:bg-red-900/40 dark:text-red-300 dark:border-red-600/50",
    icon: XCircle,
    label: "Expirada"
  },
  convertida: {
    color: "bg-gradient-to-br from-green-50/80 to-emerald-50/80 border-green-200/60 dark:from-gray-800/50 dark:to-gray-750/50 dark:border-green-700/30",
    badge: "bg-green-100/90 text-green-800 border-green-300/60 dark:bg-green-900/40 dark:text-green-300 dark:border-green-600/50",
    icon: CheckCircle,
    label: "Convertida"
  },
  cancelada: {
    color: "bg-gradient-to-br from-gray-50/80 to-slate-50/80 border-gray-200/60 dark:from-gray-800/50 dark:to-gray-750/50 dark:border-gray-600/30",
    badge: "bg-gray-100/90 text-gray-800 border-gray-300/60 dark:bg-gray-700/60 dark:text-gray-300 dark:border-gray-600/50",
    icon: XCircle,
    label: "Cancelada"
  }
};

const pagamentoConfig = {
  crediario: { icon: "💳", label: "Crediário", color: "text-emerald-600 dark:text-emerald-400" },
  cartao_credito: { icon: "💳", label: "Cartão de Crédito", color: "text-primary" },
  cartao_debito: { icon: "💳", label: "Cartão de Débito", color: "text-green-600 dark:text-green-400" },
  pix: { icon: "⚡", label: "PIX", color: "text-orange-600 dark:text-orange-400" }
};

export function ReservaCard({ reserva, onUpdateStatus, onDelete, onRefresh }: ReservaCardProps) {
  const isMobile = useIsMobile();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const totalQuantidade = reserva.produtos.reduce((sum, produto) => sum + produto.quantidade, 0);
  const status = statusConfig[reserva.status];
  const StatusIcon = status.icon;
  const pagamento = pagamentoConfig[reserva.forma_pagamento];

  return (
    <>
      <Card className={cn(
        "group relative overflow-hidden transition-all duration-300",
        "border shadow-lg backdrop-blur-sm",
        isMobile ? "hover:shadow-xl" : "hover:scale-[1.02] hover:shadow-xl",
        status.color
      )}>
        {/* Overlay decorativo */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-white/5 dark:to-transparent pointer-events-none" />
        
        {/* Header moderno */}
        <CardHeader className={cn("relative", isMobile ? "pb-3 px-4 pt-4" : "pb-4")}>
          <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <CardTitle className={cn(
                    "font-bold leading-tight line-clamp-2 text-gray-900 dark:text-gray-100",
                    isMobile ? "text-base pr-2" : "text-lg"
                  )}>
                    {reserva.produtos.length === 1 
                      ? reserva.produtos[0].nome 
                      : `${reserva.produtos.length} produtos selecionados`
                    }
                  </CardTitle>
                  {reserva.cliente_vip && (
                    <Badge className={cn(
                      "bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-md",
                      isMobile ? "mt-1.5 text-xs" : "mt-2"
                    )}>
                      <Crown className={cn(isMobile ? "h-2.5 w-2.5 mr-1" : "h-3 w-3 mr-1")} />
                      Cliente VIP
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Informações rápidas */}
              <div className={cn(
                "flex items-center gap-4 text-gray-600 dark:text-gray-400",
                isMobile ? "text-xs" : "text-sm"
              )}>
                <div className="flex items-center gap-1">
                  <Package className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
                  <span className="font-medium">{totalQuantidade} {totalQuantidade === 1 ? 'item' : 'itens'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
                  <span>{format(new Date(reserva.created_at), "dd/MM", { locale: ptBR })}</span>
                </div>
              </div>
            </div>
            
            {/* Status Badge */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <Badge className={cn("border shadow-sm", status.badge, isMobile ? "text-xs" : "")}>
                <StatusIcon className={cn(isMobile ? "h-2.5 w-2.5 mr-1" : "h-3 w-3 mr-1")} />
                {status.label}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className={cn("relative space-y-4", isMobile ? "px-4 pb-4" : "space-y-6")}>
          {/* Produtos - Design compacto e elegante */}
          <div className={cn("space-y-2", isMobile ? "space-y-2" : "space-y-3")}>
            <h4 className={cn(
              "font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide",
              isMobile ? "text-xs" : "text-sm"
            )}>
              Produtos
            </h4>
            <div className={cn(
              "space-y-2 overflow-y-auto",
              isMobile ? "max-h-32" : "max-h-40"
            )}>
              {reserva.produtos.map((produto, index) => (
                <div key={index} className={cn(
                  "group/produto bg-white/60 dark:bg-gray-700/30 rounded-xl border border-white/20 dark:border-gray-600/20 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-700/50 transition-all duration-200",
                  isMobile ? "p-2.5" : "p-3"
                )}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        "font-medium truncate text-gray-900 dark:text-gray-100",
                        isMobile ? "text-sm" : "text-sm"
                      )}>{produto.nome}</div>
                      <div className={cn(
                        "flex items-center gap-2 text-gray-600 dark:text-gray-400 mt-1",
                        isMobile ? "text-xs flex-wrap" : "text-xs"
                      )}>
                        <Hash className={cn(isMobile ? "h-2.5 w-2.5" : "h-3 w-3")} />
                        <span className="font-mono">{produto.codigo}</span>
                        {produto.tamanho && (
                          <>
                            <span>•</span>
                            <span>Tam: {produto.tamanho}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className={cn("text-right flex-shrink-0", isMobile ? "ml-2" : "ml-3")}>
                      <div className={cn(
                        "font-bold text-green-600 dark:text-green-400",
                        isMobile ? "text-sm" : "text-sm"
                      )}>
                        {produto.quantidade}x
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cliente e Pagamento */}
          <div className={cn("grid grid-cols-1 gap-3", isMobile ? "gap-2" : "gap-4")}>
            {/* Cliente */}
            <div className={cn(
              "flex items-center gap-3 bg-white/60 dark:bg-gray-700/30 rounded-xl border border-white/20 dark:border-gray-600/20 backdrop-blur-sm",
              isMobile ? "p-2.5" : "p-3"
            )}>
              <div className="flex-shrink-0">
                <div className={cn(
                  "bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center",
                  isMobile ? "w-7 h-7" : "w-8 h-8"
                )}>
                  <User className={cn("text-white", isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className={cn(
                  "font-medium truncate text-gray-900 dark:text-gray-100",
                  isMobile ? "text-sm" : "text-sm"
                )}>{reserva.cliente_nome}</div>
                <div className={cn(
                  "text-gray-600 dark:text-gray-400 font-mono",
                  isMobile ? "text-xs" : "text-xs"
                )}>{reserva.cliente_cpf}</div>
              </div>
            </div>

            {/* Pagamento */}
            <div className={cn(
              "flex items-center gap-3 bg-white/60 dark:bg-gray-700/30 rounded-xl border border-white/20 dark:border-gray-600/20 backdrop-blur-sm",
              isMobile ? "p-2.5" : "p-3"
            )}>
              <div className="flex-shrink-0">
                <div className={cn(
                  "bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center",
                  isMobile ? "w-7 h-7 text-sm" : "w-8 h-8 text-sm"
                )}>
                  {pagamento.icon}
                </div>
              </div>
              <div className="flex-1">
                <div className={cn(
                  "font-medium", 
                  pagamento.color,
                  isMobile ? "text-sm" : "text-sm"
                )}>
                  {pagamento.label}
                </div>
              </div>
            </div>
          </div>

          {/* Countdown - apenas para reservas ativas */}
          {reserva.status === 'ativa' && (
            <div className={cn(
              "bg-gradient-to-r from-orange-50 to-red-50 dark:from-gray-700/50 dark:to-gray-600/50 rounded-xl border border-orange-200 dark:border-gray-600/40",
              isMobile ? "p-3" : "p-4"
            )}>
              <ReservaCountdown 
                dataExpiracao={reserva.data_expiracao} 
                status={reserva.status}
                clienteVip={reserva.cliente_vip}
              />
            </div>
          )}

          {/* Observações */}
          {reserva.observacoes && (
            <div className={cn(
              "bg-white/60 dark:bg-gray-700/30 rounded-xl border border-white/20 dark:border-gray-600/20 backdrop-blur-sm",
              isMobile ? "p-2.5" : "p-3"
            )}>
              <div className={cn(isMobile ? "text-sm" : "text-sm")}>
                <span className="font-semibold text-gray-600 dark:text-gray-400">Observações:</span>
                <p className="mt-1 text-gray-600 dark:text-gray-300">{reserva.observacoes}</p>
              </div>
            </div>
          )}

          {/* Actions modernas - Agora para todos os status */}
          <div className={cn("pt-2", isMobile ? "space-y-2" : "space-y-3")}>
            {/* Botões universais de Editar e Excluir */}
            <div className={cn("flex gap-2", isMobile ? "flex-col" : "")}>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditDialogOpen(true)}
                className={cn(
                  "border-2 hover:bg-primary/5 dark:hover:bg-primary/10 hover:border-primary/30 dark:hover:border-primary/40 hover:text-primary dark:hover:text-primary transition-all duration-200 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300",
                  isMobile ? "flex-1 h-10 text-sm" : "flex-1 h-11"
                )}
              >
                <Edit className={cn("mr-2", isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
                Editar Reserva
              </Button>
              
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(reserva.id)}
                className={cn(
                  "bg-red-600 hover:bg-red-700 text-white border-2 border-red-600 hover:border-red-700 shadow-sm hover:shadow-md transition-all duration-200",
                  isMobile ? "h-10 px-3" : "h-11 px-4"
                )}
              >
                <Trash2 className={cn(isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
              </Button>
            </div>

            {/* Ações específicas por status */}
            {reserva.status === 'ativa' && (
              <div className={cn("flex gap-2", isMobile ? "flex-col" : "")}>
                <Button
                  size="sm"
                  onClick={() => onUpdateStatus(reserva.id, 'convertida')}
                  className={cn(
                    "btn-primary-standard",
                    isMobile ? "flex-1 h-10 text-sm" : "flex-1 h-11"
                  )}
                >
                  <CheckCircle className={cn("mr-2", isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
                  {isMobile ? "Converter" : "Converter em Venda"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateStatus(reserva.id, 'cancelada')}
                  className={cn(
                    "border-2 hover:bg-primary/5 dark:hover:bg-primary/10 hover:border-primary/30 dark:hover:border-primary/40 hover:text-primary dark:hover:text-primary transition-all duration-200 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300",
                    isMobile ? "h-10 px-3" : "h-11 px-4"
                  )}
                >
                  <XCircle className={cn("mr-2", isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
                  Cancelar Reserva
                </Button>
              </div>
            )}

            {reserva.status === 'convertida' && (
              <div className={cn(
                "flex items-center justify-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700/50 dark:to-gray-600/50 rounded-xl border border-green-200 dark:border-gray-600/40",
                isMobile ? "p-2.5" : "p-3"
              )}>
                <CheckCircle className={cn("text-green-600 dark:text-green-400", isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
                <span className={cn(
                  "font-medium text-green-700 dark:text-green-300",
                  isMobile ? "text-sm" : "text-sm"
                )}>
                  Reserva convertida em venda
                </span>
              </div>
            )}

            {reserva.status === 'cancelada' && (
              <div className={cn(
                "flex items-center justify-center gap-2 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-700/50 dark:to-gray-600/50 rounded-xl border border-gray-200 dark:border-gray-600/40",
                isMobile ? "p-2.5" : "p-3"
              )}>
                <XCircle className={cn("text-gray-600 dark:text-gray-400", isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
                <span className={cn(
                  "font-medium text-gray-700 dark:text-gray-300",
                  isMobile ? "text-sm" : "text-sm"
                )}>
                  Reserva cancelada
                </span>
              </div>
            )}

            {reserva.status === 'expirada' && (
              <div className={cn(
                "flex items-center justify-center gap-2 bg-gradient-to-r from-red-50 to-rose-50 dark:from-gray-700/50 dark:to-gray-600/50 rounded-xl border border-red-200 dark:border-gray-600/40",
                isMobile ? "p-2.5" : "p-3"
              )}>
                <XCircle className={cn("text-red-600 dark:text-red-400", isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
                <span className={cn(
                  "font-medium text-red-700 dark:text-red-300",
                  isMobile ? "text-sm" : "text-sm"
                )}>
                  Reserva expirada
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <EditReservaDialog
        reserva={reserva}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={onRefresh}
      />
    </>
  );
}
