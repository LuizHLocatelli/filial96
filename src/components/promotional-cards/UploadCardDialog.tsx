import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CardUploadForm } from "@/components/promotional-cards/CardUploadForm";
import { useCardUpload } from "@/hooks/useCardUpload";
import { useMobileDialog } from "@/hooks/useMobileDialog";

interface UploadCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sector: "furniture" | "fashion" | "loan" | "service";
  folderId: string | null;
}

export function UploadCardDialog({ open, onOpenChange, sector, folderId }: UploadCardDialogProps) {
  const { getMobileDialogProps } = useMobileDialog();
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
    onSuccess: () => onOpenChange(false)
  });

  const handleCancel = () => {
    resetState();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent {...getMobileDialogProps("2xl")} className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Adicionar Novo Card Promocional</DialogTitle>
          <DialogDescription className="text-sm">
            Faça upload de um novo card promocional e preencha as informações necessárias
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
