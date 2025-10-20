import { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Escala, Feriado, DiaCalendario } from '../types/escalasTypes';
import { CalendarDays, AlertTriangle, Key, User } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CalendarioEscalasProps {
  mes: number;
  ano: number;
  escalas: Escala[];
  feriados: Feriado[];
  onDiaClick?: (dia: DiaCalendario) => void;
  modoTeste?: boolean;
}

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function CalendarioEscalas({
  mes,
  ano,
  escalas,
  feriados,
  onDiaClick,
  modoTeste = false
}: CalendarioEscalasProps) {

  const diasDoMes = useMemo(() => {
    const primeiroDia = startOfMonth(new Date(ano, mes - 1));
    const ultimoDia = endOfMonth(new Date(ano, mes - 1));
    const dias = eachDayOfInterval({ start: primeiroDia, end: ultimoDia });

    return dias.map(dia => {
      const dataStr = format(dia, 'yyyy-MM-dd');
      const diaSemana = getDay(dia);
      const ehDomingo = diaSemana === 0;
      const ehSabado = diaSemana === 6;
      const ehSexta = diaSemana === 5;

      const feriado = feriados.find(f => f.data === dataStr);
      const ehFeriado = !!feriado;

      const escalasDoDia = escalas.filter(e => e.data === dataStr);

      return {
        dia: dia.getDate(),
        data: dataStr,
        ehDomingo,
        ehSabado,
        ehSexta,
        ehFeriado,
        feriado,
        escalas: escalasDoDia,
        conflitos: []
      } as DiaCalendario;
    });
  }, [mes, ano, escalas, feriados]);

  const primeiroDiaSemana = getDay(startOfMonth(new Date(ano, mes - 1)));
  const diasVaziosInicio = Array(primeiroDiaSemana).fill(null);

  return (
    <div className="w-full">
      {/* Cabeçalho com dias da semana */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {DIAS_SEMANA.map((dia, index) => (
          <div
            key={dia}
            className={cn(
              "text-center font-semibold text-sm py-2",
              index === 0 ? "text-red-600" : "text-muted-foreground",
              index === 6 && "text-blue-600"
            )}
          >
            {dia}
          </div>
        ))}
      </div>

      {/* Grade do calendário */}
      <div className="grid grid-cols-7 gap-2">
        {/* Dias vazios no início */}
        {diasVaziosInicio.map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}

        {/* Dias do mês */}
        {diasDoMes.map((diaInfo) => (
          <CalendarioDia
            key={diaInfo.data}
            diaInfo={diaInfo}
            onClick={() => onDiaClick?.(diaInfo)}
            modoTeste={modoTeste}
          />
        ))}
      </div>

      {/* Legenda */}
      <div className="mt-6 p-4 bg-muted/30 rounded-lg">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          Legenda
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded" />
            <span>Domingo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-100 border-2 border-orange-300 rounded" />
            <span>Feriado</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="text-xs">F</Badge>
            <span>Folga</span>
          </div>
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-blue-600" />
            <span>Abertura</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CalendarioDiaProps {
  diaInfo: DiaCalendario;
  onClick: () => void;
  modoTeste: boolean;
}

function CalendarioDia({ diaInfo, onClick, modoTeste }: CalendarioDiaProps) {
  const { dia, ehDomingo, ehSabado, ehFeriado, feriado, escalas } = diaInfo;

  const temFolga = escalas.some(e => e.tipo === 'folga');
  const temTrabalho = escalas.some(e =>
    e.tipo === 'trabalho' ||
    e.tipo === 'domingo_trabalhado' ||
    e.tipo === 'feriado_trabalhado'
  );
  const temAbertura = escalas.some(e => e.eh_abertura);
  const temConflito = escalas.some(e =>
    (e.tipo === 'domingo_trabalhado' || e.tipo === 'feriado_trabalhado') &&
    !e.folga_compensatoria_id
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card
            className={cn(
              "aspect-square p-2 cursor-pointer transition-all hover:shadow-md relative overflow-hidden",
              ehDomingo && "bg-red-50 border-red-200 dark:bg-red-950/20",
              ehFeriado && "bg-orange-50 border-orange-200 dark:bg-orange-950/20",
              temConflito && "border-2 border-red-500",
              modoTeste && "border-dashed border-2 border-blue-400"
            )}
            onClick={onClick}
          >
            {/* Número do dia */}
            <div className={cn(
              "text-lg font-bold mb-1",
              ehDomingo && "text-red-600",
              ehFeriado && "text-orange-600"
            )}>
              {dia}
            </div>

            {/* Nome do feriado */}
            {ehFeriado && feriado && (
              <div className="text-[10px] text-orange-700 dark:text-orange-400 font-medium mb-1 line-clamp-1">
                {feriado.nome}
              </div>
            )}

            {/* Escalas do dia */}
            <div className="space-y-1">
              {escalas.slice(0, 2).map((escala) => (
                <div
                  key={escala.id}
                  className="flex items-center gap-1 text-[10px] bg-background/50 rounded px-1 py-0.5"
                >
                  <User className="h-3 w-3 shrink-0" />
                  <span className="truncate">{escala.funcionario_nome}</span>
                  {escala.tipo === 'folga' && (
                    <Badge variant="destructive" className="text-[8px] h-4 px-1">F</Badge>
                  )}
                  {escala.eh_abertura && (
                    <Key className="h-3 w-3 text-blue-600 shrink-0" />
                  )}
                </div>
              ))}

              {escalas.length > 2 && (
                <div className="text-[10px] text-muted-foreground text-center">
                  +{escalas.length - 2} mais
                </div>
              )}
            </div>

            {/* Ícone de conflito */}
            {temConflito && (
              <div className="absolute top-1 right-1">
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </div>
            )}
          </Card>
        </TooltipTrigger>

        <TooltipContent>
          <div className="space-y-1">
            <p className="font-semibold">
              {format(new Date(diaInfo.data), "d 'de' MMMM", { locale: ptBR })}
            </p>
            {ehFeriado && feriado && (
              <p className="text-orange-600">{feriado.nome}</p>
            )}
            {escalas.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhuma escala</p>
            ) : (
              <div className="space-y-1">
                {escalas.map(e => (
                  <div key={e.id} className="text-sm">
                    {e.funcionario_nome} - {
                      e.tipo === 'folga' ? 'Folga' :
                      e.tipo === 'feriado_trabalhado' ? 'Feriado Trabalhado' :
                      e.tipo === 'domingo_trabalhado' ? 'Domingo Trabalhado' :
                      'Trabalho'
                    }
                    {e.eh_abertura && ' (Abertura)'}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
