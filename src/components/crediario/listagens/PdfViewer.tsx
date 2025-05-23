
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { PDFViewer } from "@/components/ui/pdf-viewer";
import { ExternalLink, Download } from "lucide-react";
import { useState } from "react";

interface PdfViewerProps {
  pdfUrl: string;
  pdfName: string | null;
}

export function PdfViewer({ pdfUrl, pdfName }: PdfViewerProps) {
  const isMobile = useIsMobile();
  const [hasError, setHasError] = useState(false);
  
  const openPdfInNewWindow = () => {
    window.open(pdfUrl, '_blank');
  };
  
  const handleDownload = () => {
    // Create fetch request to get the file as blob
    fetch(pdfUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.blob();
      })
      .then(blob => {
        // Create a URL for the blob
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = pdfName || "documento.pdf";
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.error('Download failed:', error);
        setHasError(true);
      });
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
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={openPdfInNewWindow}
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
