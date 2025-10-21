import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { format, getDay, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EscalaFormData, TipoEscala, Funcionario, Escala } from '../types/escalasTypes';
import { useFuncionarios } from '../hooks/useFuncionarios';

interface FormularioEscalaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: EscalaFormData) => Promise<void>;
  modoTeste: boolean;
  escalaParaEditar?: Escala | null;
  escalasExistentes?: Escala[];
  dataInicial?: string;
}

interface FormData {
  funcionario_id: string;
  data: Date | undefined;
  tipo: TipoEscala;
  folga_compensatoria_data?: Date | undefined;
  observacao?: string;
}

export function FormularioEscala({
  open,
  onOpenChange,
  onSubmit,
  modoTeste,
  escalaParaEditar,
  escalasExistentes = [],
  dataInicial
}: FormularioEscalaProps) {
  const { funcionarios, isLoading: isLoadingFuncionarios } = useFuncionarios();
  const [validacoes, setValidacoes] = useState<{
    erros: string[];
    avisos: string[];
    infos: string[];
  }>({ erros: [], avisos: [], infos: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    defaultValues: {
      funcionario_id: escalaParaEditar?.funcionario_id || '',
      data: escalaParaEditar?.data ? parse(escalaParaEditar.data, 'yyyy-MM-dd', new Date()) :
            dataInicial ? parse(dataInicial, 'yyyy-MM-dd', new Date()) : undefined,
      tipo: escalaParaEditar?.tipo || 'trabalho',
      folga_compensatoria_data: undefined,
      observacao: escalaParaEditar?.observacao || ''
    }
  });

  const dataAtual = form.watch('data');
  const tipoAtual = form.watch('tipo');
  const funcionarioAtual = form.watch('funcionario_id');
  const folgaCompensatoriaData = form.watch('folga_compensatoria_data');

  // Resetar formulário quando o dialog abrir ou quando escalaParaEditar/dataInicial mudar
  useEffect(() => {
    if (open) {
      form.reset({
        funcionario_id: escalaParaEditar?.funcionario_id || '',
        data: escalaParaEditar?.data ? parse(escalaParaEditar.data, 'yyyy-MM-dd', new Date()) :
              dataInicial ? parse(dataInicial, 'yyyy-MM-dd', new Date()) : undefined,
        tipo: escalaParaEditar?.tipo || 'trabalho',
        folga_compensatoria_data: undefined,
        observacao: escalaParaEditar?.observacao || ''
      });
    }
  }, [open, escalaParaEditar, dataInicial, form]);

  // Validações em tempo real
  useEffect(() => {
    if (!dataAtual || !funcionarioAtual) {
      setValidacoes({ erros: [], avisos: [], infos: [] });
      return;
    }

    const erros: string[] = [];
    const avisos: string[] = [];
    const infos: string[] = [];

    const diaSemana = getDay(dataAtual);
    const ehDomingo = diaSemana === 0;
    const ehSabado = diaSemana === 6;
    const ehSexta = diaSemana === 5;

    // REGRA 1: Proibir folgas às sextas-feiras
    if (tipoAtual === 'folga' && ehSexta) {
      erros.push('❌ Folgas às sextas-feiras não são permitidas. Por favor, selecione outro dia.');
    }

    // REGRA 2: Domingo trabalhado → abertura no sábado
    if ((tipoAtual === 'domingo_trabalhado' || (tipoAtual === 'trabalho' && ehDomingo)) && ehDomingo) {
      const dataStr = format(dataAtual, 'yyyy-MM-dd');
      const sabadoAnterior = new Date(dataAtual);
      sabadoAnterior.setDate(sabadoAnterior.getDate() - 1);
      const sabadoStr = format(sabadoAnterior, 'yyyy-MM-dd');

      const temEscalaSabado = escalasExistentes.some(
        e => e.funcionario_id === funcionarioAtual && e.data === sabadoStr
      );

      if (temEscalaSabado) {
        infos.push(`ℹ️ Este funcionário será automaticamente designado para abertura no sábado ${format(sabadoAnterior, "dd/MM", { locale: ptBR })}.`);
      } else {
        infos.push(`ℹ️ Uma escala de abertura no sábado ${format(sabadoAnterior, "dd/MM", { locale: ptBR })} será criada automaticamente.`);
      }
    }

    // REGRA 3: Trabalho em domingo/feriado requer folga compensatória
    if (tipoAtual === 'domingo_trabalhado' || tipoAtual === 'feriado_trabalhado') {
      if (!folgaCompensatoriaData) {
        erros.push('❌ Trabalho em domingo/feriado requer folga compensatória. Selecione uma data para folga.');
      } else {
        const diaFolga = getDay(folgaCompensatoriaData);

        if (diaFolga === 5) {
          erros.push('❌ A folga compensatória não pode ser uma sexta-feira.');
        } else {
          infos.push('✅ Folga compensatória selecionada.');
        }
      }
    }

    // Verificar se já existe escala para este funcionário nesta data
    // IMPORTANTE: Um funcionário só pode ter UMA escala por dia (constraint do banco)
    // Múltiplos funcionários PODEM trabalhar no mesmo dia
    const escalaExistente = escalasExistentes.find(
      e => e.funcionario_id === funcionarioAtual &&
           e.data === format(dataAtual, 'yyyy-MM-dd') &&
           e.id !== escalaParaEditar?.id
    );

    if (escalaExistente) {
      erros.push(`❌ ${escalaExistente.funcionario_nome || 'Este funcionário'} já possui uma escala (${escalaExistente.tipo}) nesta data. Um funcionário não pode ter múltiplas escalas no mesmo dia.`);
    }

    // Verificar se já existe escala na data da folga compensatória
    // Se já existir, será reutilizada ao invés de criar uma nova
    if (folgaCompensatoriaData && (tipoAtual === 'domingo_trabalhado' || tipoAtual === 'feriado_trabalhado')) {
      const escalaExistenteFolga = escalasExistentes.find(
        e => e.funcionario_id === funcionarioAtual &&
             e.data === format(folgaCompensatoriaData, 'yyyy-MM-dd')
      );

      if (escalaExistenteFolga) {
        infos.push(`ℹ️ Este funcionário já possui uma escala (${escalaExistenteFolga.tipo}) na data da folga compensatória. A escala existente será vinculada como folga compensatória.`);
      }
    }

    setValidacoes({ erros, avisos, infos });
  }, [dataAtual, tipoAtual, funcionarioAtual, folgaCompensatoriaData, escalasExistentes, escalaParaEditar]);

  const handleSubmit = async (data: FormData) => {
    if (validacoes.erros.length > 0) {
      return;
    }

    if (!data.data) {
      return;
    }

    setIsSubmitting(true);
    try {
      let folgaCompensatoriaId: string | null = null;

      // Se tiver folga compensatória, criar primeiro e pegar o ID
      if (data.folga_compensatoria_data &&
          (data.tipo === 'domingo_trabalhado' || data.tipo === 'feriado_trabalhado')) {

        const folgaDataStr = format(data.folga_compensatoria_data, 'yyyy-MM-dd');

        // Verificar se já existe escala na data da folga compensatória
        const jaExisteFolga = escalasExistentes.some(
          e => e.funcionario_id === data.funcionario_id &&
               e.data === folgaDataStr &&
               e.modo_teste === modoTeste
        );

        if (!jaExisteFolga) {
          const folgaData: EscalaFormData = {
            funcionario_id: data.funcionario_id,
            data: folgaDataStr,
            tipo: 'folga',
            observacao: `Folga compensatória referente a ${data.tipo === 'domingo_trabalhado' ? 'domingo' : 'feriado'} trabalhado em ${format(data.data, 'dd/MM/yyyy')}`,
            modo_teste: modoTeste
          };

          // Criar a folga e obter o ID retornado
          // O mutateAsync retorna o resultado da mutation que contém o objeto criado
          const folgaCriada = await onSubmit(folgaData) as any;

          // Garantir que capturamos o ID correto do objeto retornado
          if (folgaCriada && typeof folgaCriada === 'object') {
            folgaCompensatoriaId = folgaCriada.id || null;
          }

          console.log('Folga compensatória criada:', folgaCriada, 'ID:', folgaCompensatoriaId);
        } else {
          // Se já existe, buscar o ID da escala existente
          const escalaExistente = escalasExistentes.find(
            e => e.funcionario_id === data.funcionario_id &&
                 e.data === folgaDataStr &&
                 e.modo_teste === modoTeste
          );
          if (escalaExistente) {
            folgaCompensatoriaId = escalaExistente.id;
            console.log('Folga compensatória já existe, usando ID:', folgaCompensatoriaId);
          }
        }
      }

      // Criar a escala principal com o ID da folga compensatória
      const escalaData: EscalaFormData = {
        funcionario_id: data.funcionario_id,
        data: format(data.data, 'yyyy-MM-dd'),
        tipo: data.tipo,
        observacao: data.observacao || null,
        modo_teste: modoTeste,
        folga_compensatoria_id: folgaCompensatoriaId
      };

      console.log('Criando escala principal com dados:', escalaData);

      await onSubmit(escalaData);

      // Se for domingo trabalhado, criar escala de abertura no sábado anterior
      if (data.tipo === 'domingo_trabalhado' && data.data) {
        const diaSemana = getDay(data.data);
        if (diaSemana === 0) { // Domingo
          const sabadoAnterior = new Date(data.data);
          sabadoAnterior.setDate(sabadoAnterior.getDate() - 1);
          const sabadoStr = format(sabadoAnterior, 'yyyy-MM-dd');

          // Verificar se já não existe escala para este funcionário no sábado
          const temEscalaSabado = escalasExistentes.some(
            e => e.funcionario_id === data.funcionario_id &&
                 e.data === sabadoStr &&
                 e.modo_teste === modoTeste
          );

          if (!temEscalaSabado) {
            const escalaSabado: EscalaFormData = {
              funcionario_id: data.funcionario_id,
              data: sabadoStr,
              tipo: 'trabalho',
              eh_abertura: true,
              observacao: `Abertura automática - Domingo trabalhado em ${format(data.data, 'dd/MM/yyyy')}`,
              modo_teste: modoTeste
            };

            console.log('Criando escala de abertura no sábado:', escalaSabado);
            await onSubmit(escalaSabado);
          } else {
            console.log('Escala no sábado já existe, pulando criação');
          }
        }
      }

      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar escala:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const mostrarCampoFolgaCompensatoria =
    tipoAtual === 'domingo_trabalhado' || tipoAtual === 'feriado_trabalhado';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {escalaParaEditar ? 'Editar Escala' : 'Nova Escala'}
            {modoTeste && (
              <Badge variant="outline" className="ml-2">Modo Teste</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {escalaParaEditar
              ? 'Edite as informações da escala'
              : 'Preencha os dados para criar uma nova escala'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Funcionário */}
            <FormField
              control={form.control}
              name="funcionario_id"
              rules={{ required: 'Selecione um funcionário' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Funcionário *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoadingFuncionarios}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um funcionário" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {funcionarios.map((func) => (
                        <SelectItem key={func.id} value={func.id}>
                          {func.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Data */}
            <FormField
              control={form.control}
              name="data"
              rules={{ required: 'Selecione uma data' }}
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        locale={ptBR}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tipo */}
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="trabalho">Trabalho Normal</SelectItem>
                      <SelectItem value="folga">Folga</SelectItem>
                      <SelectItem value="domingo_trabalhado">Domingo Trabalhado</SelectItem>
                      <SelectItem value="feriado_trabalhado">Feriado Trabalhado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {field.value === 'folga' && 'Dia de folga do funcionário'}
                    {field.value === 'trabalho' && 'Dia normal de trabalho'}
                    {field.value === 'domingo_trabalhado' && 'Trabalho em domingo (requer folga compensatória)'}
                    {field.value === 'feriado_trabalhado' && 'Trabalho em feriado (requer folga compensatória)'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Folga Compensatória */}
            {mostrarCampoFolgaCompensatoria && (
              <FormField
                control={form.control}
                name="folga_compensatoria_data"
                rules={{
                  required: 'Selecione uma data para folga compensatória'
                }}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data da Folga Compensatória *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: ptBR })
                            ) : (
                              <span>Selecione a data da folga</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          locale={ptBR}
                          initialFocus
                          disabled={(date) => getDay(date) === 5} // Desabilitar sextas
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Selecione um dia para folga compensatória (não pode ser sexta-feira)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Observação */}
            <FormField
              control={form.control}
              name="observacao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observação</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Digite observações adicionais..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Validações */}
            {(validacoes.erros.length > 0 || validacoes.avisos.length > 0 || validacoes.infos.length > 0) && (
              <div className="space-y-2">
                {validacoes.erros.map((erro, index) => (
                  <Alert key={`erro-${index}`} variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{erro}</AlertDescription>
                  </Alert>
                ))}
                {validacoes.avisos.map((aviso, index) => (
                  <Alert key={`aviso-${index}`}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{aviso}</AlertDescription>
                  </Alert>
                ))}
                {validacoes.infos.map((info, index) => (
                  <Alert key={`info-${index}`} className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-900 dark:text-blue-100">
                      {info}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={validacoes.erros.length > 0 || isSubmitting}
              >
                {isSubmitting ? 'Salvando...' : escalaParaEditar ? 'Atualizar' : 'Criar Escala'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
