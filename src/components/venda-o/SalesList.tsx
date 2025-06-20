
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VendaO, VendaOProduct } from "@/types/vendaO";
import { Sale } from "@/types/sales";
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
  ShoppingCart
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { statusOptions } from "@/types/vendaO";

interface SalesListProps {
  sales: VendaO[];
  title: string;
  onStatusChange: (id: string, status: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export function SalesList({ sales = [], title, onStatusChange, onDelete }: SalesListProps) {
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
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

    // Convert VendaO to Sale format for the dialog
    const saleForDialog: Sale = {
      id: sale.id,
      cliente_nome: sale.nome_cliente,
      valor: 0, // VendaO doesn't have valor field, setting to 0
      data_venda: sale.data_venda,
      observacoes: sale.observacoes,
      created_at: sale.created_at,
      created_by: sale.created_by,
      status: sale.status,
      cliente_telefone: sale.telefone,
    };

    setSelectedSale(saleForDialog);
    setIsViewDialogOpen(true);
  };
  
  const handleDeleteClick = (sale: VendaO) => {
    const saleForDialog: Sale = {
      id: sale.id,
      cliente_nome: sale.nome_cliente,
      valor: 0,
      data_venda: sale.data_venda,
      observacoes: sale.observacoes,
      created_at: sale.created_at,
      created_by: sale.created_by,
      status: sale.status,
      cliente_telefone: sale.telefone,
    };
    setSelectedSale(saleForDialog);
    setIsDeleteDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Finalizada':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Finalizada</Badge>;
      case 'Aguardando Produto':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Aguardando Produto</Badge>;
      case 'Cancelada':
        return <Badge variant="destructive">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDeliveryIcon = (tipo: string) => {
    return tipo === 'frete' ? <Truck className="h-4 w-4 text-green-600" /> : <Package className="h-4 w-4 text-green-600" />;
  };

  // Verificação de segurança para garantir que sales seja um array
  if (!Array.isArray(sales) || sales.length === 0) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="text-center py-12">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center mx-auto">
              <Package className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Nenhuma venda encontrada</h3>
              <p className="text-muted-foreground text-sm">
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
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header Padronizado */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {title}
            </h3>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {sales.length} venda(s)
          </Badge>
        </div>

        <div className="space-y-4">
          {sales.map((sale) => (
            <Card key={sale.id} className="hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header do card */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
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
                      <User className="h-4 w-4 text-green-600" />
                      <span className="font-semibold">{sale.nome_cliente}</span>
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
                      <Package className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">
                        {Array.isArray(sale.produtos) ? sale.produtos.length : 'N/A'} produto(s)
                      </span>
                    </div>
                    {Array.isArray(sale.produtos) && sale.produtos.length > 0 && (
                      <div className="ml-6">
                        <p className="text-sm text-muted-foreground truncate">
                          {sale.produtos.map(p => p?.nome || 'Produto sem nome').join(", ")}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Entrega */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      {getDeliveryIcon(sale.tipo_entrega)}
                      <span className="text-sm capitalize">
                        {sale.tipo_entrega === 'frete' ? 'Frete' : 'Retirada'}
                      </span>
                    </div>
                    {sale.previsao_chegada && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-green-600" />
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
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                    <div className="flex-1">
                      <Select
                        value={sale.status}
                        onValueChange={(value) => handleStatusChange(sale.id, value)}
                        disabled={isChanging[sale.id] || false}
                      >
                        <SelectTrigger>
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
                    
                    <div className="flex gap-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewSale(sale)}
                        className="flex items-center gap-2 px-4"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="hidden sm:inline">Detalhes</span>
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteClick(sale)}
                        className="flex items-center gap-2 px-4"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Excluir</span>
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
        open={isViewDialogOpen} 
        onOpenChange={setIsViewDialogOpen} 
        sale={selectedSale} 
      />
    </>
  );
}
