import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  Phone, 
  Truck, 
  Package, 
  Eye, 
  FileText, 
  Clock,
  Building,
  User,
  Hash
} from "lucide-react";
import { VendaO, VendaOProduct } from "@/types/vendaO";

interface SaleDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  sale: VendaO | null;
}

export function SaleDetailsDialog({ isOpen, onOpenChange, sale }: SaleDetailsDialogProps) {
  if (!sale) return null;

  const produtos = Array.isArray(sale.produtos) ? sale.produtos : [];

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'aguardando_produto':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs sm:text-sm">Aguardando Produto</Badge>;
      case 'aguardando_cliente':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs sm:text-sm">Aguardando Cliente</Badge>;
      case 'pendente':
        return <Badge className="bg-red-100 text-red-800 border-red-200 text-xs sm:text-sm">Pendente</Badge>;
      case 'concluida':
        return <Badge className="bg-green-100 text-green-800 border-green-200 text-xs sm:text-sm">Concluída</Badge>;
      default:
        return <Badge variant="outline" className="text-xs sm:text-sm">{status}</Badge>;
    }
  };

  const getDeliveryBadge = (tipo: string) => {
    return tipo === 'frete' 
      ? <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs sm:text-sm">Frete</Badge>
      : <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs sm:text-sm">Retirada</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-3xl h-[95vh] max-h-[95vh] flex flex-col p-0">
        <DialogHeader className="px-3 sm:px-6 py-3 sm:py-4 border-b bg-background space-y-2 sm:space-y-3 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
            <div className="space-y-1 sm:space-y-2 flex-1 min-w-0">
              <DialogTitle className="text-base sm:text-xl font-bold leading-tight">
                Detalhes da Venda
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-base text-muted-foreground">
                Venda realizada na filial {sale.filial}
              </DialogDescription>
            </div>
            <div className="flex-shrink-0 self-start">
              {getStatusBadge(sale.status)}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="px-3 sm:px-6 py-3 sm:py-4">
            <div className="space-y-3 sm:space-y-6">
              {/* Informações Principais */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
                        <Building className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">Filial</p>
                        <p className="text-sm sm:text-lg font-semibold truncate">{sale.filial}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                        <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">Data da Venda</p>
                        <p className="text-sm sm:text-lg font-semibold">
                          {format(parseISO(sale.data_venda), "dd/MM/yyyy")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Separator className="my-3 sm:my-4" />

              {/* Informações do Cliente */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <h3 className="text-sm sm:text-lg font-semibold">Informações do Cliente</h3>
                </div>
                
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">Nome</p>
                        <p className="text-sm sm:text-base font-medium truncate">{sale.nome_cliente}</p>
                      </div>
                      {sale.telefone && (
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-muted-foreground">Telefone</p>
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
                            <p className="text-sm sm:text-base font-medium truncate">{sale.telefone}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Separator className="my-3 sm:my-4" />

              {/* Produtos */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <h3 className="text-sm sm:text-lg font-semibold">Produtos</h3>
                  <Badge variant="secondary" className="text-xs">{produtos.length} item(ns)</Badge>
                </div>
                
                <div className="space-y-2 sm:space-y-3">
                  {produtos.length > 0 ? (
                    produtos.map((product: VendaOProduct, index: number) => (
                      <Card key={index} className="border border-border/50">
                        <CardContent className="p-3 sm:p-4">
                          <div className="space-y-2">
                            <p className="font-medium text-sm sm:text-base break-words">{product.nome}</p>
                            <div className="flex items-center gap-2">
                              <Hash className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                              <span className="text-xs sm:text-sm font-mono bg-muted px-2 py-1 rounded text-muted-foreground break-all">
                                {product.codigo}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="p-4 sm:p-6 text-center text-muted-foreground">
                        <Package className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm sm:text-base">Nenhum produto encontrado</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              <Separator className="my-3 sm:my-4" />

              {/* Entrega */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <h3 className="text-sm sm:text-lg font-semibold">Informações de Entrega</h3>
                </div>
                
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Tipo de Entrega</p>
                        <div>
                          {getDeliveryBadge(sale.tipo_entrega)}
                        </div>
                      </div>
                      {sale.previsao_chegada && (
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Previsão de Chegada</p>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600 flex-shrink-0" />
                            <p className="text-sm sm:text-base font-medium">
                              {format(parseISO(sale.previsao_chegada), "dd/MM/yyyy")}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Observações */}
              {sale.observacoes && (
                <>
                  <Separator className="my-3 sm:my-4" />
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      <h3 className="text-sm sm:text-lg font-semibold">Observações</h3>
                    </div>
                    
                    <Card>
                      <CardContent className="p-3 sm:p-4">
                        <p className="text-sm sm:text-base leading-relaxed break-words">{sale.observacoes}</p>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}

              <Separator className="my-3 sm:my-4" />

              {/* Cupom Fiscal */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <h3 className="text-sm sm:text-lg font-semibold">Cupom Fiscal</h3>
                </div>
                
                {sale.attachments && sale.attachments.length > 0 ? (
                  <div className="space-y-2 sm:space-y-3">
                    {sale.attachments.map(attachment => (
                      <Card key={attachment.id} className="border border-border/50">
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg flex-shrink-0">
                              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm sm:text-base truncate">{attachment.file_name}</p>
                              {attachment.file_size && (
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                  {(attachment.file_size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              )}
                            </div>
                            <Button
                              onClick={() => window.open(attachment.file_url, '_blank')}
                              size="sm"
                              className="gap-1 sm:gap-2 flex-shrink-0 h-8 sm:h-9 text-xs sm:text-sm"
                            >
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="hidden xs:inline">Ver</span>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-4 sm:p-6 text-center text-muted-foreground">
                      <FileText className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm sm:text-base">Nenhum cupom fiscal anexado</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Informações do Sistema */}
              <Separator className="my-3 sm:my-4" />
              <div className="grid grid-cols-1 gap-2 text-xs sm:text-sm text-muted-foreground mb-4">
                <p>Criado em: {format(parseISO(sale.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                <p>ID: <span className="font-mono text-xs break-all">{sale.id}</span></p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
