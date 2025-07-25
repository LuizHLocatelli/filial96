import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { FileText, Package, Calendar, BarChart3 } from "lucide-react";

interface Produto {
  id: string;
  codigo_produto: string;
  setor: "masculino" | "feminino" | "infantil";
  quantidade: number;
  created_at: string;
}

interface Contagem {
  id: string;
  nome: string;
  status: "em_andamento" | "finalizada";
  created_at: string;
}

interface PDFExportEstoqueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contagem: Contagem;
  produtos: Produto[];
  onExport: (options: {
    includeDate: boolean;
    includeStats: boolean;
    groupBySetor: boolean;
    includeTotal: boolean;
  }) => void;
  isExporting: boolean;
}

export function PDFExportEstoqueDialog({
  open,
  onOpenChange,
  contagem,
  produtos,
  onExport,
  isExporting
}: PDFExportEstoqueDialogProps) {
  const [options, setOptions] = useState({
    includeDate: true,
    includeStats: true,
    groupBySetor: true,
    includeTotal: true
  });

  const handleExport = () => {
    onExport(options);
  };

  const updateOption = (key: keyof typeof options, value: boolean) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  // Calcular estatísticas para preview
  const totalProdutos = produtos.length;
  const totalUnidades = produtos.reduce((acc, p) => acc + p.quantidade, 0);
  const setores = Array.from(new Set(produtos.map(p => p.setor)));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <DialogTitle>Exportar Contagem para PDF</DialogTitle>
          </div>
          <DialogDescription>
            Configure as opções para exportar a contagem de estoque em PDF.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo dos dados */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Package className="h-4 w-4" />
              Resumo da Contagem
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-muted-foreground">Produtos</p>
                <p className="font-semibold">{totalProdutos}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-muted-foreground">Unidades</p>
                <p className="font-semibold">{totalUnidades}</p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <strong>Nome:</strong> {contagem.nome}
            </div>
            <div className="text-sm text-muted-foreground">
              <strong>Status:</strong> {contagem.status === "em_andamento" ? "Em Andamento" : "Finalizada"}
            </div>
          </div>

          <Separator />

          {/* Opções de conteúdo */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Opções de Conteúdo
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeDate"
                  checked={options.includeDate}
                  onCheckedChange={(checked) => updateOption("includeDate", checked as boolean)}
                />
                <label
                  htmlFor="includeDate"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Incluir data de geração
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeStats"
                  checked={options.includeStats}
                  onCheckedChange={(checked) => updateOption("includeStats", checked as boolean)}
                />
                <label
                  htmlFor="includeStats"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Incluir estatísticas gerais
                </label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Opções de organização */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Organização</h4>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="groupBySetor"
                  checked={options.groupBySetor}
                  onCheckedChange={(checked) => updateOption("groupBySetor", checked as boolean)}
                />
                <label
                  htmlFor="groupBySetor"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Agrupar por setor ({setores.length} setores)
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeTotal"
                  checked={options.includeTotal}
                  onCheckedChange={(checked) => updateOption("includeTotal", checked as boolean)}
                />
                <label
                  htmlFor="includeTotal"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Incluir totais no final
                </label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || totalProdutos === 0}
            className="gap-2"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Gerando...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Gerar PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}