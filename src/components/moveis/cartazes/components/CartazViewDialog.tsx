import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, FileImage, Download, Eye } from "lucide-react";
import { CartazItem } from "../hooks/useCartazes";
import { PDFViewer } from "@/components/ui/pdf-viewer/index";
import { useIsMobile } from "@/hooks/use-mobile";
import { StandardDialogHeader, StandardDialogFooter } from "@/components/ui/standard-dialog";

interface CartazViewDialogProps {
  cartaz: CartazItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartazViewDialog({ cartaz, open, onOpenChange }: CartazViewDialogProps) {
  const isMobile = useIsMobile();

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = cartaz.file_url;
    link.download = cartaz.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`${isMobile ? 'w-[calc(100%-2rem)] max-w-full p-0' : 'max-w-5xl p-0'} max-h-[90vh] overflow-y-auto flex flex-col`}
        hideCloseButton
      >
        <StandardDialogHeader
          icon={Eye}
          iconColor="primary"
          title={cartaz.title}
          description={
            <Badge variant="secondary" className="text-xs">
              {cartaz.file_type === 'pdf' ? 'PDF' : 'Imagem'}
            </Badge>
          }
          onClose={() => onOpenChange(false)}
        />
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 overflow-hidden flex-1">
          <div className="bg-muted h-full min-h-[50vh]">
            {cartaz.file_type === 'image' ? (
              <img 
                src={cartaz.file_url} 
                alt={cartaz.title}
                className="w-full h-full object-contain"
              />
            ) : cartaz.file_type === 'pdf' ? (
              <PDFViewer 
                url={cartaz.file_url} 
                className="w-full h-full"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  Visualização não disponível para este tipo de arquivo
                </p>
                <Button onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Baixar arquivo
                </Button>
              </div>
            )}
          </div>
        </div>

        <StandardDialogFooter className={isMobile ? 'flex-col gap-2' : 'flex-row gap-3'}>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className={isMobile ? 'w-full' : ''}
          >
            Fechar
          </Button>
          <Button
            onClick={handleDownload}
            className={isMobile ? 'w-full' : ''}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </StandardDialogFooter>
      </DialogContent>
    </Dialog>
  );
}
