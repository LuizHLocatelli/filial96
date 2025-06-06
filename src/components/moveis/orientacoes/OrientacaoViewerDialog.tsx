
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Orientacao } from "./types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PDFViewer } from "@/components/ui/pdf-viewer";
import { useEffect } from "react";
import { useOrientacoesMonitoring } from "../hub-produtividade/hooks/useOrientacoesMonitoring";
import { useMobileDialog } from "@/hooks/useMobileDialog";

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
  const { registerView } = useOrientacoesMonitoring();
  const { getMobileButtonProps } = useMobileDialog();
  const isPdf = orientacao.arquivo_tipo.includes("pdf");
  const isImage = orientacao.arquivo_tipo.includes("image");
  
  // Registrar visualização quando o dialog for aberto
  useEffect(() => {
    if (open && orientacao?.id) {
      registerView(orientacao.id);
    }
  }, [open, orientacao?.id, registerView]);
  
  const renderContent = () => {
    if (isImage) {
      return (
        <div className="w-full max-h-[60vh] overflow-auto">
          <img
            src={orientacao.arquivo_url}
            alt={orientacao.titulo}
            className="max-w-full h-auto mx-auto object-contain"
          />
        </div>
      );
    } else if (isPdf) {
      return (
        <div className="w-full h-[60vh] border rounded-lg bg-muted/10">
          <PDFViewer url={orientacao.arquivo_url} className="h-full" />
        </div>
      );
    } else {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground text-sm">
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
          ? 'w-[calc(100vw-1rem)] h-[calc(100vh-2rem)] max-w-[calc(100vw-1rem)] max-h-[calc(100vh-2rem)] sm:w-[95vw] sm:h-[95vh] sm:max-w-[95vw] sm:max-h-[95vh]' 
          : 'w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] sm:max-w-4xl max-h-[95vh]'
      } overflow-hidden flex flex-col`}>
        <DialogHeader className="pb-2 sm:pb-4 flex-shrink-0">
          <DialogTitle className="text-base sm:text-xl flex flex-col gap-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-start sm:items-center gap-2 flex-wrap min-w-0">
                <span className="font-semibold text-sm sm:text-lg break-words">{orientacao.titulo}</span>
                {getTipoBadge(orientacao.tipo)}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownload} 
                className="w-full sm:w-auto whitespace-nowrap text-xs sm:text-sm"
                {...getMobileButtonProps()}
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Download
              </Button>
            </div>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {orientacao.descricao ? orientacao.descricao.substring(0, 100) + (orientacao.descricao.length > 100 ? '...' : '') : 'Visualização de orientação'}
          </DialogDescription>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-muted-foreground mt-2 sm:mt-1 gap-1">
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

        <div className="flex-1 overflow-hidden min-h-0">
          {!isPdf && orientacao.descricao && (
            <div className="mb-4 overflow-y-auto max-h-32 flex-shrink-0">
              <p className="whitespace-pre-wrap text-sm">{orientacao.descricao}</p>
            </div>
          )}

          <div className={`${isPdf ? 'h-full' : 'mt-4 border-t pt-4 flex-1'} overflow-hidden`}>
            {renderContent()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
