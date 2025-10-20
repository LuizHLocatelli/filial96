import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FlaskConical, CheckCircle2, Trash2, Info } from 'lucide-react';

interface ModoTesteControleProps {
  modoTeste: boolean;
  onModoTesteChange: (ativo: boolean) => void;
  onAplicarEscalas: () => Promise<void>;
  onDescartarEscalas: () => Promise<void>;
  quantidadeEscalasTeste?: number;
}

export function ModoTesteControle({
  modoTeste,
  onModoTesteChange,
  onAplicarEscalas,
  onDescartarEscalas,
  quantidadeEscalasTeste = 0
}: ModoTesteControleProps) {
  const [showAplicarDialog, setShowAplicarDialog] = useState(false);
  const [showDescartarDialog, setShowDescartarDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAplicar = async () => {
    setIsProcessing(true);
    try {
      await onAplicarEscalas();
      setShowAplicarDialog(false);
      onModoTesteChange(false);
    } catch (error) {
      console.error('Erro ao aplicar escalas:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDescartar = async () => {
    setIsProcessing(true);
    try {
      await onDescartarEscalas();
      setShowDescartarDialog(false);
      onModoTesteChange(false);
    } catch (error) {
      console.error('Erro ao descartar escalas:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Card className={`p-4 ${modoTeste ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-300' : ''}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <FlaskConical className={`h-5 w-5 mt-1 ${modoTeste ? 'text-blue-600' : 'text-muted-foreground'}`} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Label htmlFor="modo-teste" className="font-semibold text-base">
                  Modo de Teste
                </Label>
                {modoTeste && (
                  <Badge variant="default" className="bg-blue-600">
                    ATIVO
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {modoTeste
                  ? 'Você está em modo de teste. As escalas criadas não afetarão a escala real até que sejam aplicadas.'
                  : 'Ative o modo de teste para simular escalas sem afetar a produção.'
                }
              </p>
              {modoTeste && quantidadeEscalasTeste > 0 && (
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1 font-medium">
                  {quantidadeEscalasTeste} escala(s) de teste criada(s)
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Switch
                id="modo-teste"
                checked={modoTeste}
                onCheckedChange={onModoTesteChange}
                disabled={quantidadeEscalasTeste > 0}
              />
            </div>

            {modoTeste && quantidadeEscalasTeste > 0 && (
              <>
                <Button
                  onClick={() => setShowAplicarDialog(true)}
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Aplicar Escalas
                </Button>
                <Button
                  onClick={() => setShowDescartarDialog(true)}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Descartar
                </Button>
              </>
            )}
          </div>
        </div>

        {modoTeste && (
          <Alert className="mt-4 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900 dark:text-blue-100">
              <strong>Dica:</strong> Use o modo de teste para experimentar diferentes configurações de escalas.
              Você pode verificar conflitos e validações antes de aplicar as mudanças definitivamente.
            </AlertDescription>
          </Alert>
        )}
      </Card>

      {/* Dialog para aplicar escalas */}
      <AlertDialog open={showAplicarDialog} onOpenChange={setShowAplicarDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aplicar Escalas de Teste</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Você está prestes a aplicar <strong>{quantidadeEscalasTeste} escala(s)</strong> de teste para a produção.
              </p>
              <p className="text-yellow-600 dark:text-yellow-500 font-medium">
                ⚠️ Esta ação irá substituir qualquer escala de produção conflitante para as mesmas datas e funcionários.
              </p>
              <p>Deseja continuar?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAplicar}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? 'Aplicando...' : 'Sim, Aplicar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog para descartar escalas */}
      <AlertDialog open={showDescartarDialog} onOpenChange={setShowDescartarDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Descartar Escalas de Teste</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Você está prestes a descartar <strong>{quantidadeEscalasTeste} escala(s)</strong> de teste.
              </p>
              <p className="text-red-600 dark:text-red-500 font-medium">
                ⚠️ Esta ação é irreversível. Todas as escalas de teste serão permanentemente removidas.
              </p>
              <p>Deseja continuar?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDescartar}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? 'Descartando...' : 'Sim, Descartar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
