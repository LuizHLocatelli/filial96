import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Share2, X, Image as ImageIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

interface AssistenteImageViewerProps {
  imageUrl: string | null;
  onClose: () => void;
}

export function AssistenteImageViewer({ imageUrl, onClose }: AssistenteImageViewerProps) {
  const isMobile = useIsMobile();

  const handleDownload = async () => {
    if (!imageUrl) return;
    try {
      // Force download by fetching blob
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `imagem-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao baixar a imagem:", error);
      toast.error("Não foi possível baixar a imagem");
    }
  };

  const handleShare = async () => {
    if (!imageUrl) return;
    try {
      if (navigator.share) {
        // Tenta baixar a imagem para compartilhar como arquivo (melhor UX no mobile)
        try {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const file = new File([blob], `imagem-${Date.now()}.png`, { type: blob.type });
          
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: "Imagem do Assistente",
              text: "Olha a imagem gerada pelo Assistente IA!",
            });
            return;
          }
        } catch (e) {
          // Fallback para compartilhar a URL se não conseguir baixar/compartilhar o arquivo
          console.log("Fallback para compartilhar apenas o link", e);
        }

        await navigator.share({
          title: "Imagem do Assistente",
          url: imageUrl,
        });
      } else {
        await navigator.clipboard.writeText(imageUrl);
        toast.success("Link da imagem copiado!");
      }
    } catch (error) {
      console.error("Erro ao compartilhar a imagem:", error);
      // Evita o toast de erro se o usuário apenas cancelou o modal de compartilhamento
      if (error instanceof Error && error.name !== 'AbortError') {
        toast.error("Não foi possível compartilhar a imagem");
      }
    }
  };

  return (
    <Dialog open={!!imageUrl} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className={`${isMobile ? 'w-[calc(100%-2rem)] max-w-full p-0' : 'sm:max-w-4xl p-0'} max-h-[90vh] overflow-hidden flex flex-col bg-background/95 backdrop-blur-sm border-muted`}
        hideCloseButton
      >
        <div className="flex items-center justify-between p-3 border-b bg-muted/30 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <ImageIcon className="w-4 h-4" />
            </div>
            <span className="font-medium text-sm">Visualização de Imagem</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={handleDownload}>
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-black/5 dark:bg-black/20">
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Visualização"
              className="max-h-[75vh] max-w-full object-contain rounded-md shadow-md"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}