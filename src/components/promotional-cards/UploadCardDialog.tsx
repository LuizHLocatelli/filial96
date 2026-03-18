import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CardUploadForm } from "@/components/promotional-cards/CardUploadForm";
import { useCardUpload } from "@/hooks/useCardUpload";
import { ImageUp } from "@/components/ui/emoji-icons";
import { StandardDialogHeader, StandardDialogFooter } from "@/components/ui/standard-dialog";
import { DialogScrollableContainer } from "@/components/ui/dialog-scrollable-container";
import { Button } from "@/components/ui/button";
import { Loader2 } from "@/components/ui/emoji-icons";
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
    aspectRatio,
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
        className={`${isMobile ? 'w-[calc(100%-2rem)] max-w-full p-0' : 'sm:max-w-2xl p-0'} max-h-[75dvh] sm:max-h-[75vh] overflow-hidden flex flex-col`}
        hideCloseButton
      >
        <StandardDialogHeader
          icon={ImageUp}
          iconColor="primary"
          title="Novo Card Promocional"
          description="Faça o upload da imagem e preencha os detalhes para criar um novo material"
          onClose={handleCancel}
        />
        
        <DialogScrollableContainer>
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
            aspectRatio={aspectRatio}
            previewUrl={previewUrl}
            handleFileChange={handleFileChange}
            removeImage={removeImage}
            handleSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            onCancel={handleCancel}
            showActions={false}
          />
        </DialogScrollableContainer>

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
