import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit3 } from "lucide-react";
import { useMobileDialog } from "@/hooks/useMobileDialog";
import {
  StandardDialogHeader,
  StandardDialogFooter,
} from "@/components/ui/standard-dialog";

interface CardEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  id: string;
  title: string;
  isMobile: boolean;
  onSuccess: (newTitle: string) => void;
}

export function CardEditDialog({
  open,
  onOpenChange,
  id,
  title,
  isMobile,
  onSuccess
}: CardEditDialogProps) {
  const { getMobileDialogProps, getMobileFooterProps } = useMobileDialog();
  const [newTitle, setNewTitle] = useState(title);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (newTitle.trim() && newTitle !== title) {
      setIsSubmitting(true);
      try {
        onSuccess(newTitle);
        onOpenChange(false);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`${isMobile ? 'w-[calc(100%-2rem)] max-w-full p-0' : 'sm:max-w-[500px] p-0'} max-h-[85vh] overflow-y-auto flex flex-col`}
        hideCloseButton
      >
        <StandardDialogHeader
          icon={Edit3}
          iconColor="primary"
          title="Editar Card"
          description="Altere o título do card promocional"
          onClose={() => onOpenChange(false)}
          loading={isSubmitting}
        />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Título do card"
            />
          </div>
        </div>

        <StandardDialogFooter className={isMobile ? 'flex-col gap-2' : 'flex-row gap-3'}>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className={isMobile ? 'w-full h-10' : ''}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!newTitle.trim() || newTitle === title || isSubmitting}
            className={isMobile ? 'w-full h-10' : ''}
          >
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </StandardDialogFooter>
      </DialogContent>
    </Dialog>
  );
}
