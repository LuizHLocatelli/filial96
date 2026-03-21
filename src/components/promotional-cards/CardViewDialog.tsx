import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Copy, Download, X, Smartphone, Share2, QrCode, Calendar, Folder } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { StandardDialogHeader, StandardDialogFooter } from "@/components/ui/standard-dialog";
import { DialogScrollableContainer } from "@/components/ui/dialog-scrollable-container";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { getAspectRatioClass, downloadCardImage, shareCardWhatsApp } from "@/utils/cardUtils";
import { motion } from "framer-motion";
import { format, isAfter, isBefore, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  const aspectClass = getAspectRatioClass(aspectRatio);

  const getDateStatus = () => {
    if (!startDate && !endDate) return null;
    
    const now = new Date();
    const end = endDate ? parseISO(endDate) : null;
    const start = startDate ? parseISO(startDate) : null;
    
    if (end && isBefore(end, now)) return { label: "Expirado", variant: "destructive" as const };
    if (start && isAfter(start, now)) return { label: "Em breve", variant: "secondary" as const };
    if (end) return { label: "Ativo", variant: "default" as const };
    return null;
  };

  const dateStatus = getDateStatus();

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    toast.success("Código copiado!", { description: "O código foi copiado para a área de transferência." });
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadCardImage(imageUrl, title);
      toast.success("Download iniciado!", { description: "A imagem do card está sendo baixada." });
    } catch (error) {
      console.error("Erro ao baixar imagem:", error);
      toast.error("Erro no download", { description: "Não foi possível baixar a imagem." });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareWhatsAppWithImage = async () => {
    try {
      await shareCardWhatsApp(imageUrl, title, code);
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
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
          "max-h-[85dvh] sm:max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0",
          isMobile ? 'w-full max-w-full rounded-b-2xl rounded-t-2xl' : 'sm:max-w-lg rounded-xl'
        )}
        hideCloseButton
      >
        <StandardDialogHeader
          icon={Eye}
          iconColor="primary"
          title="Visualizar Card"
          description={title}
          onClose={() => onOpenChange(false)}
        />

        <DialogScrollableContainer className="px-0">
          <div className="space-y-4 px-4 pb-4">
            <motion.div 
              className={cn(
                "relative overflow-hidden rounded-xl bg-muted cursor-zoom-in",
                aspectClass,
                isImageZoomed && "fixed inset-4 z-50 flex items-center justify-center bg-black/80 rounded-xl"
              )}
              onClick={() => setIsImageZoomed(!isImageZoomed)}
              layoutId="card-image"
            >
              <img
                src={imageUrl}
                alt={title}
                className={cn(
                  "object-contain w-full h-full transition-transform duration-300",
                  isImageZoomed && "max-w-full max-h-full"
                )}
              />
              
              {isImageZoomed && (
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-4 right-4 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsImageZoomed(false);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}

              <div className="absolute top-3 right-3 flex gap-2">
                {dateStatus && (
                  <Badge variant={dateStatus.variant} className="shadow-lg">
                    {dateStatus.label}
                  </Badge>
                )}
              </div>
            </motion.div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-card rounded-xl border">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Folder className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Pasta</p>
                  <p className="font-medium text-foreground truncate">{currentFolder.name}</p>
                </div>
              </div>

              {code && (
                <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-1">Código do Produto</p>
                      <code className="text-lg font-mono font-bold text-foreground block truncate">
                        {code}
                      </code>
                    </div>
                    <Button 
                      size="icon" 
                      variant="outline" 
                      onClick={handleCopyCode}
                      className="shrink-0 h-11 w-11 rounded-xl bg-card hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {(startDate || endDate) && (
                <div className="grid grid-cols-2 gap-3">
                  {startDate && (
                    <div className="p-3 bg-card rounded-xl border">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">Início</p>
                      </div>
                      <p className="font-semibold text-foreground">{formatDate(startDate)}</p>
                    </div>
                  )}
                  {endDate && (
                    <div className="p-3 bg-card rounded-xl border">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">Fim</p>
                      </div>
                      <p className="font-semibold text-foreground">{formatDate(endDate)}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={handleDownload}
                  disabled={isDownloading}
                  variant="outline"
                  className="w-full h-12 rounded-xl font-medium bg-card hover:bg-primary/10 hover:border-primary/30 transition-all"
                >
                  {isDownloading ? (
                    <span className="animate-spin mr-2">⏳</span>
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  Baixar
                </Button>
                
                <Button 
                  onClick={handleShareWhatsAppWithImage}
                  className="w-full h-12 rounded-xl font-medium bg-[#25D366] hover:bg-[#128C7E] text-white transition-all"
                >
                  <Smartphone className="mr-2 h-4 w-4" />
                  WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </DialogScrollableContainer>

        <StandardDialogFooter className={cn("p-4 pt-0", !isMobile && "px-4")}>
          <Button 
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className={cn(
              "w-full h-11 rounded-xl font-medium",
              isMobile && "bg-muted/50"
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
