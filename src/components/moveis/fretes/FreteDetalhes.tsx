import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  User,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  Brain,
  ExternalLink,
  Edit,
  Receipt,
} from "lucide-react";

import { Frete } from "@/types/frete";
import { formatPhoneNumber } from "@/utils/phoneFormatter";
import { useMobileDialog } from "@/hooks/useMobileDialog";

interface FreteDetalhesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  frete: Frete | null;
  onEdit?: (frete: Frete) => void;
}

const STATUS_COLORS = {
  'Pendente de Entrega': 'default',
  'Em Transporte': 'secondary',
  'Entregue': 'success',
  'Cancelado': 'destructive',
} as const;

const STATUS_ICONS = {
  'Pendente de Entrega': Clock,
  'Em Transporte': Truck,
  'Entregue': CheckCircle,
  'Cancelado': XCircle,
};

export function FreteDetalhes({ open, onOpenChange, frete, onEdit }: FreteDetalhesProps) {
  const { getMobileDialogProps } = useMobileDialog();

  if (!frete) return null;

  const StatusIcon = STATUS_ICONS[frete.status];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const formatDateOnly = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(frete);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        {...getMobileDialogProps("large")}
        className="max-h-[95vh] overflow-y-auto w-[95vw] max-w-4xl p-4 sm:p-6"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Detalhes do Frete
            {frete.processamento_ia_confidence && (
              <Badge variant="secondary" className="ml-2">
                <Brain className="h-3 w-3 mr-1" />
                IA: {frete.processamento_ia_confidence}%
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status e Ações */}
          <div className="flex items-center justify-between">
            <Badge variant={STATUS_COLORS[frete.status] as any} className="gap-2 px-3 py-1">
              <StatusIcon className="h-4 w-4" />
              {frete.status}
            </Badge>

            <div className="flex gap-2">
              {frete.pago && (
                <Badge variant="success">Pago</Badge>
              )}
              {onEdit && (
                <Button onClick={handleEdit} size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              )}
            </div>
          </div>

          {/* Dados do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Dados do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h3 className="font-medium text-lg">{frete.nome_cliente}</h3>
                {frete.cpf_cliente && (
                  <p className="text-sm text-muted-foreground">
                    CPF: {frete.cpf_cliente}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{formatPhoneNumber(frete.telefone)}</span>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                <span className="text-sm">{frete.endereco_entrega}</span>
              </div>
            </CardContent>
          </Card>

          {/* Dados Financeiros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5" />
                Dados Financeiros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Valor do Frete
                  </label>
                  <p className="text-xl font-semibold text-primary">
                    {formatCurrency(frete.valor_frete)}
                  </p>
                </div>

                {frete.valor_total_nota && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Valor Total da Nota Fiscal
                    </label>
                    <p className="text-lg font-medium">
                      {formatCurrency(frete.valor_total_nota)}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Status do Pagamento: {frete.pago ? 'Pago' : 'Pendente'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Itens da Nota Fiscal */}
          {frete.items && frete.items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="h-5 w-5" />
                  Itens da Nota Fiscal ({frete.items.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {frete.items.map((item, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.descricao}</h4>
                          {item.codigo && (
                            <p className="text-sm text-muted-foreground">
                              Código: {item.codigo}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className="ml-2">
                          Item {index + 1}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Quantidade:</span>
                          <p className="font-medium">{item.quantidade}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Valor Unit.:</span>
                          <p className="font-medium">{formatCurrency(item.valor_unitario)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Total:</span>
                          <p className="font-medium">{formatCurrency(item.valor_total_item)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Nota Fiscal */}
          {frete.nota_fiscal_url && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5" />
                  Nota Fiscal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <img
                    src={frete.nota_fiscal_url}
                    alt="Nota fiscal"
                    className="w-full max-w-md rounded-lg border"
                  />
                  <Button
                    variant="outline"
                    onClick={() => window.open(frete.nota_fiscal_url, '_blank')}
                    className="w-full md:w-auto"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Abrir em Nova Aba
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comprovante de Entrega */}
          {frete.comprovante_entrega_url && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle className="h-5 w-5" />
                  Comprovante de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <img
                    src={frete.comprovante_entrega_url}
                    alt="Comprovante de entrega"
                    className="w-full max-w-md rounded-lg border"
                  />
                  <Button
                    variant="outline"
                    onClick={() => window.open(frete.comprovante_entrega_url, '_blank')}
                    className="w-full md:w-auto"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Abrir em Nova Aba
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Informações do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5" />
                Informações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Criado em:</span>
                  <p className="font-medium">{formatDate(frete.created_at!)}</p>
                </div>

                {frete.updated_at && frete.updated_at !== frete.created_at && (
                  <div>
                    <span className="text-muted-foreground">Atualizado em:</span>
                    <p className="font-medium">{formatDate(frete.updated_at)}</p>
                  </div>
                )}

                <div>
                  <span className="text-muted-foreground">ID do Frete:</span>
                  <p className="font-mono text-xs">{frete.id}</p>
                </div>

                {frete.processamento_ia_confidence && (
                  <div>
                    <span className="text-muted-foreground">Confiança da IA:</span>
                    <p className="font-medium flex items-center gap-1">
                      <Brain className="h-3 w-3" />
                      {frete.processamento_ia_confidence}%
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}