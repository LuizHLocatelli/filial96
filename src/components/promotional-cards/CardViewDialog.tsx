import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Copy, Download, X, Smartphone } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/components/ui/use-toast";
import { StandardDialogHeader, StandardDialogFooter } from "@/components/ui/standard-dialog";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface FolderItem {
  id: string;
  name: string;
}

interface CardViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  imageUrl: string;
  code: string;
  startDate: string;
  endDate: string;
  currentFolder: FolderItem;
  aspectRatio?: "1:1" | "3:4" | "4:5";
  isMobile: boolean;
}

export function CardViewDialog({
  open,
  onOpenChange,
  title,
  imageUrl,
  code,
  startDate,
  endDate,
  currentFolder,
  aspectRatio = "4:5",
}: CardViewDialogProps) {
  const isMobile = useIsMobile();
  const [isDownloading, setIsDownloading] = useState(false);

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case "1:1":
        return "aspect-square";
      case "3:4":
        return "aspect-[3/4]";
      case "4:5":
        return "aspect-[4/5]";
      default:
        return "aspect-[4/5]";
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Código copiado!",
      description: "O código foi copiado para a área de transferência.",
    });
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_card.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download iniciado!",
        description: "A imagem do card está sendo baixada.",
      });
    } catch (error) {
      console.error("Erro ao baixar imagem:", error);
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar a imagem.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareWhatsApp = () => {
    const message = encodeURIComponent(
      `*${title}*\n\n` +
      (code ? `Código: ${code}\n\n` : '') +
      `Veja o card: ${imageUrl}`
    );
    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "WhatsApp aberto!",
      description: "Pronto para compartilhar o card.",
    });
  };

  const handleShareWhatsAppWithImage = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], `${title}_card.jpg`, { type: 'image/jpeg' });
      
      const messageText = code 
        ? `*${title}*\n\nCódigo: ${code}`
        : `*${title}*`;
      
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: title,
          text: messageText,
        });
        
        toast({
          title: "Compartilhado!",
          description: "Card compartilhado com sucesso.",
        });
      } else {
        handleShareWhatsApp();
      }
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
      handleShareWhatsApp();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          "max-h-[90vh] overflow-y-auto flex flex-col p-0 gap-0",
          isMobile ? 'w-[calc(100%-2rem)] max-w-full' : 'sm:max-w-md'
        )}
        hideCloseButton
      >
        <StandardDialogHeader
          icon={Eye}
          iconColor="primary"
          title="Visualizar Card"
          description="Visualize, baixe ou compartilhe este card"
          onClose={() => onOpenChange(false)}
        />

        <div className="flex-1 overflow-y-auto">
          <div className={cn(
            "relative overflow-hidden bg-background border-b border-border",
            getAspectRatioClass()
          )}>
            <img
              src={imageUrl}
              alt={title}
              className="object-contain w-full h-full"
            />
          </div>

          <div className="p-4 sm:p-6 space-y-5 bg-card">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">{title}</h3>
              <Badge variant="secondary" className="text-xs">
                {currentFolder.name}
              </Badge>
            </div>

            {code && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Código do Card</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-3 bg-muted rounded-lg text-sm font-mono text-foreground">
                    {code}
                  </code>
                  <Button 
                    size="icon" 
                    variant="outline" 
                    onClick={handleCopyCode}
                    className="h-11 w-11 shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {(startDate || endDate) && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Período de Validade</label>
                <div className={cn(
                  "grid gap-3 text-sm",
                  startDate && endDate ? "grid-cols-2" : "grid-cols-1"
                )}>
                  {startDate && (
                    <div className="p-3 bg-muted rounded-lg">
                      <span className="text-xs text-muted-foreground block mb-1">Início</span>
                      <span className="font-medium text-foreground">{startDate}</span>
                    </div>
                  )}
                  {endDate && (
                    <div className="p-3 bg-muted rounded-lg">
                      <span className="text-xs text-muted-foreground block mb-1">Fim</span>
                      <span className="font-medium text-foreground">{endDate}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className={cn(
              "grid gap-3 pt-2",
              isMobile ? "grid-cols-1" : "grid-cols-2"
            )}>
              <Button 
                onClick={handleDownload}
                disabled={isDownloading}
                size="lg"
                className="w-full font-medium bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isDownloading ? (
                  <span className="animate-spin mr-2">⏳</span>
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Baixar Imagem
              </Button>
              
              <Button 
                onClick={handleShareWhatsAppWithImage}
                size="lg"
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-medium"
              >
                <Smartphone className="mr-2 h-4 w-4" />
                Compartilhar
              </Button>
            </div>
          </div>
        </div>

        <StandardDialogFooter className={cn(
          "border-t bg-muted/50",
          isMobile ? 'flex-col gap-2' : 'flex-row gap-3'
        )}>
          <Button 
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className={cn(
              "font-medium",
              isMobile ? 'w-full' : ''
            )}
          >
            <X className="mr-2 h-4 w-4" />
            Fechar
          </Button>
        </StandardDialogFooter>
      </DialogContent>
    </Dialog>
  );
}
