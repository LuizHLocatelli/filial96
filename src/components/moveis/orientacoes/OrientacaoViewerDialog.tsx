import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const renderContent = () => {
    if (orientacao.arquivo_tipo.includes("image")) {
      return (
        <div className="w-full h-96 overflow-auto">
          <img
            src={orientacao.arquivo_url}
            alt={orientacao.titulo}
            className="max-w-full mx-auto"
          />
        </div>
      );
    } else if (orientacao.arquivo_tipo.includes("pdf")) {
      return (
        <div className="w-full h-[70vh] overflow-hidden rounded">
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
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">VM</Badge>;
      case "informativo":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">Informativo</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300">Outro</Badge>;
    }
  };

  const handleDownload = () => {
    window.open(orientacao.arquivo_url, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl w-[95vw] max-h-[95vh] overflow-hidden flex flex-col p-4 sm:p-6">
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

        <div className="flex-1 overflow-auto mt-2">
          <div className="mb-4">
            <p className="whitespace-pre-wrap">{orientacao.descricao}</p>
          </div>

          <div className="mt-4 border-t pt-4">{renderContent()}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
