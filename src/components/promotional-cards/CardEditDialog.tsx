import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit3 } from "lucide-react";
import {
  StandardDialogHeader,
  StandardDialogFooter,
} from "@/components/ui/standard-dialog";

interface CardEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  id: string;
  title: string;
  code: string | null;
  startDate: string | null;
  endDate: string | null;
  isMobile: boolean;
  onSuccess: (updates: { title: string; code?: string | null; start_date?: string | null; end_date?: string | null }) => Promise<boolean>;
}

export function CardEditDialog({
  open,
  onOpenChange,
  id,
  title,
  code,
  startDate,
  endDate,
  isMobile,
  onSuccess
}: CardEditDialogProps) {
  const [newTitle, setNewTitle] = useState(title);
  const [newCode, setNewCode] = useState(code || '');
  const [newStartDate, setNewStartDate] = useState(startDate ? startDate.split('T')[0] : '');
  const [newEndDate, setNewEndDate] = useState(endDate ? endDate.split('T')[0] : '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setNewTitle(title);
      setNewCode(code || '');
      setNewStartDate(startDate ? startDate.split('T')[0] : '');
      setNewEndDate(endDate ? endDate.split('T')[0] : '');
    }
  }, [open, title, code, startDate, endDate]);

  const handleSave = async () => {
    if (!newTitle.trim()) return;
    
    setIsSubmitting(true);
    try {
      const updates: { title: string; code?: string | null; start_date?: string | null; end_date?: string | null } = { title: newTitle.trim() };
      
      if (newCode !== (code || '')) {
        updates.code = newCode.trim() || null;
      }
      if (newStartDate !== (startDate || '')) {
        updates.start_date = newStartDate ? new Date(newStartDate).toISOString() : null;
      }
      if (newEndDate !== (endDate || '')) {
        updates.end_date = newEndDate ? new Date(newEndDate).toISOString() : null;
      }
      
      const hasChanges = Object.keys(updates).length > 1 || updates.title !== title;
      
      if (hasChanges) {
        const success = await onSuccess(updates);
        if (success) {
          onOpenChange(false);
        }
      } else {
        onOpenChange(false);
      }
    } finally {
      setIsSubmitting(false);
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

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Título do card"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="code">Código do Produto</Label>
            <Input
              id="code"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              placeholder="Ex: 123456"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data de Início</Label>
              <Input
                id="startDate"
                type="date"
                value={newStartDate}
                onChange={(e) => setNewStartDate(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">Data de Fim</Label>
              <Input
                id="endDate"
                type="date"
                value={newEndDate}
                onChange={(e) => setNewEndDate(e.target.value)}
                disabled={isSubmitting}
                min={newStartDate}
              />
            </div>
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
            disabled={!newTitle.trim() || isSubmitting}
            className={isMobile ? 'w-full h-10' : ''}
          >
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </StandardDialogFooter>
      </DialogContent>
    </Dialog>
  );
}
