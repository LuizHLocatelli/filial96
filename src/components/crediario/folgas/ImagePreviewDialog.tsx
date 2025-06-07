
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMobileDialog } from "@/hooks/useMobileDialog";

interface ImagePreviewDialogProps {
  viewImage: string | null;
  setViewImage: (url: string | null) => void;
}

export function ImagePreviewDialog({ viewImage, setViewImage }: ImagePreviewDialogProps) {
  const { getMobileDialogProps, getMobileButtonProps } = useMobileDialog();
  
  return (
    <Dialog open={!!viewImage} onOpenChange={() => setViewImage(null)}>
      <DialogContent {...getMobileDialogProps("4xl")} className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Comprovante de Folga</DialogTitle>
          <DialogDescription className="text-sm">
            Visualização do comprovante de folga
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto">
          {viewImage && (
            <div className="flex justify-center my-4">
              <img
                src={viewImage}
                alt="Comprovante"
                className="max-h-[60vh] max-w-full object-contain rounded-lg"
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button 
            onClick={() => setViewImage(null)} 
            {...getMobileButtonProps()}
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
