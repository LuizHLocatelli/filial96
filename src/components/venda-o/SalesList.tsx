
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VendaO, VendaOProduct } from "@/types/vendaO";
import { SaleDetailsDialog } from "./SaleDetailsDialog";
import { DeleteSaleDialog } from "./DeleteSaleDialog";
import { 
  Eye, 
  Trash2, 
  Calendar, 
  User, 
  Building, 
  Package, 
  Phone,
  Truck,
  Clock,
  FileText
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { statusOptions } from "@/types/vendaO";

interface SalesListProps {
  sales: VendaO[];
  title: string;
  onStatusChange: (id: string, status: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export function SalesList({ sales, title, onStatusChange, onDelete }: SalesListProps) {
  const [selectedSale, setSelectedSale] = useState<VendaO | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isChanging, setIsChanging] = useState<{[key: string]: boolean}>({});

  const handleStatusChange = async (id: string, status: string) => {
    setIsChanging(prev => ({ ...prev, [id]: true }));
    try {
      await onStatusChange(id, status);
    } finally {
      setIsChanging(prev => ({ ...prev, [id]: false }));
    }
  };

  const confirmDelete = async () => {
    if (selectedSale) {
      await onDelete(selectedSale.id);
      setIsDeleteDialogOpen(false);
      setSelectedSale(null);
    }
  };

  const handleViewSale = (sale: VendaO) => {
    let parsedProdutos: VendaOProduct[];
    try {
      if (typeof sale.produtos === 'string') {
        parsedProdutos = JSON.parse(sale.produtos);
      } else if (Array.isArray(sale.produtos)) {
        parsedProdutos = sale.produtos;
      } else {
        console.warn("Formato de produtos inesperado ao visualizar detalhes:", sale.produtos);
        parsedProdutos = [];
      }
    } catch (error) {
      console.error("Erro ao parsear produtos para visualização:", error);
      parsedProdutos = [];
    }

    setSelectedSale({ ...sale, produtos: parsedProdutos });
    setIsViewDialogOpen(true);
  };
  
  const handleDeleteClick = (sale: VendaO) => {
    setSelectedSale(sale);
    setIsDeleteDialogOpen(true);
  };

  const handleViewCupom = (sale: VendaO) => {
    // Se há anexos, abrir o primeiro
    if (sale.attachments && sale.attachments.length > 0) {
      const attachment = sale.attachments[0];
      const fileType = attachment.file_type.toLowerCase();
      
      if (fileType === 'application/pdf') {
        // Abrir PDF no PDFViewer
        const url = `/pdf-viewer?url=${encodeURIComponent(attachment.file_url)}&name=${encodeURIComponent(attachment.file_name)}`;
        window.open(url, '_blank');
      } else {
        // Para imagens, abrir os detalhes da venda que mostrará a imagem inline
        handleViewSale(sale);
      }
    }
  };

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

  const getDeliveryIcon = (tipo: string) => {
    return tipo === 'frete' ? <Truck className="h-4 w-4" /> : <Package className="h-4 w-4" />;
  };

  if (sales.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-full w-fit mx-auto">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Nenhuma venda encontrada</h3>
              <p className="text-muted-foreground">
                Não há vendas para exibir com os filtros atuais.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            {sales.length} venda(s)
          </Badge>
        </div>

        <div className="grid gap-4">
          {sales.map((sale) => (
            <Card key={sale.id} className="hover:shadow-lg transition-all duration-200 border-border/50">
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4">
                  {/* Header do card */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">Filial</span>
                        <Badge variant="secondary">{sale.filial}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {format(parseISO(sale.data_venda), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(sale.status)}
                  </div>

                  {/* Informações do cliente */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-base">{sale.nome_cliente}</span>
                    </div>
                    {sale.telefone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-muted-foreground">{sale.telefone}</span>
                      </div>
                    )}
                  </div>

                  {/* Produtos */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">
                        {Array.isArray(sale.produtos) ? sale.produtos.length : 'N/A'} produto(s)
                      </span>
                    </div>
                    {Array.isArray(sale.produtos) && sale.produtos.length > 0 && (
                      <div className="pl-6">
                        <p className="text-sm text-muted-foreground truncate">
                          {sale.produtos.map(p => p.nome).join(", ")}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Entrega */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getDeliveryIcon(sale.tipo_entrega)}
                      <span className="text-sm capitalize">
                        {sale.tipo_entrega === 'frete' ? 'Frete' : 'Retirada'}
                      </span>
                    </div>
                    {sale.previsao_chegada && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-orange-600" />
                        <span className="text-sm text-muted-foreground">
                          Previsão: {format(parseISO(sale.previsao_chegada), "dd/MM/yyyy")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Observações */}
                  {sale.observacoes && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <strong>Obs:</strong> {sale.observacoes}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-border/50">
                    <div className="flex-1">
                      <Select
                        value={sale.status}
                        onValueChange={(value) => handleStatusChange(sale.id, value)}
                        disabled={isChanging[sale.id] || false}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex gap-2">
                      {/* Botão Ver Cupom - só aparece se há anexos */}
                      {sale.attachments && sale.attachments.length > 0 && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewCupom(sale)}
                          className="flex-1 sm:flex-none gap-2"
                        >
                          <FileText className="h-4 w-4" />
                          <span className="sm:hidden">Ver Cupom</span>
                          <span className="hidden sm:inline">Cupom</span>
                        </Button>
                      )}
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewSale(sale)}
                        className="flex-1 sm:flex-none gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sm:hidden">Ver Detalhes</span>
                        <span className="hidden sm:inline">Detalhes</span>
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteClick(sale)}
                        className="flex-1 sm:flex-none gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sm:hidden">Excluir</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <DeleteSaleDialog 
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirmDelete={confirmDelete}
      />

      <SaleDetailsDialog 
        isOpen={isViewDialogOpen} 
        onOpenChange={setIsViewDialogOpen} 
        sale={selectedSale} 
      />
    </>
  );
}
