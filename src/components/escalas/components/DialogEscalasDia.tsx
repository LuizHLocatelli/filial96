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
        <DialogContent className="max-w-2xl max-h-[80vh] md:max-h-[85vh] lg:max-h-[90vh] overflow-hidden flex flex-col p-0">
          {/* Fixed Header */}
          <div className="flex-shrink-0 p-3 md:p-5 lg:p-6 pb-0">
            <DialogHeader className="pr-8">
              <DialogTitle className="flex items-center gap-2 text-base md:text-lg">
                <Calendar className="h-4 w-4 md:h-5 md:w-5" />
                <span className="break-words">
                  {format(new Date(diaInfo.data + 'T00:00:00'), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs md:text-sm">
                {diaInfo.ehFeriado && diaInfo.feriado && (
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 text-xs">
                      Feriado: {diaInfo.feriado.nome}
                    </Badge>
                  </div>
                )}
                {diaInfo.ehDomingo && (
                  <Badge variant="outline" className="bg-red-50 text-red-700 mt-2 text-xs">
                    Domingo
                  </Badge>
                )}
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-3 md:p-5 lg:p-6 pt-3">
            <div className="space-y-3 md:space-y-4">
              {diaInfo.escalas.length === 0 ? (
                <div className="text-center py-6 md:py-8 text-muted-foreground">
                  <Calendar className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-xs md:text-sm">Nenhuma escala cadastrada para este dia</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {diaInfo.escalas.map((escala, index) => (
                    <div key={escala.id}>
                      <Card className="p-3 md:p-4 hover:bg-accent/50 transition-colors">
                        <div className="flex items-start justify-between gap-3 md:gap-4">
                          <div className="flex-1 space-y-2 md:space-y-3">
                            {/* Nome e Tipo */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                <User className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                                <span className="font-semibold text-xs md:text-sm">
                                  {escala.funcionario_nome || 'Funcionário'}
                                </span>
                              </div>
                              <Badge variant={getTipoColor(escala.tipo)} className="text-xs">
                                {getTipoLabel(escala.tipo)}
                              </Badge>
                              {escala.eh_abertura && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
                                  <Key className="h-3 w-3 mr-1" />
                                  Abertura
                                </Badge>
                              )}
                            </div>

                            {/* Folga Compensatória */}
                            {escala.folga_compensatoria_id && (
                              <div className="text-xs md:text-sm text-muted-foreground">
                                ✓ Possui folga compensatória vinculada
                              </div>
                            )}

                            {/* Alerta de conflito */}
                            {(escala.tipo === 'domingo_trabalhado' || escala.tipo === 'feriado_trabalhado') &&
                             !escala.folga_compensatoria_id && (
                              <div className="flex items-center gap-2 text-xs md:text-sm text-red-600">
                                <AlertTriangle className="h-3 w-3 md:h-4 md:w-4" />
                                <span>Sem folga compensatória definida</span>
                              </div>
                            )}

                            {/* Observação */}
                            {escala.observacao && (
                              <div className="text-xs md:text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                                <strong>Obs:</strong> {escala.observacao}
                              </div>
                            )}
                          </div>

                          {/* Botão Excluir */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEscalaParaDeletar(escala)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 md:h-10 md:w-10"
                          >
                            <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                        </div>
                      </Card>

                      {index < diaInfo.escalas.length - 1 && (
                        <Separator className="my-2 md:my-3" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={!!escalaParaDeletar} onOpenChange={() => setEscalaParaDeletar(null)}>
        <AlertDialogContent className="p-3 md:p-5 lg:p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base md:text-lg">Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 text-xs md:text-sm">
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
          <AlertDialogFooter className="flex-col md:flex-row gap-2">
            <AlertDialogCancel disabled={isDeletando} className="w-full md:w-auto h-9 md:h-10 text-xs md:text-sm">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmarDelecao}
              disabled={isDeletando}
              className="bg-red-600 hover:bg-red-700 w-full md:w-auto h-9 md:h-10 text-xs md:text-sm"
            >
              {isDeletando ? 'Excluindo...' : 'Sim, Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
