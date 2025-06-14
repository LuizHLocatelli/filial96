
import { AddRotinaDialog } from "@/components/moveis/rotinas/components/AddRotinaDialog";
import { UseFormReturn } from "react-hook-form";
import { TarefaFormValues } from '../hooks/useTarefasOperations';
import { AddTarefaDialog } from './AddTarefaDialog';
import { AddOrientacaoDialog } from './AddOrientacaoDialog';

interface CentralAtividadesDialogsProps {
  showAddRotinaDialog: boolean;
  setShowAddRotinaDialog: (show: boolean) => void;
  onCreateRotina: (data: any) => Promise<boolean>;
  
  showAddTarefaForm: boolean;
  setShowAddTarefaForm: (show: boolean) => void;
  tarefaForm: UseFormReturn<TarefaFormValues>;
  onCreateTarefa: (data: TarefaFormValues) => Promise<void>;
  orientacoes: Array<{ id: string; titulo: string }>;
  rotinas: Array<{ id: string; nome: string }>;
  
  showAddOrientacaoDialog: boolean;
  setShowAddOrientacaoDialog: (show: boolean) => void;
  onUploadOrientacaoSuccess: () => void;
}

export function CentralAtividadesDialogs({
  showAddRotinaDialog,
  setShowAddRotinaDialog,
  onCreateRotina,
  showAddTarefaForm,
  setShowAddTarefaForm,
  tarefaForm,
  onCreateTarefa,
  orientacoes,
  rotinas,
  showAddOrientacaoDialog,
  setShowAddOrientacaoDialog,
  onUploadOrientacaoSuccess,
}: CentralAtividadesDialogsProps) {
  return (
    <>
      <AddRotinaDialog
        open={showAddRotinaDialog}
        onOpenChange={setShowAddRotinaDialog}
        onSubmit={onCreateRotina}
      />

      <AddTarefaDialog
        open={showAddTarefaForm}
        onOpenChange={setShowAddTarefaForm}
        form={tarefaForm}
        onSubmit={onCreateTarefa}
        orientacoes={orientacoes}
        rotinas={rotinas}
      />

      <AddOrientacaoDialog
        open={showAddOrientacaoDialog}
        onOpenChange={setShowAddOrientacaoDialog}
        onSuccess={onUploadOrientacaoSuccess}
      />
    </>
  );
}
