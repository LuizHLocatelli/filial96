
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Crediarista, Folga } from "./types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useMobileDialog } from "@/hooks/useMobileDialog";

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
  folgasNoDia?: Folga[];
  getCrediaristaNameById?: (id: string) => string | undefined;
  getUserNameForFolga?: (id: string) => string | undefined;
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
  onAddFolga,
  folgasNoDia = [],
  getCrediaristaNameById,
  getUserNameForFolga
}: AddFolgaDialogProps) {
  const { getMobileDialogProps, getMobileButtonProps } = useMobileDialog();
  const hasExistingFolgas = folgasNoDia && folgasNoDia.length > 0;
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setCalendarOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent {...getMobileDialogProps("lg")} className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            {hasExistingFolgas ? "Detalhes do Dia & Adicionar Folga" : "Adicionar Folga"}
          </DialogTitle>
          {selectedDate && (
            <DialogDescription className="text-sm">
              {format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="max-h-[60vh] overflow-y-auto">
          {hasExistingFolgas && getCrediaristaNameById && getUserNameForFolga && (
            <>
              <div className="mt-4 mb-2">
                <h4 className="text-sm sm:text-base font-semibold mb-2 text-primary">
                  Folgas Registradas Neste Dia:
                </h4>
                <ScrollArea className="h-[150px] rounded-md border p-2 bg-muted/30">
                  <div className="space-y-2.5 pr-2">
                    {folgasNoDia.map((folga) => {
                      const crediaristaName = getCrediaristaNameById(folga.crediaristaId) || "N/A";
                      const createdByName = getUserNameForFolga(folga.createdBy) || "N/A";
                      return (
                        <div key={folga.id} className="p-1.5 border-b last:border-b-0 text-xs">
                          <div className="flex justify-between items-start gap-1">
                            <span className="font-medium break-words">{crediaristaName}</span>
                            <Badge variant="outline" className="text-[10px] whitespace-nowrap">
                              Por: {createdByName}
                            </Badge>
                          </div>
                          {folga.motivo && (
                            <p className="text-muted-foreground mt-0.5 break-words">
                              Motivo: {folga.motivo}
                            </p>
                          )}
                          <p className="text-muted-foreground text-[10px] mt-0.5">
                            Em: {format(new Date(folga.createdAt), "dd/MM/yy HH:mm")}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
              <Separator className="my-3" />
              <h4 className="text-sm sm:text-base font-semibold mb-2 text-primary">
                Adicionar Nova Folga Para Este Dia:
              </h4>
            </>
          )}

          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Crediarista</label>
              <Select
                value={selectedCrediarista}
                onValueChange={setSelectedCrediarista}
              >
                <SelectTrigger className="w-full text-base sm:text-sm">
                  <SelectValue placeholder="Selecione um crediarista" />
                </SelectTrigger>
                <SelectContent>
                  {crediaristas.map((crediarista) => (
                    <SelectItem key={crediarista.id} value={crediarista.id} className="text-sm">
                      {crediarista.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Data da Folga</label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal text-base sm:text-sm",
                      !selectedDate && "text-muted-foreground"
                    )}
                    disabled={hasExistingFolgas}
                  >
                    <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                    {selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    initialFocus
                    className="p-2"
                    disabled={hasExistingFolgas}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Motivo (opcional)</label>
              <Textarea
                placeholder="Informe o motivo da folga"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="resize-none text-base sm:text-sm min-h-[60px]"
              />
            </div>
          </div>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            {...getMobileButtonProps()}
          >
            Cancelar
          </Button>
          <Button 
            onClick={onAddFolga} 
            {...getMobileButtonProps()}
          >
            {hasExistingFolgas ? "Adicionar Outra Folga" : "Adicionar Folga"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
