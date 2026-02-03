import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sale } from "@/types/sales";
import { Eye, Calendar, DollarSign, User, FileText, Image } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { StandardDialogHeader, StandardDialogContent, StandardDialogFooter } from "@/components/ui/standard-dialog";
import { useIsMobile } from "@/hooks/use-mobile";

interface SaleDetailsDialogProps {
  sale: Sale | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SaleDetailsDialog({ sale, open, onOpenChange }: SaleDetailsDialogProps) {
  const isMobile = useIsMobile();

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
      <DialogContent
        className={`
          ${isMobile ? "w-[calc(100%-2rem)] max-w-full p-0" : "sm:max-w-2xl p-0"}
          overflow-hidden max-h-[85vh] flex flex-col
        `}
        hideCloseButton
      >
        <StandardDialogHeader
          icon={Eye}
          iconColor="primary"
          title="Detalhes da Venda"
          description="Informações completas da venda realizada"
          onClose={() => onOpenChange(false)}
        />

        <StandardDialogContent>
          <div className="space-y-6">
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
                <User className="h-5 w-5 text-primary" />
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
                <DollarSign className="h-5 w-5 text-primary" />
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
                  <FileText className="h-5 w-5 text-primary" />
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
                  <Image className="h-5 w-5 text-primary" />
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
        </StandardDialogContent>

        <StandardDialogFooter className="justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="px-6"
          >
            Fechar
          </Button>
        </StandardDialogFooter>
      </DialogContent>
    </Dialog>
  );
}
