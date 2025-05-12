
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface PdfViewerProps {
  pdfUrl: string;
  pdfName: string | null;
}

export function PdfViewer({ pdfUrl, pdfName }: PdfViewerProps) {
  const isMobile = useIsMobile();
  
  const openPdfInNewWindow = () => {
    window.open(pdfUrl, '_blank');
  };

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle>Visualizador de PDF</CardTitle>
          <CardDescription>
            {pdfName || "Visualize o conteúdo da listagem selecionada"}
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={openPdfInNewWindow}
          className="whitespace-nowrap"
        >
          Abrir em nova janela
        </Button>
      </CardHeader>
      <CardContent className={isMobile ? "h-[400px]" : "h-[600px]"}>
        <div className="w-full h-full border rounded-md overflow-hidden">
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
            className="w-full h-full border-0"
            title="PDF Viewer"
            allowFullScreen
            sandbox="allow-same-origin allow-scripts allow-forms"
            loading="eager"
          />
        </div>
      </CardContent>
    </Card>
  );
}
