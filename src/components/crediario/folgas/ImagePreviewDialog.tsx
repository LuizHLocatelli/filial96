
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ImagePreviewDialogProps {
  imageUrl: string | null;
  onClose: () => void;
}

export function ImagePreviewDialog({ imageUrl, onClose }: ImagePreviewDialogProps) {
  if (!imageUrl) return null;
  
  return (
    <Dialog open={!!imageUrl} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Visualizar Imagem</DialogTitle>
        </DialogHeader>
        <div className="p-0">
          <img src={imageUrl} alt="Imagem" className="w-full h-full object-cover" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
