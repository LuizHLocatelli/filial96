import { AddRotinaDialog } from "@/components/moveis/rotinas/components/AddRotinaDialog";
import { UseFormReturn } from "react-hook-form";
import { TarefaFormValues } from '../hooks/useTarefasOperations';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OrientacaoUploader } from "@/components/moveis/orientacoes/OrientacaoUploader";
import { Upload } from "lucide-react";

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

  const handleOrientacaoUploadSuccess = () => {
    onUploadOrientacaoSuccess();
    setShowAddOrientacaoDialog(false);
  };

  return (
    <>
      <AddRotinaDialog
        open={showAddRotinaDialog}
        onOpenChange={setShowAddRotinaDialog}
        onSubmit={onCreateRotina}
      />

      {/* Note: AddTarefaDialog needs to be created with proper interface */}
      {showAddTarefaForm && (
        <div>
          {/* AddTarefaDialog placeholder */}
        </div>
      )}
      
      {/* Dialog para upload de VM e Informativos */}
      <Dialog open={showAddOrientacaoDialog} onOpenChange={setShowAddOrientacaoDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center">
                <Upload className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              Novo VM ou Informativo
            </DialogTitle>
            <DialogDescription>
              Faça upload de documentos, orientações e informativos para a equipe
            </DialogDescription>
          </DialogHeader>
          
          <OrientacaoUploader onSuccess={handleOrientacaoUploadSuccess} />
        </DialogContent>
      </Dialog>
    </>
  );
}
