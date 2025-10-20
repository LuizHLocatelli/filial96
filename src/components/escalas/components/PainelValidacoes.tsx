import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Calendar,
  User,
  Key
} from 'lucide-react';
import { format, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Escala, ConflitosEscala } from '../types/escalasTypes';

interface PainelValidacoesProps {
  escalas: Escala[];
  onVerificarConflitos: (funcionarioId: string, dataInicio: string, dataFim: string) => Promise<ConflitosEscala[]>;
  mesAtual: number;
  anoAtual: number;
}

interface ProblemaDetectado {
  tipo: 'erro' | 'aviso' | 'info';
  funcionario: string;
  funcionarioId: string;
  data: string;
  mensagem: string;
  escalaId?: string;
}

export function PainelValidacoes({
  escalas,
  onVerificarConflitos,
  mesAtual,
  anoAtual
}: PainelValidacoesProps) {
  const [problemas, setProblemas] = useState<ProblemaDetectado[]>([]);
  const [isVerificando, setIsVerificando] = useState(false);

  useEffect(() => {
    verificarTodosProblemas();
  }, [escalas, mesAtual, anoAtual]);

  const verificarTodosProblemas = async () => {
    setIsVerificando(true);
    const problemasDetectados: ProblemaDetectado[] = [];

    try {
      // Agrupar escalas por funcionário
      const escalasPorFuncionario = escalas.reduce((acc, escala) => {
        if (!acc[escala.funcionario_id]) {
          acc[escala.funcionario_id] = [];
        }
        acc[escala.funcionario_id].push(escala);
        return acc;
      }, {} as Record<string, Escala[]>);

      // Verificar problemas para cada funcionário
      for (const [funcionarioId, escalasFunc] of Object.entries(escalasPorFuncionario)) {
        const funcionarioNome = escalasFunc[0]?.funcionario_nome || 'Funcionário';

        // Verificar folgas em sexta-feira
        const folgasSexta = escalasFunc.filter(e => {
          const data = new Date(e.data + 'T00:00:00');
          return e.tipo === 'folga' && getDay(data) === 5;
        });

        folgasSexta.forEach(escala => {
          problemasDetectados.push({
            tipo: 'erro',
            funcionario: funcionarioNome,
            funcionarioId,
            data: escala.data,
            mensagem: 'Folga marcada em uma sexta-feira (não permitido)',
            escalaId: escala.id
          });
        });

        // Verificar domingos/feriados trabalhados sem folga compensatória
        const semFolgaCompensatoria = escalasFunc.filter(e =>
          (e.tipo === 'domingo_trabalhado' || e.tipo === 'feriado_trabalhado') &&
          !e.folga_compensatoria_id
        );

        semFolgaCompensatoria.forEach(escala => {
          problemasDetectados.push({
            tipo: 'erro',
            funcionario: funcionarioNome,
            funcionarioId,
            data: escala.data,
            mensagem: `${escala.tipo === 'domingo_trabalhado' ? 'Domingo' : 'Feriado'} trabalhado sem folga compensatória definida`,
            escalaId: escala.id
          });
        });

        // Verificar domingos trabalhados sem abertura no sábado
        const domingosTrabalhados = escalasFunc.filter(e =>
          e.tipo === 'domingo_trabalhado' ||
          (e.tipo === 'trabalho' && getDay(new Date(e.data + 'T00:00:00')) === 0)
        );

        domingosTrabalhados.forEach(escala => {
          const dataDomingo = new Date(escala.data + 'T00:00:00');
          const dataSabado = new Date(dataDomingo);
          dataSabado.setDate(dataSabado.getDate() - 1);
          const sabadoStr = format(dataSabado, 'yyyy-MM-dd');

          const temAberturaNoSabado = escalasFunc.some(e =>
            e.data === sabadoStr && e.eh_abertura
          );

          if (!temAberturaNoSabado) {
            problemasDetectados.push({
              tipo: 'aviso',
              funcionario: funcionarioNome,
              funcionarioId,
              data: escala.data,
              mensagem: 'Domingo trabalhado sem abertura registrada no sábado anterior',
              escalaId: escala.id
            });
          }
        });

        // Verificar conflitos via RPC
        if (escalasFunc.length > 0) {
          const dataInicio = `${anoAtual}-${String(mesAtual).padStart(2, '0')}-01`;
          const dataFim = `${anoAtual}-${String(mesAtual).padStart(2, '0')}-31`;

          const conflitos = await onVerificarConflitos(funcionarioId, dataInicio, dataFim);

          conflitos.forEach(conflito => {
            // Evitar duplicatas
            const jaExiste = problemasDetectados.some(p =>
              p.funcionarioId === funcionarioId &&
              p.data === conflito.data &&
              p.mensagem.includes(conflito.mensagem)
            );

            if (!jaExiste) {
              problemasDetectados.push({
                tipo: conflito.tipo_conflito === 'folga_sexta' ? 'erro' : 'aviso',
                funcionario: funcionarioNome,
                funcionarioId,
                data: conflito.data,
                mensagem: conflito.mensagem
              });
            }
          });
        }
      }
    } catch (error) {
      console.error('Erro ao verificar problemas:', error);
    }

    setProblemas(problemasDetectados);
    setIsVerificando(false);
  };

  const erros = problemas.filter(p => p.tipo === 'erro');
  const avisos = problemas.filter(p => p.tipo === 'aviso');
  const infos = problemas.filter(p => p.tipo === 'info');

  const temProblemas = problemas.length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {temProblemas ? (
                <>
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  Validações e Conflitos
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Todas as Validações OK
                </>
              )}
            </CardTitle>
            <CardDescription>
              {isVerificando ? 'Verificando escalas...' : 'Problemas detectados nas escalas do mês'}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {erros.length > 0 && (
              <Badge variant="destructive" className="text-sm">
                {erros.length} {erros.length === 1 ? 'Erro' : 'Erros'}
              </Badge>
            )}
            {avisos.length > 0 && (
              <Badge variant="secondary" className="text-sm bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                {avisos.length} {avisos.length === 1 ? 'Aviso' : 'Avisos'}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {!temProblemas && !isVerificando ? (
          <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-900 dark:text-green-100">
              Todas as escalas estão de acordo com as regras estabelecidas. Nenhum conflito detectado!
            </AlertDescription>
          </Alert>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {/* Erros */}
              {erros.length > 0 && (
                <div>
                  <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    Erros Críticos ({erros.length})
                  </h4>
                  <div className="space-y-2">
                    {erros.map((problema, index) => (
                      <Alert key={`erro-${index}`} variant="destructive">
                        <AlertDescription>
                          <div className="flex items-start gap-2">
                            <User className="h-4 w-4 shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-medium">{problema.funcionario}</p>
                              <p className="text-sm flex items-center gap-1 mt-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(problema.data + 'T00:00:00'), "dd 'de' MMMM", { locale: ptBR })}
                              </p>
                              <p className="text-sm mt-1">{problema.mensagem}</p>
                            </div>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              )}

              {erros.length > 0 && avisos.length > 0 && <Separator />}

              {/* Avisos */}
              {avisos.length > 0 && (
                <div>
                  <h4 className="font-semibold text-yellow-600 dark:text-yellow-400 mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Avisos ({avisos.length})
                  </h4>
                  <div className="space-y-2">
                    {avisos.map((problema, index) => (
                      <Alert key={`aviso-${index}`} className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
                        <AlertDescription className="text-yellow-900 dark:text-yellow-100">
                          <div className="flex items-start gap-2">
                            <User className="h-4 w-4 shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-medium">{problema.funcionario}</p>
                              <p className="text-sm flex items-center gap-1 mt-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(problema.data + 'T00:00:00'), "dd 'de' MMMM", { locale: ptBR })}
                              </p>
                              <p className="text-sm mt-1">{problema.mensagem}</p>
                            </div>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
