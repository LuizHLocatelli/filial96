
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, FileImage, Download } from "lucide-react";
import { CartazItem } from "../hooks/useCartazes";
import { PDFViewer } from "@/components/ui/pdf-viewer/index";

interface CartazViewDialogProps {
  cartaz: CartazItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartazViewDialog({ cartaz, open, onOpenChange }: CartazViewDialogProps) {
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
      <DialogContent className="max-w-5xl max-h-[80vh] md:max-h-[85vh] lg:max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 p-4 sm:p-5 border-b">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <DialogTitle className="flex items-center gap-2 text-lg">
                <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center flex-shrink-0">
                  {cartaz.file_type === 'pdf' ? (
                    <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <FileImage className="h-5 w-5 text-green-600 dark:text-green-400" />
                  )}
                </div>
                <span className="truncate">{cartaz.title}</span>
              </DialogTitle>
              <Badge variant="secondary" className="ml-12 text-xs mt-1">
                {cartaz.file_type === 'pdf' ? 'PDF' : 'Imagem'}
              </Badge>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Download</span>
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 min-h-0 overflow-y-auto">
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
              <div className="flex flex-col items-center justify-center h-full">
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
      </DialogContent>
    </Dialog>
  );
}
