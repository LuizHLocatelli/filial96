import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Eye } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  StandardDialogHeader,
  StandardDialogFooter,
} from "@/components/ui/standard-dialog";

interface ImagePreviewDialogProps {
  viewImage: string | null;
  setViewImage: (url: string | null) => void;
}

export function ImagePreviewDialog({ viewImage, setViewImage }: ImagePreviewDialogProps) {
  const isMobile = useIsMobile();
  
  return (
    <Dialog open={!!viewImage} onOpenChange={() => setViewImage(null)}>
      <DialogContent 
        className={`${isMobile ? 'w-[calc(100%-2rem)] max-w-full p-0' : 'sm:max-w-[600px] p-0'} max-h-[85vh] overflow-y-auto flex flex-col`}
        hideCloseButton
      >
        <StandardDialogHeader
          icon={Eye}
          iconColor="blue"
          title="Comprovante de Depósito"
          description="Visualização do comprovante de depósito bancário"
          onClose={() => setViewImage(null)}
          loading={false}
        />

        <div className="flex-1 overflow-y-auto flex justify-center p-4 sm:p-6">
          {viewImage && (
            <img
              src={viewImage}
              alt="Comprovante"
              className="max-h-[50vh] max-w-full object-contain rounded-lg"
            />
          )}
        </div>

        <StandardDialogFooter className={isMobile ? 'flex-col gap-2' : 'flex-row gap-3'}>
          <Button 
            onClick={() => setViewImage(null)}
            className={isMobile ? 'w-full h-10' : ''}
          >
            Fechar
          </Button>
        </StandardDialogFooter>
      </DialogContent>
    </Dialog>
  );
}
