
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCardUpload } from "@/hooks/useCardUpload";
import { CardUploadForm } from "./CardUploadForm";

interface UploadCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sector: "furniture" | "fashion";
  folderId: string | null;
}

export function UploadCardDialog({ open, onOpenChange, sector, folderId: initialFolderId }: UploadCardDialogProps) {
  const {
    title,
    selectedFile,
    previewUrl,
    isSubmitting,
    folderId,
    setTitle,
    setFolderId,
    handleFileChange,
    removeImage,
    handleSubmit,
    resetState
  } = useCardUpload({
    sector,
    initialFolderId,
    onSuccess: () => onOpenChange(false)
  });
  
  // Reset state when dialog opens/closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetState();
    } else {
      setFolderId(initialFolderId);
    }
    onOpenChange(open);
  };
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Card Promocional</DialogTitle>
        </DialogHeader>
        
        <CardUploadForm
          sector={sector}
          title={title}
          setTitle={setTitle}
          folderId={folderId}
          setFolderId={setFolderId}
          previewUrl={previewUrl}
          handleFileChange={handleFileChange}
          removeImage={removeImage}
          handleSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          onCancel={() => handleOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
