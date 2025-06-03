import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Consultor, Folga } from "./types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

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
  folgasNoDia?: Folga[];
  getConsultorNameById?: (id: string) => string | undefined;
  getUserNameForFolga?: (id: string) => string | undefined;
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
  folgasNoDia = [],
  getConsultorNameById,
  getUserNameForFolga
}: AddFolgaDialogProps) {
  const hasExistingFolgas = folgasNoDia && folgasNoDia.length > 0;
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setCalendarOpen(false); // Fechar o calendário automaticamente
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {hasExistingFolgas ? "Detalhes do Dia & Adicionar Folga" : "Adicionar Nova Folga"}
          </DialogTitle>
          <DialogDescription>
            {hasExistingFolgas 
              ? "Visualize as folgas existentes e adicione uma nova para este dia."
              : "Registre uma nova folga para um consultor em uma data específica."
            }
          </DialogDescription>
          {selectedDate && (
            <p className="text-xs sm:text-sm text-muted-foreground pt-1">
              {format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          )}
        </DialogHeader>

        {hasExistingFolgas && getConsultorNameById && getUserNameForFolga && (
          <>
            <div className="mt-3 mb-2 sm:mt-4 sm:mb-2">
              <h4 className="text-sm sm:text-md font-semibold mb-1.5 sm:mb-2 text-primary">
                Folgas Registradas Neste Dia:
              </h4>
              <ScrollArea className="h-[120px] sm:h-[150px] rounded-md border p-1.5 sm:p-2 bg-muted/30">
                <div className="space-y-2 pr-1 sm:pr-2">
                  {folgasNoDia.map((folga) => {
                    const consultorName = getConsultorNameById(folga.consultorId) || "N/A";
                    const createdByName = getUserNameForFolga(folga.createdBy) || "N/A";
                    return (
                      <div key={folga.id} className="p-1 sm:p-1.5 border-b last:border-b-0 text-xs">
                        <div className="flex justify-between items-start gap-1">
                          <span className="font-medium break-words">{consultorName}</span>
                          <Badge variant="outline" className="text-[9px] sm:text-[10px] whitespace-nowrap px-1.5 py-0.5">
                            Por: {createdByName}
                          </Badge>
                        </div>
                        {folga.motivo && (
                          <p className="text-muted-foreground mt-0.5 break-words text-[11px] sm:text-xs">
                            Motivo: {folga.motivo}
                          </p>
                        )}
                        <p className="text-muted-foreground text-[9px] sm:text-[10px] mt-0.5">
                          Em: {format(new Date(folga.createdAt), "dd/MM/yy HH:mm")}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
            <Separator className="my-2 sm:my-3" />
            <h4 className="text-sm sm:text-md font-semibold mb-1.5 sm:mb-2 text-primary">
              Adicionar Nova Folga Para Este Dia:
            </h4>
          </>
        )}
        
        <div className="space-y-2.5 sm:space-y-3 py-1">
          <div className="space-y-1 sm:space-y-1.5">
            <label htmlFor="date-dialog-moda" className="text-xs font-medium">
              Data da Folga
            </label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="date-dialog-moda"
                  variant="outline"
                  className={cn("justify-start text-left font-normal w-full text-xs", !selectedDate && "text-muted-foreground")}
                  disabled={hasExistingFolgas}
                >
                  <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                  {selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate || undefined}
                  onSelect={handleDateSelect}
                  locale={ptBR}
                  initialFocus
                  disabled={hasExistingFolgas}
                  className="p-1.5 sm:p-2"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1 sm:space-y-1.5">
            <label htmlFor="consultor-dialog-moda" className="text-xs font-medium">
              Consultor
            </label>
            <Select
              value={selectedConsultor}
              onValueChange={setSelectedConsultor}
            >
              <SelectTrigger id="consultor-dialog-moda" className="w-full text-xs">
                <SelectValue placeholder="Selecione um consultor" />
              </SelectTrigger>
              <SelectContent>
                {consultores.map((consultor) => (
                  <SelectItem key={consultor.id} value={consultor.id} className="text-xs">
                    {consultor.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1 sm:space-y-1.5">
            <label htmlFor="motivo-dialog-moda" className="text-xs font-medium">
              Motivo (opcional)
            </label>
            <Textarea
              id="motivo-dialog-moda"
              placeholder="Informe o motivo da folga"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="resize-none text-xs min-h-[50px] sm:min-h-[60px]"
            />
          </div>
        </div>
        <DialogFooter className="pt-2.5 sm:pt-3 gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="text-xs h-8 sm:h-9">
              Cancelar
          </Button>
          <Button
            type="submit"
            disabled={!selectedDate || !selectedConsultor || isLoading}
            onClick={handleAddFolga}
            className="text-xs h-8 sm:h-9"
          >
            {isLoading ? "Salvando..." : (hasExistingFolgas ? "Adicionar Outra Folga" : "Adicionar Folga")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 