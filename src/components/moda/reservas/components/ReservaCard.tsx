
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, User, CreditCard, ShoppingBag, Package, Hash } from "lucide-react";
import { ModaReserva } from "../types";
import { ReservaCountdown } from "./ReservaCountdown";

interface ReservaCardProps {
  reserva: ModaReserva;
  onUpdateStatus: (id: string, status: ModaReserva['status']) => void;
  onDelete: (id: string) => void;
}

const statusColors = {
  ativa: "bg-green-500/20 text-green-700 border-green-200",
  expirada: "bg-red-500/20 text-red-700 border-red-200", 
  convertida: "bg-blue-500/20 text-blue-700 border-blue-200",
  cancelada: "bg-gray-500/20 text-gray-700 border-gray-200"
};

const statusLabels = {
  ativa: "Ativa",
  expirada: "Expirada",
  convertida: "Convertida",
  cancelada: "Cancelada"
};

const pagamentoLabels = {
  crediario: "Crediário",
  cartao_credito: "Cartão de Crédito",
  cartao_debito: "Cartão de Débito",
  pix: "PIX"
};

export function ReservaCard({ reserva, onUpdateStatus, onDelete }: ReservaCardProps) {
  const totalQuantidade = reserva.produtos.reduce((sum, produto) => sum + produto.quantidade, 0);

  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              {reserva.produtos.length === 1 
                ? reserva.produtos[0].nome 
                : `${reserva.produtos.length} produtos`
              }
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="h-4 w-4" />
              <span>{totalQuantidade} {totalQuantidade === 1 ? 'item' : 'itens'}</span>
            </div>
          </div>
          <Badge className={statusColors[reserva.status]}>
            {statusLabels[reserva.status]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Lista de Produtos */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Produtos:</h4>
          <div className="space-y-2">
            {reserva.produtos.map((produto, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm">
                <div className="flex-1">
                  <div className="font-medium">{produto.nome}</div>
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <Hash className="h-3 w-3" />
                    <span>{produto.codigo}</span>
                    {produto.tamanho && (
                      <>
                        <span>•</span>
                        <span>Tam: {produto.tamanho}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">Qtd: {produto.quantidade}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Informações do Cliente */}
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{reserva.cliente_nome}</span>
          <span className="text-muted-foreground">• {reserva.cliente_cpf}</span>
        </div>

        {/* Forma de Pagamento */}
        <div className="flex items-center gap-2 text-sm">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <span>{pagamentoLabels[reserva.forma_pagamento]}</span>
        </div>

        {/* Countdown */}
        {reserva.status === 'ativa' && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <ReservaCountdown dataExpiracao={reserva.data_expiracao} status={reserva.status} />
          </div>
        )}

        {/* Observações */}
        {reserva.observacoes && (
          <div className="text-sm text-muted-foreground p-2 bg-muted/30 rounded">
            <span className="font-medium">Obs:</span> {reserva.observacoes}
          </div>
        )}

        {/* Actions */}
        {reserva.status === 'ativa' && (
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              onClick={() => onUpdateStatus(reserva.id, 'convertida')}
              className="flex-1"
            >
              Converter em Venda
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateStatus(reserva.id, 'cancelada')}
            >
              Cancelar
            </Button>
          </div>
        )}

        {(reserva.status === 'cancelada' || reserva.status === 'expirada') && (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(reserva.id)}
            className="w-full"
          >
            Remover Reserva
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
