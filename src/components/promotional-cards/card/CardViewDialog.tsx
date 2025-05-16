
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface CardViewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  imageUrl: string;
  code?: string;
  promotionDate?: string;
  currentFolder?: { id: string; name: string } | undefined;
  isMobile?: boolean;
}

export function CardViewDialog({
  isOpen,
  onOpenChange,
  title,
  imageUrl,
  code,
  promotionDate,
  currentFolder,
  isMobile
}: CardViewDialogProps) {
  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Create a download link
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${title.replace(/\s+/g, '_')}.${blob.type.split('/')[1]}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Sucesso",
        description: "Download iniciado"
      });
    } catch (error) {
      console.error('Error downloading image:', error);
      toast({
        title: "Erro",
        description: "Não foi possível fazer o download",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-[90vw] p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">{title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center">
          <div className="w-full max-h-[60vh] overflow-hidden rounded-md">
            <img 
              src={imageUrl} 
              alt={title}
              className="w-full h-full object-contain"
            />
          </div>
          
          <div className="w-full mt-4 space-y-2">
            {code && (
              <div className="text-xs sm:text-sm">
                <span className="font-semibold">Código:</span> {code}
              </div>
            )}
            {promotionDate && (
              <div className="text-xs sm:text-sm">
                <span className="font-semibold">Validade:</span> {new Date(promotionDate).toLocaleDateString('pt-BR')}
              </div>
            )}
            {currentFolder && (
              <div className="text-xs sm:text-sm">
                <span className="font-semibold">Pasta:</span> {currentFolder.name}
              </div>
            )}
          </div>
          
          <div className="flex gap-2 mt-4 w-full justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownload}
              className="text-xs sm:text-sm h-8"
            >
              <Download className="mr-2 h-3.5 w-3.5" />
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
