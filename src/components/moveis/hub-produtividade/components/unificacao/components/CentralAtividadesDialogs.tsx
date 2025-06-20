
import { AddRotinaDialog } from "@/components/moveis/rotinas/components/AddRotinaDialog";
import { UseFormReturn } from "react-hook-form";
import { TarefaFormValues } from '../hooks/useTarefasOperations';

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

      {/* Note: AddTarefaDialog and AddOrientacaoDialog components need to be created 
          with proper interfaces or these can be temporarily disabled */}
      
      {/* Placeholder for missing dialogs - these would need to be implemented properly */}
      {showAddTarefaForm && (
        <div>
          {/* AddTarefaDialog placeholder */}
        </div>
      )}
      
      {showAddOrientacaoDialog && (
        <div>
          {/* AddOrientacaoDialog placeholder */}
        </div>
      )}
    </>
  );
}
