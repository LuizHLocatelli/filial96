
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { PDFViewer } from "@/components/ui/pdf-viewer";
import { ExternalLink } from "lucide-react";

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
          <ExternalLink className="h-4 w-4 mr-2" />
          Abrir externamente
        </Button>
      </CardHeader>
      <CardContent className="p-4">
        <div className="border rounded-lg overflow-hidden bg-muted/10">
          <PDFViewer 
            url={pdfUrl} 
            className={isMobile ? "min-h-[400px]" : "min-h-[600px]"} 
          />
        </div>
      </CardContent>
    </Card>
  );
}
