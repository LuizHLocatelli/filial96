
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, FileImage, Download, X } from "lucide-react";
import { CartazItem } from "../hooks/useCartazes";

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
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg font-semibold mb-2">
                {cartaz.title}
              </DialogTitle>
              <Badge variant="secondary" className="text-xs">
                {cartaz.file_type === 'pdf' ? (
                  <>
                    <FileText className="h-3 w-3 mr-1" />
                    PDF
                  </>
                ) : (
                  <>
                    <FileImage className="h-3 w-3 mr-1" />
                    Imagem
                  </>
                )}
              </Badge>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="px-6 pb-6">
          <div className="bg-muted rounded-lg overflow-hidden">
            {cartaz.file_type === 'image' ? (
              <img 
                src={cartaz.file_url} 
                alt={cartaz.title}
                className="w-full h-auto max-h-[60vh] object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-20">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  Visualização de PDF não disponível
                </p>
                <Button onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Baixar PDF
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
