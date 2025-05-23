
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Consultor } from "./types";

interface AddFolgaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consultores: Consultor[];
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  selectedConsultor: string;
  setSelectedConsultor: (consultorId: string) => void;
  motivo: string;
  setMotivo: (motivo: string) => void;
  handleAddFolga: () => void;
  isLoading: boolean;
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
}: AddFolgaDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Folga</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="date" className="text-sm font-medium">
              Data da Folga
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant="outline"
                  className="justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "dd 'de' MMMM 'de' yyyy", {
                      locale: ptBR,
                    })
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate || undefined}
                  onSelect={setSelectedDate}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <label htmlFor="consultor" className="text-sm font-medium">
              Consultor
            </label>
            <Select
              value={selectedConsultor}
              onValueChange={setSelectedConsultor}
            >
              <SelectTrigger id="consultor">
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

          <div className="grid gap-2">
            <label htmlFor="motivo" className="text-sm font-medium">
              Motivo (opcional)
            </label>
            <Input
              id="motivo"
              placeholder="Informe o motivo da folga"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            disabled={!selectedDate || !selectedConsultor || isLoading}
            onClick={handleAddFolga}
          >
            {isLoading ? "Salvando..." : "Adicionar Folga"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
