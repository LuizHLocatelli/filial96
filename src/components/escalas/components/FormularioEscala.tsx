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
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EscalaFormData, TipoEscala, Funcionario, Escala } from '../types/escalasTypes';
import { useFuncionarios } from '../hooks/useFuncionarios';
import { supabase } from '@/integrations/supabase/client';

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
  eh_abertura?: boolean;
  eh_fechamento?: boolean;
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
      eh_abertura: escalaParaEditar?.eh_abertura || false,
      eh_fechamento: escalaParaEditar?.eh_fechamento || false,
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
        eh_abertura: escalaParaEditar?.eh_abertura || false,
        eh_fechamento: escalaParaEditar?.eh_fechamento || false,
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
        infos.push(`ℹ️ Este funcionário já possui escala no sábado ${format(sabadoAnterior, "dd/MM", { locale: ptBR })}.`);
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

    // NOTA: Removida validação de duplicata que dependia de cache
    // A constraint do banco (funcionario_id, data, modo_teste) já garante unicidade
    // Se houver tentativa de duplicata, o banco retornará erro apropriado

    setValidacoes({ erros, avisos, infos });
  }, [dataAtual, tipoAtual, funcionarioAtual, folgaCompensatoriaData, escalasExistentes, escalaParaEditar]);

  const handleSubmit = async (data: FormData) => {
    console.log('=== INICIANDO SUBMIT ===');
    console.log('Dados do formulário:', data);
    console.log('Modo teste:', modoTeste);
    console.log('Escalas existentes:', escalasExistentes.map(e => ({
      funcionario: e.funcionario_nome,
      data: e.data,
      tipo: e.tipo,
      modo_teste: e.modo_teste
    })));

    if (validacoes.erros.length > 0) {
      console.log('Submit bloqueado por erros de validação:', validacoes.erros);
      return;
    }

    if (!data.data) {
      console.log('Submit bloqueado: data não definida');
      return;
    }

    setIsSubmitting(true);
    try {
      let folgaCompensatoriaId: string | null = null;

      // Se tiver folga compensatória, criar primeiro e pegar o ID
      if (data.folga_compensatoria_data &&
          (data.tipo === 'domingo_trabalhado' || data.tipo === 'feriado_trabalhado')) {

        const folgaDataStr = format(data.folga_compensatoria_data, 'yyyy-MM-dd');

        const folgaData: EscalaFormData = {
          funcionario_id: data.funcionario_id,
          data: folgaDataStr,
          tipo: 'folga',
          observacao: `Folga compensatória referente a ${data.tipo === 'domingo_trabalhado' ? 'domingo' : 'feriado'} trabalhado em ${format(data.data, 'dd/MM/yyyy')}`,
          modo_teste: modoTeste
        };

        try {
          console.log('Criando folga compensatória:', folgaData);
          // Criar a folga e obter o ID retornado
          const folgaCriada = await onSubmit(folgaData) as any;

          // Garantir que capturamos o ID correto do objeto retornado
          if (folgaCriada && typeof folgaCriada === 'object') {
            folgaCompensatoriaId = folgaCriada.id || null;
          }

          console.log('✅ Folga compensatória criada:', folgaCriada, 'ID:', folgaCompensatoriaId);
        } catch (error: any) {
          // Se o erro for de duplicata, buscar a escala existente no banco de dados
          if (error?.code === '23505' || error?.message?.includes('escalas_funcionario_id_data_modo_teste_key')) {
            console.log('ℹ️ Folga compensatória já existe, buscando no banco de dados...');

            // Buscar diretamente no banco de dados em vez de depender do cache
            const { data: escalaExistente, error: buscaError } = await supabase
              .from('escalas')
              .select('id')
              .eq('funcionario_id', data.funcionario_id)
              .eq('data', folgaDataStr)
              .eq('modo_teste', modoTeste)
              .single();

            if (buscaError) {
              console.error('❌ Erro ao buscar folga existente:', buscaError);
              throw new Error(`Folga compensatória já existe mas não foi possível recuperar o ID: ${buscaError.message}`);
            }

            if (escalaExistente && escalaExistente.id) {
              folgaCompensatoriaId = escalaExistente.id;
              console.log('✅ ID da folga existente recuperado do banco:', folgaCompensatoriaId);
            } else {
              console.error('❌ Folga existe mas não foi possível recuperar o ID');
              throw new Error('Folga compensatória já existe mas não foi possível recuperar o ID do banco de dados');
            }
          } else {
            // Se for outro tipo de erro, propagar
            throw error;
          }
        }
      }

      // Criar a escala principal com o ID da folga compensatória
      const escalaData: EscalaFormData = {
        funcionario_id: data.funcionario_id,
        data: format(data.data, 'yyyy-MM-dd'),
        tipo: data.tipo,
        eh_abertura: data.eh_abertura,
        eh_fechamento: data.eh_fechamento,
        observacao: data.observacao || null,
        modo_teste: modoTeste,
        folga_compensatoria_id: folgaCompensatoriaId
      };

      console.log('Criando escala principal com dados:', escalaData);

      await onSubmit(escalaData);
      console.log('✅ Escala principal criada com sucesso');

      // Se for domingo trabalhado, criar escala de abertura no sábado anterior
      if (data.tipo === 'domingo_trabalhado' && data.data) {
        const diaSemana = getDay(data.data);
        if (diaSemana === 0) { // Domingo
          const sabadoAnterior = new Date(data.data);
          sabadoAnterior.setDate(sabadoAnterior.getDate() - 1);
          const sabadoStr = format(sabadoAnterior, 'yyyy-MM-dd');

          const escalaSabado: EscalaFormData = {
            funcionario_id: data.funcionario_id,
            data: sabadoStr,
            tipo: 'trabalho',
            eh_abertura: true,
            observacao: `Abertura automática - Domingo trabalhado em ${format(data.data, 'dd/MM/yyyy')}`,
            modo_teste: modoTeste
          };

          try {
            console.log('Criando escala de abertura no sábado:', escalaSabado);

            // Usar Supabase diretamente para silenciar erro 409 sem mostrar toast
            const { error: sabadoError } = await supabase
              .from('escalas')
              .insert([escalaSabado])
              .select();

            if (sabadoError) {
              // Se o erro for de duplicata (constraint única), ignorar pois já existe
              if (sabadoError.code === '23505' || sabadoError.message?.includes('escalas_funcionario_id_data_modo_teste_key')) {
                console.log('ℹ️ Escala no sábado já existe, continuando...');
              } else {
                // Se for outro tipo de erro, propagar
                throw sabadoError;
              }
            } else {
              console.log('✅ Escala de abertura no sábado criada com sucesso');
            }
          } catch (error: any) {
            // Tratar qualquer erro não esperado
            console.error('❌ Erro ao criar escala de abertura:', error);
            throw error;
          }
        }
      }

      console.log('=== SUBMIT CONCLUÍDO COM SUCESSO ===');
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('❌ ERRO AO SALVAR ESCALA:', error);
      console.error('Detalhes do erro:', {
        message: error?.message,
        code: error?.code,
        details: error?.details
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const mostrarCampoFolgaCompensatoria =
    tipoAtual === 'domingo_trabalhado' || tipoAtual === 'feriado_trabalhado';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] md:max-h-[85vh] lg:max-h-[90vh] overflow-hidden flex flex-col p-0 max-w-2xl">
        {/* Fixed Header */}
        <div className="flex-shrink-0 p-3 md:p-5 lg:p-6 pb-0">
          <DialogHeader className="pr-8">
            <DialogTitle className="flex flex-wrap items-center gap-2 text-base md:text-lg">
              {escalaParaEditar ? 'Editar Escala' : 'Nova Escala'}
              {modoTeste && (
                <Badge variant="outline" className="text-xs md:text-sm">Modo Teste</Badge>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              {escalaParaEditar
                ? 'Edite as informações da escala'
                : 'Preencha os dados para criar uma nova escala'
              }
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3 md:p-5 lg:p-6 pt-3">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3 md:space-y-4">
              {/* Funcionário */}
              <FormField
                control={form.control}
                name="funcionario_id"
                rules={{ required: 'Selecione um funcionário' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm md:text-base">Funcionário *</FormLabel>
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
                    <FormLabel className="text-sm md:text-base">Data *</FormLabel>
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
                    <FormLabel className="text-sm md:text-base">Tipo *</FormLabel>
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

              {/* Abertura e Fechamento - Mostrar apenas para tipo "trabalho" */}
              {tipoAtual === 'trabalho' && (
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="eh_abertura"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm md:text-base">
                            Abertura da loja
                          </FormLabel>
                          <FormDescription>
                            Este funcionário fará a abertura da loja neste dia
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="eh_fechamento"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm md:text-base">
                            Fechamento da loja
                          </FormLabel>
                          <FormDescription>
                            Este funcionário fará o fechamento da loja neste dia
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              )}

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
                      <FormLabel className="text-sm md:text-base">Data da Folga Compensatória *</FormLabel>
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
                    <FormLabel className="text-sm md:text-base">Observação</FormLabel>
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
                      <AlertDescription className="text-xs md:text-sm">{erro}</AlertDescription>
                    </Alert>
                  ))}
                  {validacoes.avisos.map((aviso, index) => (
                    <Alert key={`aviso-${index}`}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-xs md:text-sm">{aviso}</AlertDescription>
                    </Alert>
                  ))}
                  {validacoes.infos.map((info, index) => (
                    <Alert key={`info-${index}`} className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                      <Info className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-xs md:text-sm text-blue-900 dark:text-blue-100">
                        {info}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </form>
          </Form>
        </div>

        {/* Fixed Footer */}
        <div className="flex-shrink-0 border-t bg-background p-3 md:p-5 lg:p-6 pt-3">
          <div className="flex flex-col md:flex-row gap-2 md:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="w-full md:w-auto h-9 md:h-10 text-xs md:text-sm"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              onClick={form.handleSubmit(handleSubmit)}
              disabled={validacoes.erros.length > 0 || isSubmitting}
              className="w-full md:w-auto h-9 md:h-10 text-xs md:text-sm"
            >
              {isSubmitting ? 'Salvando...' : escalaParaEditar ? 'Atualizar' : 'Criar Escala'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
