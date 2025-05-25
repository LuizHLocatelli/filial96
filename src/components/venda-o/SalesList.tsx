import { useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VendaO, statusOptions, VendaOProduct } from "@/types/vendaO";
import { SaleRow } from "./SaleRow";
import { SaleDetailsDialog } from "./SaleDetailsDialog";
import { DeleteSaleDialog } from "./DeleteSaleDialog";

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
  }

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
      <div className="overflow-x-auto -mx-2 sm:mx-0">
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
              <SaleRow 
                key={sale.id}
                sale={sale} 
                isChangingStatus={isChanging[sale.id] || false}
                onStatusChange={handleStatusChange}
                onViewDetails={handleViewSale}
                onDeleteClick={handleDeleteClick}
                getStatusBadge={getStatusBadge}
              />
            ))}
          </TableBody>
        </Table>
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
