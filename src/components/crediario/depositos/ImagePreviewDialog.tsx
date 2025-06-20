import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMobileDialog } from "@/hooks/useMobileDialog";
import { Eye, FileText } from "lucide-react";

interface ImagePreviewDialogProps {
  viewImage: string | null;
  setViewImage: (url: string | null) => void;
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
            Comprovante de Depósito
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Visualização do comprovante de depósito bancário
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
