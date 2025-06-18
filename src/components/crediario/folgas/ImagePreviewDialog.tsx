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
      <DialogContent {...getMobileDialogProps("4xl", "80vh")} className="max-h-[80vh] overflow-y-auto flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Comprovante de Folga</DialogTitle>
          <DialogDescription className="text-sm">
            Visualização do comprovante de folga
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-y-auto">
          {viewImage && (
            <div className="flex justify-center p-2">
              <img
                src={viewImage}
                alt="Comprovante"
                className="max-h-[50vh] max-w-full object-contain rounded-lg"
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
