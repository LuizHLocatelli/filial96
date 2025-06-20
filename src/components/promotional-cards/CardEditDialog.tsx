
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit3 } from "lucide-react";
import { useMobileDialog } from "@/hooks/useMobileDialog";

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
      <DialogContent {...getMobileDialogProps("default")}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Editar Card
          </DialogTitle>
          <DialogDescription>
            Altere o título do card promocional
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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

        <div {...getMobileFooterProps()}>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!newTitle.trim() || newTitle === title || isSubmitting}
          >
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
