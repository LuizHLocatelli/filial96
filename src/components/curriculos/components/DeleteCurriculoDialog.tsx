import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  StandardDialogHeader,
  StandardDialogFooter,
} from '@/components/ui/standard-dialog';
import { Trash2, AlertTriangle } from 'lucide-react';
import type { Curriculo } from '@/types/curriculos';
import { useCurriculoOperations } from '../hooks/useCurriculoOperations';
import { useToast } from '@/hooks/use-toast';

interface DeleteCurriculoDialogProps {
  curriculo: Curriculo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteCurriculoDialog({
  curriculo,
  open,
  onOpenChange,
  onSuccess
}: DeleteCurriculoDialogProps) {
  const { deleteCurriculo, isDeleting } = useCurriculoOperations();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!curriculo) return;

    const result = await deleteCurriculo(curriculo);

    if (result.success) {
      toast({
        title: 'Currículo excluído',
        description: 'O currículo foi removido com sucesso'
      });
      onOpenChange(false);
      onSuccess?.();
    } else {
      toast({
        title: 'Erro ao excluir',
        description: result.error || 'Ocorreu um erro ao excluir o currículo',
        variant: 'destructive'
      });
    }
  };

  if (!curriculo) return null;

  return (
    <Dialog open={open} onOpenChange={(open) => !isDeleting && onOpenChange(open)}>
      <DialogContent className="sm:max-w-[400px] p-0 max-h-[85vh] overflow-y-auto flex flex-col" hideCloseButton>
        <StandardDialogHeader
          icon={AlertTriangle}
          iconColor="red"
          title="Excluir Currículo"
          description="Esta ação não pode ser desfeita"
          onClose={() => onOpenChange(false)}
          loading={isDeleting}
        />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Tem certeza que deseja excluir o currículo de:
            </p>
            
            <div className="p-3 bg-muted rounded-lg">
              <p className="font-medium">{curriculo.candidate_name}</p>
            </div>

            <p className="text-sm text-muted-foreground">
              O arquivo também será removido do sistema.
            </p>
          </div>
        </div>

        <StandardDialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            {isDeleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </StandardDialogFooter>
      </DialogContent>
    </Dialog>
  );
}
