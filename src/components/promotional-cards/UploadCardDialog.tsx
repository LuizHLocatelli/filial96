import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CardUploadForm } from "@/components/promotional-cards/CardUploadForm";
import { useCardUpload } from "@/hooks/useCardUpload";
import { ImageUp } from "lucide-react";
import { StandardDialogHeader, StandardDialogFooter } from "@/components/ui/standard-dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
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
        className={`${isMobile ? 'w-[calc(100%-2rem)] max-w-full p-0' : 'sm:max-w-2xl p-0'} max-h-[85vh] overflow-y-auto flex flex-col`}
        hideCloseButton
      >
        <StandardDialogHeader
          icon={ImageUp}
          iconColor="primary"
          title="Novo Card Promocional"
          description="Faça o upload da imagem e preencha os detalhes para criar um novo material"
          onClose={handleCancel}
        />
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
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
            showActions={false}
          />
        </div>

        <StandardDialogFooter className={isMobile ? 'flex-col gap-2' : 'flex-row gap-3'}>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
            className={isMobile ? 'w-full h-10' : ''}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !previewUrl || !title}
            className={isMobile ? 'w-full h-10' : ''}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Card'
            )}
          </Button>
        </StandardDialogFooter>
      </DialogContent>
    </Dialog>
  );
}
