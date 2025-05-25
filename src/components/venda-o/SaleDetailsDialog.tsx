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
import { Calendar, Phone, Truck, Package, Eye } from "lucide-react";
import { VendaO, VendaOProduct } from "@/types/vendaO";

interface SaleDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  sale: VendaO | null; // produtos já devem estar parseados
}

export function SaleDetailsDialog({ isOpen, onOpenChange, sale }: SaleDetailsDialogProps) {
  if (!sale) return null;

  // Assegura que produtos é um array, mesmo que venha null/undefined do selectedSale parseado
  const produtos = Array.isArray(sale.produtos) ? sale.produtos : [];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Detalhes da Venda</DialogTitle>
          <DialogDescription>
            Venda realizada na filial {sale.filial}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div className="col-span-3">
              <p className="text-sm font-medium">Data da Venda</p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {format(parseISO(sale.data_venda), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <div className="col-span-3">
              <p className="text-sm font-medium">Cliente</p>
              <p className="text-xs sm:text-sm text-muted-foreground">{sale.nome_cliente}</p>
              {sale.telefone && (
                <p className="text-xs sm:text-sm text-muted-foreground">{sale.telefone}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Package className="h-5 w-5 text-muted-foreground" />
            <div className="col-span-3">
              <p className="text-sm font-medium">Produtos</p>
              <div className="text-xs sm:text-sm text-muted-foreground">
                {produtos.length > 0 ? (
                  produtos.map((product: VendaOProduct, index: number) => (
                    <div key={index} className="py-1">
                      <p>{product.nome} <span className="text-xs font-mono bg-slate-100 px-1 rounded">#{product.codigo}</span></p>
                    </div>
                  ))
                ) : (
                  <p>Nenhum produto encontrado ou erro ao carregar.</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Truck className="h-5 w-5 text-muted-foreground" />
            <div className="col-span-3">
              <p className="text-sm font-medium">Entrega</p>
              <p className="text-xs sm:text-sm text-muted-foreground capitalize">
                {sale.tipo_entrega === 'frete' ? 'Frete' : 'Retirada'}
              </p>
              {sale.previsao_chegada && (
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Previsão: {format(parseISO(sale.previsao_chegada), "dd/MM/yyyy")}
                </p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-span-4">
              <p className="text-sm font-medium mb-2">Cupom Fiscal</p>
              {sale.attachments && sale.attachments.length > 0 ? (
                <div className="space-y-2">
                  {sale.attachments.map(attachment => (
                    <Button
                      key={attachment.id}
                      variant="outline"
                      className="w-full justify-start text-xs sm:text-sm"
                      onClick={() => window.open(attachment.file_url, '_blank')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Cupom
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-muted-foreground">Nenhum anexo disponível</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 