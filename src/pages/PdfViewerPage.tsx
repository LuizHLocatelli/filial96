import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown, ArrowLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/components/ui/use-toast";
import { PDFViewer } from "@/components/ui/pdf-viewer";

const PdfViewerPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const pdfUrl = searchParams.get("url");
  const pdfName = searchParams.get("name");
  
  useEffect(() => {
    if (!pdfUrl) {
      toast({
        title: "Erro",
        description: "URL do PDF não fornecida",
        variant: "destructive",
      });
      navigate("/crediario");
    }
  }, [pdfUrl, navigate, toast]);

  const handleBack = () => {
    navigate("/crediario");
  };

  const handleDownload = () => {
    if (pdfUrl) {
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
          
          toast({
            title: "Download concluído",
            description: "O arquivo foi baixado com sucesso.",
          });
        })
        .catch(error => {
          console.error('Download failed:', error);
          toast({
            title: "Erro ao baixar",
            description: "Não foi possível baixar o arquivo.",
            variant: "destructive",
          });
        });
    }
  };

  if (!pdfUrl) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 pt-4">
        <div>
          <h1 className="text-2xl font-bold">{pdfName || "Visualizar PDF"}</h1>
          <p className="text-muted-foreground">Visualize o documento PDF</p>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Button 
            variant="default" 
            className="w-full sm:w-auto"
            onClick={handleDownload}
          >
            <ArrowDown className="h-4 w-4 mr-2" />
            Baixar
          </Button>
        </div>
      </div>

      <Card className="w-full rounded-none border-x-0 sm:rounded-lg sm:border-x">
        <CardContent className="p-0 sm:p-0">
          <PDFViewer url={pdfUrl} className="min-h-[calc(100vh-150px)]" />
        </CardContent>
      </Card>
    </div>
  );
};

export default PdfViewerPage;
