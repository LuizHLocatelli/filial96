import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { User, Trash2, Key, Calendar, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import type { DiaCalendario, Escala } from '../types/escalasTypes';

interface DialogEscalasDiaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  diaInfo: DiaCalendario | null;
  onDeletarEscala: (id: string) => Promise<void>;
}

export function DialogEscalasDia({
  open,
  onOpenChange,
  diaInfo,
  onDeletarEscala
}: DialogEscalasDiaProps) {
  const [escalaParaDeletar, setEscalaParaDeletar] = useState<Escala | null>(null);
  const [isDeletando, setIsDeletando] = useState(false);

  if (!diaInfo) return null;

  const handleConfirmarDelecao = async () => {
    if (!escalaParaDeletar) return;

    setIsDeletando(true);
    try {
      await onDeletarEscala(escalaParaDeletar.id);
      setEscalaParaDeletar(null);

      // Se não houver mais escalas, fechar o dialog principal
      if (diaInfo.escalas.length <= 1) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Erro ao deletar escala:', error);
    } finally {
      setIsDeletando(false);
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'trabalho': return 'Trabalho';
      case 'folga': return 'Folga';
      case 'domingo_trabalhado': return 'Domingo Trabalhado';
      case 'feriado_trabalhado': return 'Feriado Trabalhado';
      default: return tipo;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'folga': return 'destructive';
      case 'domingo_trabalhado': return 'default';
      case 'feriado_trabalhado': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {format(new Date(diaInfo.data + 'T00:00:00'), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </DialogTitle>
            <DialogDescription>
              {diaInfo.ehFeriado && diaInfo.feriado && (
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="bg-orange-50 text-orange-700">
                    Feriado: {diaInfo.feriado.nome}
                  </Badge>
                </div>
              )}
              {diaInfo.ehDomingo && (
                <Badge variant="outline" className="bg-red-50 text-red-700 mt-2">
                  Domingo
                </Badge>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {diaInfo.escalas.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma escala cadastrada para este dia</p>
              </div>
            ) : (
              <ScrollArea className="max-h-[500px] pr-4">
                <div className="space-y-3">
                  {diaInfo.escalas.map((escala, index) => (
                    <div key={escala.id}>
                      <Card className="p-4 hover:bg-accent/50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            {/* Nome e Tipo */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-semibold">
                                  {escala.funcionario_nome || 'Funcionário'}
                                </span>
                              </div>
                              <Badge variant={getTipoColor(escala.tipo)}>
                                {getTipoLabel(escala.tipo)}
                              </Badge>
                              {escala.eh_abertura && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                  <Key className="h-3 w-3 mr-1" />
                                  Abertura
                                </Badge>
                              )}
                            </div>

                            {/* Folga Compensatória */}
                            {escala.folga_compensatoria_id && (
                              <div className="text-sm text-muted-foreground">
                                ✓ Possui folga compensatória vinculada
                              </div>
                            )}

                            {/* Alerta de conflito */}
                            {(escala.tipo === 'domingo_trabalhado' || escala.tipo === 'feriado_trabalhado') &&
                             !escala.folga_compensatoria_id && (
                              <div className="flex items-center gap-2 text-sm text-red-600">
                                <AlertTriangle className="h-4 w-4" />
                                <span>Sem folga compensatória definida</span>
                              </div>
                            )}

                            {/* Observação */}
                            {escala.observacao && (
                              <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                                <strong>Obs:</strong> {escala.observacao}
                              </div>
                            )}
                          </div>

                          {/* Botão Excluir */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEscalaParaDeletar(escala)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>

                      {index < diaInfo.escalas.length - 1 && (
                        <Separator className="my-3" />
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={!!escalaParaDeletar} onOpenChange={() => setEscalaParaDeletar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Tem certeza que deseja excluir a escala de{' '}
                <strong>{escalaParaDeletar?.funcionario_nome}</strong> para o dia{' '}
                <strong>{diaInfo && format(new Date(diaInfo.data + 'T00:00:00'), "dd/MM/yyyy")}</strong>?
              </p>
              {escalaParaDeletar?.eh_abertura && (
                <p className="text-yellow-600 dark:text-yellow-500 font-medium">
                  ⚠️ Esta é uma escala de abertura.
                </p>
              )}
              {escalaParaDeletar?.folga_compensatoria_id && (
                <p className="text-yellow-600 dark:text-yellow-500 font-medium">
                  ⚠️ Esta escala possui folga compensatória vinculada.
                </p>
              )}
              <p className="text-red-600 dark:text-red-500 font-medium">
                Esta ação não pode ser desfeita.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletando}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmarDelecao}
              disabled={isDeletando}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeletando ? 'Excluindo...' : 'Sim, Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
