
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AddRotinaDialog } from "@/components/moveis/rotinas/components/AddRotinaDialog";
import { TarefaForm } from "@/components/moveis/orientacoes/components/TarefaForm";
import { OrientacaoUploader } from "@/components/moveis/orientacoes/OrientacaoUploader";
import { UseFormReturn } from "react-hook-form";

interface TarefaFormValues {
  titulo: string;
  descricao: string;
  data_entrega: Date;
  orientacao_id?: string;
  rotina_id?: string;
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  origem: 'manual' | 'rotina' | 'orientacao';
}

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

      <Dialog open={showAddTarefaForm} onOpenChange={setShowAddTarefaForm}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Tarefa</DialogTitle>
          </DialogHeader>
          <TarefaForm
            form={tarefaForm}
            orientacoes={orientacoes}
            rotinas={rotinas}
            onSubmit={onCreateTarefa}
            onCancel={() => setShowAddTarefaForm(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showAddOrientacaoDialog} onOpenChange={setShowAddOrientacaoDialog}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo VM ou Informativo</DialogTitle>
          </DialogHeader>
          <OrientacaoUploader onSuccess={onUploadOrientacaoSuccess} />
        </DialogContent>
      </Dialog>
    </>
  );
}
