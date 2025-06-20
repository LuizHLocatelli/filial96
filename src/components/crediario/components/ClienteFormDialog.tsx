import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ClienteForm } from './ClienteForm';
import { ClienteFormValues } from '../hooks/useClienteForm';
import { UserPlus, Edit3 } from 'lucide-react';
import { useMobileDialog } from '@/hooks/useMobileDialog';

interface ClienteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ClienteFormValues) => void;
  initialData?: Partial<ClienteFormValues>;
  isSubmitting: boolean;
}

export function ClienteFormDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  initialData,
  isSubmitting 
}: ClienteFormDialogProps) {
  const { getMobileDialogProps, getMobileFooterProps } = useMobileDialog();
  const isEditing = !!initialData?.id;
  const IconComponent = isEditing ? Edit3 : UserPlus;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent {...getMobileDialogProps("default")}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center">
              <IconComponent className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
            </div>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {isEditing ? 'Modifique os dados do cliente existente.' : 'Cadastre um novo cliente no sistema.'}
          </DialogDescription>
        </DialogHeader>
        
        <ClienteForm 
          onSubmit={onSubmit}
          initialData={initialData}
          isSubmitting={isSubmitting}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
