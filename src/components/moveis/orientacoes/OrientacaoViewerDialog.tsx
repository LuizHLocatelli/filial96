
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Orientacao } from "./types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PDFViewer } from "@/components/ui/pdf-viewer";
import { useState } from "react";

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
  const [hasError, setHasError] = useState(false);

  const openFileInNewWindow = () => {
    window.open(orientacao.arquivo_url, '_blank');
  };

  const handleDownload = () => {
    fetch(orientacao.arquivo_url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = orientacao.arquivo_nome || orientacao.titulo + ".pdf";
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.error('Download failed:', error);
        setHasError(true);
      });
  };

  const renderContent = () => {
    if (orientacao.arquivo_tipo.includes("image")) {
      return (
        <div className="w-full h-[70vh] overflow-auto">
          <img
            src={orientacao.arquivo_url}
            alt={orientacao.titulo}
            className="max-w-full mx-auto"
          />
        </div>
      );
    } else if (orientacao.arquivo_tipo.includes("pdf")) {
      return (
        <div className="border rounded-lg overflow-hidden bg-muted/10 h-[70vh]">
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-2 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-lg">{orientacao.titulo}</span>
            {getTipoBadge(orientacao.tipo)}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={openFileInNewWindow}
              className="whitespace-nowrap"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir externamente
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownload} 
              className="whitespace-nowrap"
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs sm:text-sm text-muted-foreground mb-4 gap-1">
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

        <div className="flex-1 overflow-hidden">
          <div className="mb-4">
            <p className="whitespace-pre-wrap">{orientacao.descricao}</p>
          </div>

          <div className="mt-4 border-t pt-4">
            {renderContent()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
