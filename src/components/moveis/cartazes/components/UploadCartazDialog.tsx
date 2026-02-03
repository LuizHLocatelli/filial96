import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { UploadCartazForm } from "./UploadCartazForm";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  StandardDialogHeader,
  StandardDialogContent,
  StandardDialogFooter,
} from "@/components/ui/standard-dialog";
import { Upload } from "lucide-react";

interface UploadCartazDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderId: string | null;
  onUploadSuccess: () => void;
}

export function UploadCartazDialog({ 
  open, 
  onOpenChange, 
  folderId, 
  onUploadSuccess 
}: UploadCartazDialogProps) {
  const isMobile = useIsMobile();

  const handleUploadSuccess = () => {
    onOpenChange(false);
    onUploadSuccess();
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`${isMobile ? 'w-[calc(100%-2rem)] max-w-full p-0' : 'sm:max-w-[500px] p-0'} overflow-hidden`}
        hideCloseButton
      >
        <StandardDialogHeader
          icon={Upload}
          iconColor="primary"
          title="Novo Cartaz"
          onClose={() => onOpenChange(false)}
          loading={false}
        />

        <StandardDialogContent>
          <UploadCartazForm
            folderId={folderId}
            onUploadSuccess={handleUploadSuccess}
            onCancel={handleCancel}
          />
        </StandardDialogContent>
      </DialogContent>
    </Dialog>
  );
}
