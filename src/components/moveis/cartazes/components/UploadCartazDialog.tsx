
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UploadCartazForm } from "./UploadCartazForm";

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
  const handleUploadSuccess = () => {
    onOpenChange(false);
    onUploadSuccess();
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Cartaz</DialogTitle>
        </DialogHeader>
        
        <UploadCartazForm
          folderId={folderId}
          onUploadSuccess={handleUploadSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
