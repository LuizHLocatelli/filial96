
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, X, AlertTriangle, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Orientacao } from "../types";
import { useOrientacoesCrud } from "../hooks/useOrientacoesCrud";
import { useMobileDialog } from "@/hooks/useMobileDialog";

interface DeleteOrientacaoDialogProps {
  orientacao: Orientacao;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteOrientacaoDialog({
  orientacao,
  open,
  onOpenChange,
  onSuccess
}: DeleteOrientacaoDialogProps) {
  const { deleteOrientacao, isLoading } = useOrientacoesCrud();
  const { getMobileDialogProps, getMobileButtonProps } = useMobileDialog();
  const [tarefasRelacionadas, setTarefasRelacionadas] = useState<any[]>([]);
  const [carregandoTarefas, setCarregandoTarefas] = useState(false);

  // Verificar tarefas relacionadas quando o dialog abrir
  useEffect(() => {
    if (open && orientacao.id) {
      verificarTarefasRelacionadas();
    }
  }, [open, orientacao.id]);

  const verificarTarefasRelacionadas = async () => {
    try {
      setCarregandoTarefas(true);
      const { data, error } = await supabase
        .from('moveis_tarefas')
        .select('id, titulo')
        .eq('orientacao_id', orientacao.id);

      if (error) {
        console.error('Erro ao verificar tarefas:', error);
        return;
      }

      setTarefasRelacionadas(data || []);
    } catch (error) {
      console.error('Erro ao verificar tarefas relacionadas:', error);
    } finally {
      setCarregandoTarefas(false);
    }
  };

  const handleDelete = async () => {
    const success = await deleteOrientacao(orientacao.id);
    if (success) {
      onOpenChange(false);
      onSuccess();
    }
  };

  const tipoLabel = orientacao.tipo === 'vm' ? 'VM' : 'Informativo';
  const temTarefas = tarefasRelacionadas.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent {...getMobileDialogProps("lg", "80vh")} className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive text-base sm:text-lg">
            <Trash2 className="h-5 w-5" />
            Excluir {tipoLabel}
          </DialogTitle>
          <DialogDescription className="text-sm">
            Tem certeza que deseja excluir "{orientacao.titulo}"?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[50vh] overflow-y-auto">
          {carregandoTarefas ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2 text-sm text-muted-foreground">Verificando dependências...</span>
            </div>
          ) : temTarefas ? (
            <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                <div className="space-y-2">
                  <p className="font-medium text-sm">
                    Esta orientação possui {tarefasRelacionadas.length} tarefa(s) relacionada(s):
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm">
                    {tarefasRelacionadas.slice(0, 3).map((tarefa) => (
                      <li key={tarefa.id} className="flex items-center gap-2">
                        <FileText className="h-3 w-3 flex-shrink-0" />
                        <span className="break-words">{tarefa.titulo}</span>
                      </li>
                    ))}
                    {tarefasRelacionadas.length > 3 && (
                      <li className="text-muted-foreground text-xs">
                        ... e mais {tarefasRelacionadas.length - 3} tarefa(s)
                      </li>
                    )}
                  </ul>
                  <p className="text-xs sm:text-sm font-medium">
                    Ao excluir esta orientação, a relação com essas tarefas será removida, mas as tarefas serão mantidas.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertDescription className="text-sm">
                Esta ação não pode ser desfeita.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            {...getMobileButtonProps()}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading || carregandoTarefas}
            {...getMobileButtonProps()}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isLoading ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
