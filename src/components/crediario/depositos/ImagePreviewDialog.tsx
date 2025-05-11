
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ImagePreviewDialogProps {
  viewImage: string | null;
  setViewImage: (url: string | null) => void;
}

export function ImagePreviewDialog({ viewImage, setViewImage }: ImagePreviewDialogProps) {
  return (
    <Dialog open={!!viewImage} onOpenChange={() => setViewImage(null)}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Comprovante de Depósito</DialogTitle>
        </DialogHeader>
        {viewImage && (
          <div className="flex justify-center my-4">
            <img
              src={viewImage}
              alt="Comprovante"
              className="max-h-[70vh] max-w-full object-contain"
            />
          </div>
        )}
        <DialogFooter>
          <Button onClick={() => setViewImage(null)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
