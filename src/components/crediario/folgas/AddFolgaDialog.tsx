
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Crediarista } from "./types";

interface AddFolgaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  selectedCrediarista: string;
  setSelectedCrediarista: (id: string) => void;
  motivo: string;
  setMotivo: (motivo: string) => void;
  crediaristas: Crediarista[];
  onAddFolga: () => void;
}

export function AddFolgaDialog({
  open,
  onOpenChange,
  selectedDate,
  setSelectedDate,
  selectedCrediarista,
  setSelectedCrediarista,
  motivo,
  setMotivo,
  crediaristas,
  onAddFolga
}: AddFolgaDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Folga</DialogTitle>
          <DialogDescription>
            Selecione um crediarista e uma data para registrar uma folga.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Crediarista</label>
            <Select
              value={selectedCrediarista}
              onValueChange={setSelectedCrediarista}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um crediarista" />
              </SelectTrigger>
              <SelectContent>
                {crediaristas.map((crediarista) => (
                  <SelectItem key={crediarista.id} value={crediarista.id}>
                    {crediarista.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Data da Folga</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : "Selecione uma data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Motivo (opcional)</label>
            <Textarea
              placeholder="Informe o motivo da folga"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="resize-none"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onAddFolga}>
            Adicionar Folga
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
