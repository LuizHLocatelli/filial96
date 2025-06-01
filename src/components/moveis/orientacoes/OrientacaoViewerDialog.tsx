import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Orientacao } from "./types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PDFViewer } from "@/components/ui/pdf-viewer";

interface OrientacaoViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orientacao: Orientacao;
}

export function OrientacaoViewerDialog({
  open,
  onOpenChange,
  orientacao
}: OrientacaoViewerDialogProps) {
  const isPdf = orientacao.arquivo_tipo.includes("pdf");
  const isImage = orientacao.arquivo_tipo.includes("image");
  
  const renderContent = () => {
    if (isImage) {
      return (
        <div className="w-full h-96 overflow-auto">
          <img
            src={orientacao.arquivo_url}
            alt={orientacao.titulo}
            className="max-w-full mx-auto"
          />
        </div>
      );
    } else if (isPdf) {
      return (
        <div className="w-full h-full border rounded-lg bg-muted/10">
          <PDFViewer url={orientacao.arquivo_url} className="h-full" />
        </div>
      );
    } else {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Este tipo de arquivo não pode ser visualizado diretamente.
            Por favor, faça o download para visualizá-lo.
          </p>
        </div>
      );
    }
  };

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case "vm":
        return <Badge variant="outline" className="bg-gradient-to-r from-primary/10 to-primary/5 text-primary border-primary/20 dark:from-primary/20 dark:to-primary/10 dark:text-primary dark:border-primary/30">VM</Badge>;
      case "informativo":
        return <Badge variant="outline" className="bg-gradient-to-r from-accent/50 to-accent/30 text-accent-foreground border-accent/40 dark:from-accent/30 dark:to-accent/20 dark:text-accent-foreground dark:border-accent/50">Informativo</Badge>;
      default:
        return <Badge variant="outline" className="bg-gradient-to-r from-muted/50 to-muted/30 text-muted-foreground border-muted/40 dark:from-muted/30 dark:to-muted/20 dark:text-muted-foreground dark:border-muted/50">Outro</Badge>;
    }
  };

  const handleDownload = () => {
    window.open(orientacao.arquivo_url, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${
        isPdf 
          ? 'w-[95vw] h-[95vh] max-w-[95vw] max-h-[95vh]' 
          : 'sm:max-w-4xl w-[95vw] max-h-[95vh]'
      } overflow-hidden flex flex-col`}>
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg sm:text-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold">{orientacao.titulo}</span>
              {getTipoBadge(orientacao.tipo)}
            </div>
            <Button variant="outline" size="sm" onClick={handleDownload} className="w-full mt-2 sm:mt-0 sm:w-auto whitespace-nowrap">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {orientacao.descricao ? orientacao.descricao.substring(0, 100) + (orientacao.descricao.length > 100 ? '...' : '') : 'Visualização de orientação'}
          </DialogDescription>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs sm:text-sm text-muted-foreground mt-2 sm:mt-1 gap-1">
            <span>
              {orientacao.criado_por_nome && `Por: ${orientacao.criado_por_nome}`}
            </span>
            <span>
              {formatDistanceToNow(new Date(orientacao.data_criacao), {
                addSuffix: true,
                locale: ptBR,
              })}
            </span>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {!isPdf && (
            <div className="mb-4 overflow-y-auto max-h-32">
              <p className="whitespace-pre-wrap">{orientacao.descricao}</p>
            </div>
          )}

          <div className={`${isPdf ? 'h-full' : 'mt-4 border-t pt-4'}`}>
            {renderContent()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
