import { useState } from "react";
import { FileText, Search, Trash2, Eye, Calendar, User, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useOrcamentos, Orcamento } from "./hooks/useOrcamentos";
import { formatBrazilianCurrency } from "@/utils/numberFormatter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { StandardDialogHeader, StandardDialogFooter } from "@/components/ui/standard-dialog";
import { DialogScrollableContainer } from "@/components/ui/dialog-scrollable-container";
import { generateOrcamentoPdf } from "./utils/pdfGenerator";
import { OrcamentoData } from "./types";
import { toast } from "sonner";
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

export function ListaOrcamentos() {
  const { orcamentos, isLoading, deleteOrcamento } = useOrcamentos();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrcamento, setSelectedOrcamento] = useState<Orcamento | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredOrcamentos = orcamentos.filter(orcamento =>
    orcamento.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    orcamento.cliente_documento?.includes(searchTerm) ||
    orcamento.consultor?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async () => {
    if (deleteId) {
      await deleteOrcamento(deleteId);
      setDeleteId(null);
    }
  };

  const handleDownloadPdf = (orcamento: Orcamento) => {
    try {
      const data: OrcamentoData = {
        cliente: {
          nome: orcamento.cliente_nome,
          documento: orcamento.cliente_documento || '',
          telefone: orcamento.cliente_telefone || '',
          email: orcamento.cliente_email || '',
          endereco: orcamento.cliente_endereco || ''
        },
        itens: orcamento.itens,
        validade: orcamento.validade,
        observacoes: orcamento.observacoes || '',
        consultor: orcamento.consultor || '',
        valorTotal: orcamento.valor_total,
        dataCriacao: orcamento.created_at ? new Date(orcamento.created_at) : new Date()
      };
      
      generateOrcamentoPdf(data);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro", { description: "Não foi possível gerar o PDF." });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Orçamentos Salvos
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Consulte e gerencie os orçamentos criados anteriormente.
          </p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente, CPF ou consultor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {filteredOrcamentos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <FileText className="h-12 w-12 opacity-20 mb-4" />
            <p className="text-lg font-medium">Nenhum orçamento encontrado</p>
            <p className="text-sm mt-1">
              {searchTerm ? "Tente buscar com outros termos" : "Crie um orçamento para vê-lo aqui"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrcamentos.map((orcamento) => (
            <Card key={orcamento.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-3 bg-muted/20">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">
                      {orcamento.cliente_nome || "Cliente não informado"}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      {orcamento.cliente_documento || "CPF/CNPJ não informado"}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {orcamento.itens.length} {orcamento.itens.length === 1 ? 'item' : 'itens'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">
                    {formatBrazilianCurrency(orcamento.valor_total)}
                  </span>
                </div>
                
                <Separator />
                
                <div className="space-y-2 text-sm">
                  {orcamento.consultor && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span className="truncate">{orcamento.consultor}</span>
                    </div>
                  )}
                  {orcamento.created_at && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(orcamento.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={() => setSelectedOrcamento(orcamento)}
                  >
                    <Eye className="h-4 w-4" />
                    Ver
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => handleDownloadPdf(orcamento)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(orcamento.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Orçamento</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir este orçamento? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedOrcamento} onOpenChange={() => setSelectedOrcamento(null)}>
        <DialogContent className="max-w-2xl max-h-[85dvh] sm:max-h-[85vh] overflow-hidden flex flex-col p-0" hideCloseButton>
          <StandardDialogHeader 
            icon={FileText}
            title="Detalhes do Orçamento"
            onClose={() => setSelectedOrcamento(null)}
          />
          
          <DialogScrollableContainer>
            {selectedOrcamento && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">Cliente</h4>
                    <p className="font-medium">{selectedOrcamento.cliente_nome || "Não informado"}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">CPF/CNPJ</h4>
                    <p>{selectedOrcamento.cliente_documento || "Não informado"}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">Telefone</h4>
                    <p>{selectedOrcamento.cliente_telefone || "Não informado"}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">E-mail</h4>
                    <p>{selectedOrcamento.cliente_email || "Não informado"}</p>
                  </div>
                </div>

                {selectedOrcamento.cliente_endereco && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">Endereço</h4>
                    <p>{selectedOrcamento.cliente_endereco}</p>
                  </div>
                )}

                <Separator />

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-3">Itens do Orçamento</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-3 font-medium">Produto</th>
                          <th className="text-center p-3 font-medium">Qtd</th>
                          <th className="text-right p-3 font-medium">Valor Unit.</th>
                          <th className="text-right p-3 font-medium">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {selectedOrcamento.itens.map((item, index) => (
                          <tr key={item.id || index}>
                            <td className="p-3">{item.nome}</td>
                            <td className="p-3 text-center">{item.quantidade}</td>
                            <td className="p-3 text-right">{formatBrazilianCurrency(item.valorUnitario)}</td>
                            <td className="p-3 text-right font-medium">{formatBrazilianCurrency(item.valorTotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-muted/30">
                        <tr>
                          <td colSpan={3} className="p-3 text-right font-semibold">Total:</td>
                          <td className="p-3 text-right font-bold text-primary">
                            {formatBrazilianCurrency(selectedOrcamento.valor_total)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">Validade</h4>
                    <p>{selectedOrcamento.validade}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">Consultor</h4>
                    <p>{selectedOrcamento.consultor || "Não informado"}</p>
                  </div>
                </div>

                {selectedOrcamento.observacoes && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">Observações</h4>
                    <p className="text-sm bg-muted/30 p-3 rounded-lg">{selectedOrcamento.observacoes}</p>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  Criado em: {selectedOrcamento.created_at && 
                    format(new Date(selectedOrcamento.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </div>
              </div>
            )}
          </DialogScrollableContainer>

          <StandardDialogFooter>
            <Button 
              variant="outline"
              onClick={() => selectedOrcamento && handleDownloadPdf(selectedOrcamento)}
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar PDF
            </Button>
            <Button onClick={() => setSelectedOrcamento(null)}>
              Fechar
            </Button>
          </StandardDialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
