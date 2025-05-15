
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Eye, Calendar, Phone, Truck, Package } from "lucide-react";
import { VendaO, statusOptions } from "@/types/vendaO";

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

  const handleDelete = async () => {
    if (selectedSale) {
      await onDelete(selectedSale.id);
      setIsDeleteDialogOpen(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'aguardando_produto':
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Aguardando Produto</Badge>;
      case 'aguardando_cliente':
        return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">Aguardando Cliente</Badge>;
      case 'pendente':
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Pendente</Badge>;
      case 'concluida':
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Concluída</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (sales.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Nenhuma venda encontrada.
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Table>
        <TableCaption>{title} - Total: {sales.length}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead className="hidden md:table-cell">Cliente</TableHead>
            <TableHead className="hidden md:table-cell">Filial</TableHead>
            <TableHead className="hidden lg:table-cell">Produtos</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell className="font-medium">
                {format(parseISO(sale.data_venda), "dd/MM/yyyy")}
              </TableCell>
              <TableCell className="hidden md:table-cell">{sale.nome_cliente}</TableCell>
              <TableCell className="hidden md:table-cell">{sale.filial}</TableCell>
              <TableCell className="hidden lg:table-cell">
                {sale.produtos.length} item(ns)
              </TableCell>
              <TableCell>
                <Select
                  value={sale.status}
                  onValueChange={(value) => handleStatusChange(sale.id, value)}
                  disabled={isChanging[sale.id]}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue>{getStatusBadge(sale.status)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => {
                      setSelectedSale(sale);
                      setIsViewDialogOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="icon"
                    onClick={() => {
                      setSelectedSale(sale);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta venda? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        {selectedSale && (
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Detalhes da Venda</DialogTitle>
              <DialogDescription>
                Venda realizada na filial {selectedSale.filial}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div className="col-span-3">
                  <p className="text-sm font-medium">Data da Venda</p>
                  <p className="text-sm text-muted-foreground">
                    {format(parseISO(selectedSale.data_venda), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div className="col-span-3">
                  <p className="text-sm font-medium">Cliente</p>
                  <p className="text-sm text-muted-foreground">{selectedSale.nome_cliente}</p>
                  {selectedSale.telefone && (
                    <p className="text-sm text-muted-foreground">{selectedSale.telefone}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Package className="h-5 w-5 text-muted-foreground" />
                <div className="col-span-3">
                  <p className="text-sm font-medium">Produtos</p>
                  <div className="text-sm text-muted-foreground">
                    {selectedSale.produtos.map((product, index) => (
                      <div key={index} className="py-1">
                        <p>{product.nome} <span className="text-xs font-mono bg-slate-100 px-1 rounded">#{product.codigo}</span></p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Truck className="h-5 w-5 text-muted-foreground" />
                <div className="col-span-3">
                  <p className="text-sm font-medium">Entrega</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {selectedSale.tipo_entrega === 'frete' ? 'Frete' : 'Retirada'}
                  </p>
                  {selectedSale.previsao_chegada && (
                    <p className="text-sm text-muted-foreground">
                      Previsão: {format(parseISO(selectedSale.previsao_chegada), "dd/MM/yyyy")}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="col-span-4">
                  <p className="text-sm font-medium mb-2">Cupom Fiscal</p>
                  {selectedSale.attachments && selectedSale.attachments.length > 0 ? (
                    <div className="space-y-2">
                      {selectedSale.attachments.map(attachment => (
                        <Button
                          key={attachment.id}
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => window.open(attachment.file_url, '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Cupom
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhum anexo disponível</p>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
