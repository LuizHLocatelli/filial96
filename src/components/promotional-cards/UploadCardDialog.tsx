import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CardUploadForm } from "@/components/promotional-cards/CardUploadForm";
import { useCardUpload } from "@/hooks/useCardUpload";

interface UploadCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sector: "furniture" | "fashion" | "loan" | "service";
  folderId: string | null;
}

export function UploadCardDialog({ open, onOpenChange, sector, folderId }: UploadCardDialogProps) {
  const {
    title,
    code,
    promotionDate,
    previewUrl,
    isSubmitting,
    setTitle,
    setCode,
    setPromotionDate,
    setFolderId,
    handleFileChange,
    removeImage,
    handleSubmit,
    resetState
  } = useCardUpload({
    sector,
    initialFolderId: folderId,
    onSuccess: () => onOpenChange(false)
  });

  const handleCancel = () => {
    resetState();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Card Promocional</DialogTitle>
          <DialogDescription>
            Faça upload de um novo card promocional e preencha as informações necessárias
          </DialogDescription>
        </DialogHeader>
        <CardUploadForm 
          sector={sector}
          title={title}
          setTitle={setTitle}
          code={code}
          setCode={setCode}
          promotionDate={promotionDate}
          setPromotionDate={setPromotionDate}
          folderId={folderId}
          setFolderId={setFolderId}
          previewUrl={previewUrl}
          handleFileChange={handleFileChange}
          removeImage={removeImage}
          handleSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
