import { useState } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Users,
  AlertCircle,
  Settings
} from 'lucide-react';
import { CalendarioEscalas } from './components/CalendarioEscalas';
import { FormularioEscala } from './components/FormularioEscala';
import { ModoTesteControle } from './components/ModoTesteControle';
import { PainelValidacoes } from './components/PainelValidacoes';
import { GestaoFeriados } from './components/GestaoFeriados';
import { DialogEscalasDia } from './components/DialogEscalasDia';
import { ListaEscalasDetalhada } from './components/ListaEscalasDetalhada';
import { useEscalas } from './hooks/useEscalas';
import { useFeriados } from './hooks/useFeriados';
import type { DiaCalendario } from './types/escalasTypes';

export function EscalasGestao() {
  const [dataAtual, setDataAtual] = useState(new Date());
  const mes = dataAtual.getMonth() + 1;
  const ano = dataAtual.getFullYear();

  const [modoTeste, setModoTeste] = useState(false);
  const [dialogEscalaAberto, setDialogEscalaAberto] = useState(false);
  const [dialogFeriadosAberto, setDialogFeriadosAberto] = useState(false);
  const [dialogDiaAberto, setDialogDiaAberto] = useState(false);
  const [diaSelecionado, setDiaSelecionado] = useState<DiaCalendario | null>(null);

  const {
    escalas,
    isLoading: isLoadingEscalas,
    criarEscala,
    deletarEscala,
    verificarConflitos,
    aplicarEscalasTeste,
    descartarEscalasTeste
  } = useEscalas(mes, ano, modoTeste);

  const { feriados, isLoading: isLoadingFeriados } = useFeriados(ano);

  const handleMesAnterior = () => {
    setDataAtual(subMonths(dataAtual, 1));
  };

  const handleProximoMes = () => {
    setDataAtual(addMonths(dataAtual, 1));
  };

  const handleMesAtual = () => {
    setDataAtual(new Date());
  };

  const handleDiaClick = (dia: DiaCalendario) => {
    setDiaSelecionado(dia);
    // Se o dia tem escalas, mostrar o dialog de visualização
    // Se não tem, abrir direto o formulário de nova escala
    if (dia.escalas.length > 0) {
      setDialogDiaAberto(true);
    } else {
      setDialogEscalaAberto(true);
    }
  };

  const handleNovaEscala = () => {
    setDiaSelecionado(null);
    setDialogEscalaAberto(true);
  };

  const handleModoTesteChange = (ativo: boolean) => {
    if (escalas.length > 0 && !ativo) {
      // Não permitir desativar se houver escalas de teste
      return;
    }
    setModoTeste(ativo);
  };

  const isLoading = isLoadingEscalas || isLoadingFeriados;

  const escalasNoModoAtual = escalas.filter(e => e.modo_teste === modoTeste);
  // Contar apenas escalas que estão marcadas como modo_teste=true
  const quantidadeEscalasTeste = escalas.filter(e => e.modo_teste === true).length;

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <CalendarIcon className="h-6 w-6 text-primary" />
                Gestão de Escalas e Folgas
              </CardTitle>
              <CardDescription className="mt-2">
                Sistema de controle de escalas, domingos, feriados e folgas compensatórias
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <Button
                onClick={() => setDialogFeriadosAberto(true)}
                variant="outline"
                className="w-full sm:w-auto"
              >
                <Settings className="h-4 w-4 mr-2" />
                Feriados
              </Button>
              <Button onClick={handleNovaEscala} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Nova Escala
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Controle de Modo de Teste */}
      <ModoTesteControle
        modoTeste={modoTeste}
        onModoTesteChange={handleModoTesteChange}
        onAplicarEscalas={aplicarEscalasTeste}
        onDescartarEscalas={descartarEscalasTeste}
        quantidadeEscalasTeste={quantidadeEscalasTeste}
      />

      {/* Navegação de Mês */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              size="icon"
              onClick={handleMesAnterior}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold capitalize">
                {format(dataAtual, 'MMMM yyyy', { locale: ptBR })}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleMesAtual}
              >
                Hoje
              </Button>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handleProximoMes}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Calendário */}
          {isLoading ? (
            <div className="flex items-center justify-center h-[500px]">
              <div className="text-center space-y-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground">Carregando escalas...</p>
              </div>
            </div>
          ) : (
            <CalendarioEscalas
              mes={mes}
              ano={ano}
              escalas={escalasNoModoAtual}
              feriados={feriados}
              onDiaClick={handleDiaClick}
              modoTeste={modoTeste}
            />
          )}
        </CardContent>
      </Card>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Escalas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{escalasNoModoAtual.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {modoTeste ? 'No modo de teste' : 'No mês atual'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Folgas Marcadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {escalasNoModoAtual.filter(e => e.tipo === 'folga').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Folgas no período
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Domingos/Feriados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {escalasNoModoAtual.filter(e =>
                e.tipo === 'domingo_trabalhado' || e.tipo === 'feriado_trabalhado'
              ).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Trabalhados no período
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Painel de Validações */}
      <PainelValidacoes
        escalas={escalasNoModoAtual}
        onVerificarConflitos={verificarConflitos}
        mesAtual={mes}
        anoAtual={ano}
      />

      {/* Formulário de Escala */}
      <FormularioEscala
        open={dialogEscalaAberto}
        onOpenChange={setDialogEscalaAberto}
        onSubmit={criarEscala}
        modoTeste={modoTeste}
        escalasExistentes={escalasNoModoAtual}
        dataInicial={diaSelecionado?.data}
      />

      {/* Gestão de Feriados */}
      <GestaoFeriados
        open={dialogFeriadosAberto}
        onOpenChange={setDialogFeriadosAberto}
        ano={ano}
      />

      {/* Dialog de Escalas do Dia */}
      <DialogEscalasDia
        open={dialogDiaAberto}
        onOpenChange={setDialogDiaAberto}
        diaInfo={diaSelecionado}
        onDeletarEscala={deletarEscala}
      />

      {/* Lista Detalhada de Escalas */}
      <ListaEscalasDetalhada
        escalas={escalasNoModoAtual}
        onDeletarEscala={deletarEscala}
        modoTeste={modoTeste}
      />
    </div>
  );
}
