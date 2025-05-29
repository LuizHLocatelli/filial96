import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar, Hash, Folder } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

  // Format date if it exists
  const formattedDate = promotionDate 
    ? format(new Date(promotionDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) 
    : null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-w-[95vw] p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg flex items-center justify-between">
            <span className="font-semibold text-primary">{title}</span>
            {code && (
              <Badge variant="outline" className="ml-2 px-2 whitespace-nowrap">
                Código: {code}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Visualize os detalhes do card promocional
            {promotionDate && ` da promoção de ${format(new Date(promotionDate), 'dd/MM/yyyy', { locale: ptBR })}`}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4">
          {/* Card Image with shadow and border */}
          <div className="w-full max-h-[60vh] overflow-hidden rounded-lg shadow-md border border-border">
            <img 
              src={imageUrl} 
              alt={title}
              className="w-full h-full object-contain"
            />
          </div>
          
          {/* Card Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-accent rounded-lg">
            {code && (
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Código do Card</p>
                  <p className="text-muted-foreground">{code}</p>
                </div>
              </div>
            )}
            
            {formattedDate && (
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Data da Promoção</p>
                  <p className="text-muted-foreground">{formattedDate}</p>
                </div>
              </div>
            )}
            
            {currentFolder && (
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <Folder className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Pasta</p>
                  <p className="text-muted-foreground">{currentFolder.name}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex justify-end mt-2">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleDownload}
              className="text-xs sm:text-sm px-3"
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
