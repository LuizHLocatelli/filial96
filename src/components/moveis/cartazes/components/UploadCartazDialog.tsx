import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { UploadCartazForm } from "./UploadCartazForm";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  StandardDialogHeader,
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
        className={`${isMobile ? 'w-[calc(100%-2rem)] max-w-full p-0' : 'sm:max-w-[500px] p-0'} max-h-[85vh] overflow-y-auto flex flex-col`}
        hideCloseButton
      >
        <StandardDialogHeader
          icon={Upload}
          iconColor="primary"
          title="Novo Cartaz"
          onClose={() => onOpenChange(false)}
          loading={false}
        />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <UploadCartazForm
            folderId={folderId}
            onUploadSuccess={handleUploadSuccess}
            onCancel={handleCancel}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
