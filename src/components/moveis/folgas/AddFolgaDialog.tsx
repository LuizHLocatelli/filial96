
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMobileDialog } from '@/hooks/useMobileDialog';

interface Consultor {
  id: string;
  nome: string;
}

interface AddFolgaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consultores: Consultor[];
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  selectedConsultor: string;
  setSelectedConsultor: (consultor: string) => void;
  motivo: string;
  setMotivo: (motivo: string) => void;
  handleAddFolga: () => Promise<void>;
  isLoading: boolean;
  folgasNoDia: any[];
  getConsultorNameById: (id: string) => string | undefined;
  getUserNameForFolga: (userId: string) => string;
}

export function AddFolgaDialog({
  open,
  onOpenChange,
  consultores,
  selectedDate,
  setSelectedDate,
  selectedConsultor,
  setSelectedConsultor,
  motivo,
  setMotivo,
  handleAddFolga,
  isLoading,
  folgasNoDia,
  getConsultorNameById,
  getUserNameForFolga
}: AddFolgaDialogProps) {
  const { getMobileDialogProps, getMobileFooterProps } = useMobileDialog();

  const handleSubmit = async () => {
    await handleAddFolga();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent {...getMobileDialogProps("default")}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center">
              <Plus className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            Adicionar Folga
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Registre uma nova folga para um consultor
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label htmlFor="data">Data da Folga</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione uma data'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate || undefined}
                  onSelect={(date) => setSelectedDate(date || null)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="consultor">Consultor</Label>
            <Select value={selectedConsultor} onValueChange={setSelectedConsultor}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um consultor" />
              </SelectTrigger>
              <SelectContent>
                {consultores.map((consultor) => (
                  <SelectItem key={consultor.id} value={consultor.id}>
                    {consultor.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="motivo">Motivo</Label>
            <Textarea
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Motivo da folga (opcional)"
              rows={3}
              className="resize-none"
            />
          </div>

          {folgasNoDia.length > 0 && (
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Folgas já registradas neste dia:</h4>
              <ul className="text-sm space-y-1">
                {folgasNoDia.map((folga, index) => (
                  <li key={index}>
                    • {getConsultorNameById(folga.consultorId)} ({getUserNameForFolga(folga.created_by)})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div {...getMobileFooterProps()}>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="px-6"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedDate || !selectedConsultor || isLoading}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-lg transition-all duration-300 px-8 hover:scale-105"
          >
            <Plus className="mr-2 h-4 w-4" />
            {isLoading ? 'Adicionando...' : 'Adicionar Folga'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
