
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMobileDialog } from "@/hooks/useMobileDialog";
import { Eye } from "lucide-react";

interface ImagePreviewDialogProps {
  viewImage: string | null;
  setViewImage: (imageUrl: string | null) => void;
}

export function ImagePreviewDialog({ viewImage, setViewImage }: ImagePreviewDialogProps) {
  const { getMobileDialogProps, getMobileFooterProps } = useMobileDialog();
  
  return (
    <Dialog open={!!viewImage} onOpenChange={() => setViewImage(null)}>
      <DialogContent {...getMobileDialogProps("default")}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center">
              <Eye className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            Comprovante de Folga
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Visualização do comprovante de folga
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center p-2">
          {viewImage && (
            <img
              src={viewImage}
              alt="Comprovante de folga"
              className="max-h-[60vh] max-w-full object-contain rounded-lg"
            />
          )}
        </div>
        <div {...getMobileFooterProps()}>
          <Button 
            onClick={() => setViewImage(null)}
            variant="success"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
