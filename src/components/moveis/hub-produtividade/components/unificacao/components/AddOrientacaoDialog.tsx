
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { OrientacaoUploader } from "@/components/moveis/orientacoes/OrientacaoUploader";

interface AddOrientacaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddOrientacaoDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddOrientacaoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo VM ou Informativo</DialogTitle>
        </DialogHeader>
        <OrientacaoUploader onSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  );
}
