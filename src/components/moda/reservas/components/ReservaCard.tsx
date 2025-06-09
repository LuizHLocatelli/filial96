
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, User, CreditCard, Package, Calendar, ShoppingBag, Trash2 } from "lucide-react";
import { ModaReserva } from "../types";
import { ReservaCountdown } from "./ReservaCountdown";
import { useReservas } from "../hooks/useReservas";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ReservaCardProps {
  reserva: ModaReserva;
}

export function ReservaCard({ reserva }: ReservaCardProps) {
  const { updateReservaStatus, deleteReserva } = useReservas();

  const getStatusBadge = (status: string) => {
    const variants = {
      ativa: { variant: "default" as const, label: "Ativa", color: "bg-green-100 text-green-800" },
      expirada: { variant: "secondary" as const, label: "Expirada", color: "bg-gray-100 text-gray-800" },
      convertida: { variant: "default" as const, label: "Convertida", color: "bg-blue-100 text-blue-800" },
      cancelada: { variant: "destructive" as const, label: "Cancelada", color: "bg-red-100 text-red-800" }
    };
    const config = variants[status as keyof typeof variants];
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getFormaPagamentoLabel = (forma: string) => {
    const labels = {
      crediario: "Crediário",
      cartao_credito: "Cartão de Crédito",
      cartao_debito: "Cartão de Débito",
      pix: "PIX"
    };
    return labels[forma as keyof typeof labels] || forma;
  };

  const handleConvertToSale = async () => {
    // Por enquanto, apenas marca como convertida
    // No futuro, pode abrir um modal para criar a venda
    await updateReservaStatus(reserva.id, 'convertida');
  };

  const handleCancel = async () => {
    await updateReservaStatus(reserva.id, 'cancelada');
  };

  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja excluir esta reserva?')) {
      await deleteReserva(reserva.id);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg">{reserva.produto_nome}</h3>
            <p className="text-sm text-muted-foreground">Código: {reserva.produto_codigo}</p>
          </div>
          <div className="flex items-center gap-2">
            <ReservaCountdown 
              dataExpiracao={reserva.data_expiracao} 
              status={reserva.status} 
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {reserva.status === 'ativa' && (
                  <>
                    <DropdownMenuItem onClick={handleConvertToSale}>
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Converter em Venda
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleCancel}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Cancelar Reserva
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span>
              Qtd: {reserva.quantidade}
              {reserva.tamanho && ` • Tam: ${reserva.tamanho}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{reserva.cliente_nome}</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span>{getFormaPagamentoLabel(reserva.forma_pagamento)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{format(new Date(reserva.data_reserva), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
          </div>
        </div>

        {reserva.observacoes && (
          <div className="text-sm text-muted-foreground bg-gray-50 p-2 rounded">
            <p>{reserva.observacoes}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          {getStatusBadge(reserva.status)}
          <span className="text-xs text-muted-foreground">
            CPF: {reserva.cliente_cpf}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
