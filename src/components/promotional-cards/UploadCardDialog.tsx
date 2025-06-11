import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CardUploadForm } from "@/components/promotional-cards/CardUploadForm";
import { useCardUpload } from "@/hooks/useCardUpload";
import { useMobileDialog } from "@/hooks/useMobileDialog";

interface UploadCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sector: "furniture" | "fashion" | "loan" | "service";
  folderId: string | null;
  onUploadSuccess: () => void;
}

export function UploadCardDialog({ open, onOpenChange, sector, folderId, onUploadSuccess }: UploadCardDialogProps) {
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
      <DialogContent {...getMobileDialogProps("4xl")} className="p-0 dark:bg-zinc-900/60 dark:backdrop-blur-xl dark:border-white/10">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-lg">Novo Card Promocional</DialogTitle>
          <DialogDescription>
            Faça o upload da imagem e preencha os detalhes para criar um novo material.
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-6 max-h-[80vh] overflow-y-auto">
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
