import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Frete, FreteItem } from "@/types/frete";
import { CheckCircle, XCircle, Package, User, Phone, MapPin, DollarSign, FileText, Edit, Trash2, Truck } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useMobileDialog } from "@/hooks/useMobileDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface FreteDetalhesProps {
  frete: Frete | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFreteUpdated?: () => void;
  onEditFrete?: (frete: Frete) => void;
}

export function FreteDetalhes({ frete, open, onOpenChange, onFreteUpdated, onEditFrete }: FreteDetalhesProps) {
  const { getMobileDialogProps } = useMobileDialog();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!frete) return null;

  const handleDeleteFrete = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('fretes')
        .delete()
        .eq('id', frete.id);

      if (error) {
        console.error('Error deleting frete:', error);
        toast({
          title: "Erro",
          description: "Erro ao excluir frete",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Frete excluído com sucesso!",
      });

      onOpenChange(false);
      onFreteUpdated?.();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao excluir frete",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const handleStatusChange = async () => {
    setLoading(true);
    try {
      const newStatus = frete.status === 'Pendente de Entrega' ? 'Entregue' : 'Pendente de Entrega';
      
      const { error } = await supabase
        .from('fretes')
        .update({ status: newStatus })
        .eq('id', frete.id);

      if (error) {
        console.error('Error updating status:', error);
        toast({
          title: "Erro",
          description: "Erro ao atualizar status",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: `Status alterado para: ${newStatus}`,
      });

      onFreteUpdated?.();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditFrete = () => {
    onEditFrete?.(frete);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent {...getMobileDialogProps("large")}>
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Detalhes do Frete
              </DialogTitle>
              <Badge variant={frete.status === 'Entregue' ? 'default' : 'secondary'}>
                {frete.status}
              </Badge>
            </div>
            
            {/* Botões de Ação */}
            <div className="flex gap-2 mt-4">
              <Button 
                onClick={handleStatusChange}
                disabled={loading}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Truck className="h-4 w-4" />
                {frete.status === 'Pendente de Entrega' ? 'Marcar como Entregue' : 'Marcar como Pendente'}
              </Button>
              
              <Button 
                onClick={handleEditFrete}
                disabled={loading}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar
              </Button>
              
              <Button 
                onClick={() => setShowDeleteDialog(true)}
                disabled={loading}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </Button>
            </div>
          </DialogHeader>

        <div className="space-y-6">
          {/* Cliente */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Dados do Cliente
            </h3>
            <div className="grid gap-2 pl-6">
              <div>
                <span className="text-sm text-muted-foreground">Nome:</span>
                <p className="font-medium">{frete.nome_cliente}</p>
              </div>
              {frete.cpf_cliente && (
                <div>
                  <span className="text-sm text-muted-foreground">CPF:</span>
                  <p className="font-medium">{frete.cpf_cliente}</p>
                </div>
              )}
              <div>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  Telefone:
                </span>
                <p className="font-medium">{frete.telefone}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Endereço de Entrega:
                </span>
                <p className="font-medium">{frete.endereco_entrega}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Valores */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Informações Financeiras
            </h3>
            <div className="grid gap-2 pl-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor da Nota Fiscal:</span>
                <span className="font-medium">
                  {frete.valor_total_nota 
                    ? `R$ ${frete.valor_total_nota.toFixed(2)}`
                    : "N/A"
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor do Frete:</span>
                <span className="font-medium">R$ {frete.valor_frete.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Pagamento:</span>
                <div className="flex items-center gap-1">
                  {frete.pago ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className={frete.pago ? 'text-green-600' : 'text-red-600'}>
                    {frete.pago ? 'Pago' : 'Pendente'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Itens da Nota Fiscal */}
          {frete.itens && (
            (() => {
              let itensArray;
              try {
                itensArray = Array.isArray(frete.itens) ? frete.itens : JSON.parse(frete.itens || '[]');
              } catch {
                itensArray = [];
              }
              
              return itensArray.length > 0 ? (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Itens da Nota Fiscal
                    </h3>
                    <div className="space-y-2 pl-6">
                      {itensArray.map((item: FreteItem, index: number) => (
                        <div key={index} className="p-3 bg-muted rounded-lg space-y-1">
                          <p className="font-medium">{item.descricao}</p>
                          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <div>Código: {item.codigo}</div>
                            <div>Quantidade: {item.quantidade}</div>
                            <div>Valor Unitário: R$ {item.valor_unitario}</div>
                            <div>Valor Total: R$ {item.valor_total_item}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : null;
            })()
          )}

          {/* Nota Fiscal */}
          {frete.nota_fiscal_url && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold">Nota Fiscal</h3>
                <img
                  src={frete.nota_fiscal_url}
                  alt="Nota Fiscal"
                  className="w-full rounded-lg border"
                />
              </div>
            </>
          )}

          <Separator />

          {/* Informações do Sistema */}
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Criado em:</span>
              <span>{formatDate(frete.created_at, "dd/MM/yyyy 'às' HH:mm")}</span>
            </div>
            <div className="flex justify-between">
              <span>Atualizado em:</span>
              <span>{formatDate(frete.updated_at, "dd/MM/yyyy 'às' HH:mm")}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Diálogo de Confirmação de Exclusão */}
    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza de que deseja excluir este frete?
            <br />
            <strong>Cliente:</strong> {frete.nome_cliente}
            <br />
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDeleteFrete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? 'Excluindo...' : 'Excluir'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}