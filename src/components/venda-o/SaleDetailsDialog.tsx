import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sale } from "@/types/sales";
import { Eye, Calendar, DollarSign, User, FileText, Image } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useMobileDialog } from "@/hooks/useMobileDialog";

interface SaleDetailsDialogProps {
  sale: Sale | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SaleDetailsDialog({ sale, open, onOpenChange }: SaleDetailsDialogProps) {
  const { getMobileDialogProps, getMobileFooterProps } = useMobileDialog();

  if (!sale) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300';
      case 'aprovada':
        return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300';
      case 'cancelada':
        return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent {...getMobileDialogProps("default")}>
        {/* Fixed Header */}
        <div className="flex-shrink-0 p-3 md:p-5 lg:p-6 pb-0">
          <DialogHeader className="pr-8">
            <DialogTitle className="text-base md:text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center">
                <Eye className="h-4 w-4 md:h-5 md:w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                Detalhes da Venda
              </div>
            </DialogTitle>
            <DialogDescription className="text-xs md:text-sm text-muted-foreground">
              Informações completas da venda realizada
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 md:p-5 lg:p-6 pt-3">
          <div className="space-y-4 md:space-y-6">
          {/* Status e Data */}
          <div className="flex items-center justify-between">
            <Badge className={getStatusColor(sale.status)}>
              {sale.status.toUpperCase()}
            </Badge>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(sale.data_venda), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
            </div>
          </div>

          {/* Informações do Cliente */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <User className="h-5 w-5 text-green-600" />
              Cliente
            </h3>
            <div className="p-4 bg-muted/30 rounded-lg space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium">Nome:</span>
                  <p className="text-sm">{sale.cliente_nome}</p>
                </div>
                {sale.cliente_telefone && (
                  <div>
                    <span className="text-sm font-medium">Telefone:</span>
                    <p className="text-sm">{sale.cliente_telefone}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Valor da Venda */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Valor
            </h3>
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(sale.valor)}
              </p>
            </div>
          </div>

          {/* Observações */}
          {sale.observacoes && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                Observações
              </h3>
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{sale.observacoes}</p>
              </div>
            </div>
          )}

          {/* Arquivos Anexos */}
          {sale.arquivos && sale.arquivos.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Image className="h-5 w-5 text-green-600" />
                Arquivos ({sale.arquivos.length})
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {sale.arquivos.map((arquivo, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 text-sm">{arquivo.nome}</span>
                    <Button size="sm" variant="outline" asChild>
                      <a href={arquivo.url} download target="_blank" rel="noopener noreferrer">
                        Visualizar
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          </div>
        </div>

        {/* Fixed Footer */}
        <div {...getMobileFooterProps()}>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="px-6"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
