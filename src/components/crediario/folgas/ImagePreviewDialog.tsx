
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMobileDialog } from "@/hooks/useMobileDialog";

interface ImagePreviewDialogProps {
  imageUrl: string | null;
  onClose: () => void;
}

export function ImagePreviewDialog({ imageUrl, onClose }: ImagePreviewDialogProps) {
  const { getMobileDialogProps, getMobileButtonProps } = useMobileDialog();
  
  if (!imageUrl) return null;
  
  return (
    <Dialog open={!!imageUrl} onOpenChange={onClose}>
      <DialogContent {...getMobileDialogProps("4xl")} className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Visualizar Imagem</DialogTitle>
          <DialogDescription className="text-sm">
            Visualização da imagem anexada ao registro de folga
          </DialogDescription>
        </DialogHeader>
        <div className="p-0 max-h-[60vh] overflow-y-auto">
          <img 
            src={imageUrl} 
            alt="Imagem" 
            className="w-full h-auto object-contain max-h-full" 
          />
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            {...getMobileButtonProps()}
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
