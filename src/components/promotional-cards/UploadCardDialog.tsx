import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CardUploadForm } from "@/components/promotional-cards/CardUploadForm";
import { useCardUpload } from "@/hooks/useCardUpload";
import { ImageUp } from "lucide-react";
import { StandardDialogHeader, StandardDialogContent } from "@/components/ui/standard-dialog";
import { useIsMobile } from "@/hooks/use-mobile";

interface UploadCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sector: "furniture" | "fashion" | "loan" | "service";
  folderId: string | null;
  onUploadSuccess: () => void;
}

export function UploadCardDialog({ open, onOpenChange, sector, folderId, onUploadSuccess }: UploadCardDialogProps) {
  const isMobile = useIsMobile();
  const {
    title,
    code,
    startDate,
    endDate,
    previewUrl,
    isSubmitting,
    setTitle,
    setCode,
    setStartDate,
    setEndDate,
    setFolderId,
    handleFileChange,
    removeImage,
    handleSubmit,
    resetState
  } = useCardUpload({
    sector,
    initialFolderId: folderId,
    onSuccess: () => {
        onOpenChange(false);
        onUploadSuccess();
    }
  });

  const handleCancel = () => {
    resetState();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`
          ${isMobile ? 'w-[calc(100%-2rem)] max-w-full p-0' : 'sm:max-w-2xl p-0'}
          overflow-hidden max-h-[85vh]
        `}
        hideCloseButton
      >
        <StandardDialogHeader
          icon={ImageUp}
          iconColor="primary"
          title="Novo Card Promocional"
          description="Faça o upload da imagem e preencha os detalhes para criar um novo material"
          onClose={handleCancel}
        />
        
        <StandardDialogContent>
          <CardUploadForm 
            sector={sector}
            title={title}
            setTitle={setTitle}
            code={code}
            setCode={setCode}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            folderId={folderId}
            setFolderId={setFolderId}
            previewUrl={previewUrl}
            handleFileChange={handleFileChange}
            removeImage={removeImage}
            handleSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            onCancel={handleCancel}
          />
        </StandardDialogContent>
      </DialogContent>
    </Dialog>
  );
}
