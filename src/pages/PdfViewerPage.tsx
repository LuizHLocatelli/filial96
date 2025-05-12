
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/components/ui/use-toast";

const PdfViewerPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const pdfUrl = searchParams.get("url");
  const pdfName = searchParams.get("name");
  const [isFullscreen, setIsFullscreen] = useState(false);
  
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
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = pdfName || "documento.pdf";
      link.click();
    }
  };

  if (!pdfUrl) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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

      <Card className="w-full">
        <CardContent className={`p-0 ${isMobile ? "h-[70vh]" : "h-[80vh]"}`}>
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
            className="w-full h-full border-0"
            title="PDF Viewer"
            allowFullScreen
            sandbox="allow-same-origin allow-scripts allow-forms"
            loading="eager"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PdfViewerPage;
