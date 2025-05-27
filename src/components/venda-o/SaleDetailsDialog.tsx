
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
  MapPin, 
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
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Aguardando Produto</Badge>;
      case 'aguardando_cliente':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Aguardando Cliente</Badge>;
      case 'pendente':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Pendente</Badge>;
      case 'concluida':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Concluída</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDeliveryBadge = (tipo: string) => {
    return tipo === 'frete' 
      ? <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Frete</Badge>
      : <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Retirada</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-xl sm:text-2xl font-bold">
                Detalhes da Venda
              </DialogTitle>
              <DialogDescription className="text-base">
                Venda realizada na filial {sale.filial}
              </DialogDescription>
            </div>
            {getStatusBadge(sale.status)}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Principais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Building className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Filial</p>
                    <p className="text-lg font-semibold">{sale.filial}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Data da Venda</p>
                    <p className="text-lg font-semibold">
                      {format(parseISO(sale.data_venda), "dd/MM/yyyy")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Informações do Cliente */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Informações do Cliente</h3>
            </div>
            
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nome</p>
                    <p className="text-base font-medium">{sale.nome_cliente}</p>
                  </div>
                  {sale.telefone && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-green-600" />
                        <p className="text-base font-medium">{sale.telefone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Produtos */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Produtos</h3>
              <Badge variant="secondary">{produtos.length} item(ns)</Badge>
            </div>
            
            <div className="space-y-3">
              {produtos.length > 0 ? (
                produtos.map((product: VendaOProduct, index: number) => (
                  <Card key={index} className="border border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-medium text-base">{product.nome}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Hash className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm font-mono bg-muted px-2 py-1 rounded text-muted-foreground">
                              {product.codigo}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhum produto encontrado</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <Separator />

          {/* Entrega */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Informações de Entrega</h3>
            </div>
            
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tipo de Entrega</p>
                    <div className="mt-1">
                      {getDeliveryBadge(sale.tipo_entrega)}
                    </div>
                  </div>
                  {sale.previsao_chegada && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Previsão de Chegada</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-4 w-4 text-orange-600" />
                        <p className="text-base font-medium">
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
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Observações</h3>
                </div>
                
                <Card>
                  <CardContent className="p-4">
                    <p className="text-base leading-relaxed">{sale.observacoes}</p>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          <Separator />

          {/* Cupom Fiscal */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Cupom Fiscal</h3>
            </div>
            
            {sale.attachments && sale.attachments.length > 0 ? (
              <div className="space-y-3">
                {sale.attachments.map(attachment => (
                  <Card key={attachment.id} className="border border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <FileText className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">{attachment.file_name}</p>
                            {attachment.file_size && (
                              <p className="text-sm text-muted-foreground">
                                {(attachment.file_size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={() => window.open(attachment.file_url, '_blank')}
                          size="sm"
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Ver Cupom
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum cupom fiscal anexado</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Informações do Sistema */}
          <Separator />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <p>Criado em: {format(parseISO(sale.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
            </div>
            <div>
              <p>ID: <span className="font-mono text-xs">{sale.id}</span></p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
