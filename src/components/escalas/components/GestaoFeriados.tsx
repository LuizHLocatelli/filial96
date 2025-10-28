import { useState } from 'react';
import { format } from 'date-fns';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarIcon, Plus, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFeriados } from '../hooks/useFeriados';
import type { Feriado } from '../types/escalasTypes';

interface GestaoFeriadosProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ano: number;
}

export function GestaoFeriados({ open, onOpenChange, ano }: GestaoFeriadosProps) {
  const { feriados, criarFeriado, atualizarFeriado, deletarFeriado } = useFeriados(ano);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [feriadoEditando, setFeriadoEditando] = useState<Feriado | null>(null);

  const handleNovoFeriado = () => {
    setFeriadoEditando(null);
    setShowFormDialog(true);
  };

  const handleEditarFeriado = (feriado: Feriado) => {
    setFeriadoEditando(feriado);
    setShowFormDialog(true);
  };

  const handleDeletarFeriado = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este feriado?')) {
      await deletarFeriado(id);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[80vh] md:max-h-[85vh] lg:max-h-[90vh] overflow-hidden flex flex-col p-0">
          {/* Fixed Header */}
          <div className="flex-shrink-0 p-3 md:p-5 lg:p-6 pb-0">
            <DialogHeader className="pr-8">
              <DialogTitle className="text-base md:text-lg">Gerenciar Feriados - {ano}</DialogTitle>
              <DialogDescription className="text-xs md:text-sm">
                Adicione, edite ou remova feriados do ano
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-3 md:p-5 lg:p-6 pt-3">
            <div className="space-y-3 md:space-y-4">
              <Button onClick={handleNovoFeriado} className="w-full h-9 md:h-10 text-xs md:text-sm">
                <Plus className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                Adicionar Feriado
              </Button>

              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs md:text-sm">Data</TableHead>
                      <TableHead className="text-xs md:text-sm">Nome</TableHead>
                      <TableHead className="text-xs md:text-sm">Trabalhado</TableHead>
                      <TableHead className="text-right text-xs md:text-sm">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feriados.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground text-xs md:text-sm">
                          Nenhum feriado cadastrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      feriados.map((feriado) => (
                        <TableRow key={feriado.id}>
                          <TableCell className="text-xs md:text-sm">
                            {format(new Date(feriado.data + 'T00:00:00'), "dd 'de' MMMM", { locale: ptBR })}
                          </TableCell>
                          <TableCell className="text-xs md:text-sm">{feriado.nome}</TableCell>
                          <TableCell>
                            {feriado.eh_trabalhado ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
                                Sim
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">Não</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1 md:gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditarFeriado(feriado)}
                                className="h-8 w-8 md:h-10 md:w-10"
                              >
                                <Pencil className="h-3 w-3 md:h-4 md:w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeletarFeriado(feriado.id)}
                                className="h-8 w-8 md:h-10 md:w-10"
                              >
                                <Trash2 className="h-3 w-3 md:h-4 md:w-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <FormularioFeriado
        open={showFormDialog}
        onOpenChange={setShowFormDialog}
        feriado={feriadoEditando}
        onSave={async (data) => {
          if (feriadoEditando) {
            await atualizarFeriado({ id: feriadoEditando.id, ...data });
          } else {
            await criarFeriado(data);
          }
          setShowFormDialog(false);
        }}
      />
    </>
  );
}

interface FormularioFeriadoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feriado: Feriado | null;
  onSave: (data: { data: string; nome: string; eh_trabalhado: boolean }) => Promise<void>;
}

function FormularioFeriado({ open, onOpenChange, feriado, onSave }: FormularioFeriadoProps) {
  const [data, setData] = useState<Date | undefined>(
    feriado?.data ? new Date(feriado.data + 'T00:00:00') : undefined
  );
  const [nome, setNome] = useState(feriado?.nome || '');
  const [ehTrabalhado, setEhTrabalhado] = useState(feriado?.eh_trabalhado || false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !nome) return;

    setIsSaving(true);
    try {
      await onSave({
        data: format(data, 'yyyy-MM-dd'),
        nome,
        eh_trabalhado: ehTrabalhado
      });
      // Reset form
      setData(undefined);
      setNome('');
      setEhTrabalhado(false);
    } catch (error) {
      console.error('Erro ao salvar feriado:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] md:max-h-[85vh] lg:max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Fixed Header */}
        <div className="flex-shrink-0 p-3 md:p-5 lg:p-6 pb-0">
          <DialogHeader className="pr-8">
            <DialogTitle className="text-base md:text-lg">{feriado ? 'Editar Feriado' : 'Novo Feriado'}</DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              Preencha as informações do feriado
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3 md:p-5 lg:p-6 pt-3">
          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            <div className="space-y-2">
              <Label className="text-sm md:text-base">Data *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !data && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {data ? format(data, "PPP", { locale: ptBR }) : "Selecione uma data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={data}
                  onSelect={setData}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

            <div className="space-y-2">
              <Label htmlFor="nome" className="text-sm md:text-base">Nome do Feriado *</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Natal, Ano Novo..."
                required
                className="h-9 md:h-10 text-xs md:text-sm"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="trabalhado"
                checked={ehTrabalhado}
                onCheckedChange={setEhTrabalhado}
              />
              <Label htmlFor="trabalhado" className="text-xs md:text-sm">Loja abre neste feriado</Label>
            </div>
          </form>
        </div>

        {/* Fixed Footer */}
        <div className="flex-shrink-0 border-t bg-background p-3 md:p-5 lg:p-6 pt-3">
          <div className="flex flex-col md:flex-row gap-2 md:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              className="w-full md:w-auto h-9 md:h-10 text-xs md:text-sm"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!data || !nome || isSaving}
              onClick={handleSubmit}
              className="w-full md:w-auto h-9 md:h-10 text-xs md:text-sm"
            >
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
