import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Copy, Download, X, Smartphone } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/components/ui/use-toast";
import { StandardDialogHeader, StandardDialogFooter } from "@/components/ui/standard-dialog";
import { DialogScrollableContainer } from "@/components/ui/dialog-scrollable-container";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { getAspectRatioClass, downloadCardImage, shareCardWhatsApp } from "@/utils/cardUtils";

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
  isMobile?: boolean;
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

  const aspectClass = getAspectRatioClass(aspectRatio);

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
      await downloadCardImage(imageUrl, title);
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

  const handleShareWhatsAppWithImage = async () => {
    try {
      await shareCardWhatsApp(imageUrl, title, code);
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
      // Fallback: open WhatsApp with link
      const message = encodeURIComponent(
        `*${title}*\n\n` +
        (code ? `Código: ${code}\n\n` : '') +
        `Veja o card: ${imageUrl}`
      );
      window.open(`https://wa.me/?text=${message}`, '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          "max-h-[75dvh] sm:max-h-[75vh] overflow-hidden flex flex-col p-0 gap-0",
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

        <DialogScrollableContainer>
          {/* Imagem com altura máxima controlada */}
          <div className={cn(
            "relative overflow-hidden bg-background border border-border rounded-lg mb-5",
            aspectClass,
            "max-h-[50vh]"
          )}>
            <img
              src={imageUrl}
              alt={title}
              className="object-contain w-full h-full"
            />
          </div>

          <div className="space-y-5 bg-card">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">{title}</h3>
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
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-medium"
              >
                <Smartphone className="mr-2 h-4 w-4" />
                Compartilhar
              </Button>
              </div>
            </div>
          </DialogScrollableContainer>

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