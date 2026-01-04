import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Clock,
  User,
  CreditCard,
  Package,
  Hash,
  Crown,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Calendar,
} from "lucide-react";
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
  onUpdateStatus: (id: string, status: ModaReserva["status"]) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

const statusConfig = {
  ativa: {
    color: "border-green-200 dark:border-green-800",
    badge: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    icon: Clock,
    label: "Ativa",
  },
  expirada: {
    color: "border-red-200 dark:border-red-800",
    badge: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    icon: XCircle,
    label: "Expirada",
  },
  convertida: {
    color: "border-green-200 dark:border-green-800",
    badge: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    icon: CheckCircle,
    label: "Convertida",
  },
  cancelada: {
    color: "border-gray-200 dark:border-gray-700",
    badge: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    icon: XCircle,
    label: "Cancelada",
  },
};

const pagamentoConfig = {
  crediario: { icon: "💳", label: "Crediário", color: "text-emerald-600" },
  cartao_credito: { icon: "💳", label: "Cartão de Crédito", color: "text-primary" },
  cartao_debito: { icon: "💳", label: "Cartão de Débito", color: "text-green-600" },
  pix: { icon: "⚡", label: "PIX", color: "text-orange-600" },
};

export function ReservaCard({
  reserva,
  onUpdateStatus,
  onDelete,
  onRefresh,
}: ReservaCardProps) {
  const isMobile = useIsMobile();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const totalQuantidade = reserva.produtos.reduce(
    (sum, produto) => sum + produto.quantidade,
    0
  );
  const status = statusConfig[reserva.status];
  const StatusIcon = status.icon;
  const pagamento = pagamentoConfig[reserva.forma_pagamento];

  return (
    <>
      <Card className={cn("overflow-hidden", status.color)}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base line-clamp-2">
                {reserva.produtos.length === 1
                  ? reserva.produtos[0].nome
                  : `${reserva.produtos.length} produtos`}
              </CardTitle>
              <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  <span>{totalQuantidade} itens</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(new Date(reserva.created_at), "dd/MM", { locale: ptBR })}
                  </span>
                </div>
              </div>
            </div>
            <Badge className={cn("flex-shrink-0", status.badge)}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {status.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Lista de Produtos */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Produtos</h4>
            <div className="space-y-2">
              {reserva.produtos.map((produto, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{produto.nome}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
                  <div className="text-sm font-bold text-primary ml-2">
                    {produto.quantidade}x
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cliente e Pagamento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
              <div className="bg-primary/10 rounded-full p-2">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{reserva.cliente_nome}</div>
                <div className="text-xs text-muted-foreground font-mono">
                  {reserva.cliente_cpf}
                </div>
              </div>
              {reserva.cliente_vip && (
                <Crown className="h-4 w-4 text-yellow-500 flex-shrink-0" />
              )}
            </div>

            <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
              <div className="bg-primary/10 rounded-full p-2">
                <span className="text-sm">{pagamento.icon}</span>
              </div>
              <div className="text-sm font-medium">{pagamento.label}</div>
            </div>
          </div>

          {/* Countdown para reservas ativas */}
          {reserva.status === "ativa" && (
            <ReservaCountdown
              dataExpiracao={reserva.data_expiracao}
              status={reserva.status}
              clienteVip={reserva.cliente_vip}
            />
          )}

          {/* Observações */}
          {reserva.observacoes && (
            <div className="p-2 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Obs:</span> {reserva.observacoes}
              </p>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditDialogOpen(true)}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(reserva.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Ações específicas por status */}
          {reserva.status === "ativa" && (
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => onUpdateStatus(reserva.id, "convertida")}
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Converter
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdateStatus(reserva.id, "cancelada")}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          )}

          {reserva.status === "convertida" && (
            <div className="flex items-center justify-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                Convertida em venda
              </span>
            </div>
          )}

          {reserva.status === "cancelada" && (
            <div className="flex items-center justify-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <XCircle className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Reserva cancelada
              </span>
            </div>
          )}

          {reserva.status === "expirada" && (
            <div className="flex items-center justify-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-700 dark:text-red-300">
                Reserva expirada
              </span>
            </div>
          )}
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
