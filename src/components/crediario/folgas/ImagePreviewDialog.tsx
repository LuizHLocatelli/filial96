import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  StandardDialogHeader,
  StandardDialogContent,
  StandardDialogFooter,
} from "@/components/ui/standard-dialog";

interface ImagePreviewDialogProps {
  viewImage: string | null;
  setViewImage: (imageUrl: string | null) => void;
}

export function ImagePreviewDialog({ viewImage, setViewImage }: ImagePreviewDialogProps) {
  const isMobile = useIsMobile();
  
  return (
    <Dialog open={!!viewImage} onOpenChange={() => setViewImage(null)}>
      <DialogContent 
        className={`${isMobile ? 'w-[calc(100%-2rem)] max-w-full p-0' : 'sm:max-w-[600px] p-0'} overflow-hidden`}
        hideCloseButton
      >
        <StandardDialogHeader
          icon={Eye}
          iconColor="blue"
          title="Comprovante de Folga"
          description="Visualização do comprovante de folga"
          onClose={() => setViewImage(null)}
          loading={false}
        />

        <StandardDialogContent className="flex justify-center p-4">
          {viewImage && (
            <img
              src={viewImage}
              alt="Comprovante de folga"
              className="max-h-[60vh] max-w-full object-contain rounded-lg"
            />
          )}
        </StandardDialogContent>

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
