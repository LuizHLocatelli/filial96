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
import { Crediarista, Folga } from "./types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
  const hasExistingFolgas = folgasNoDia && folgasNoDia.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {hasExistingFolgas ? "Detalhes do Dia & Adicionar Folga" : "Adicionar Folga"}
          </DialogTitle>
          {selectedDate && (
            <DialogDescription className="pt-1">
              {format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </DialogDescription>
          )}
        </DialogHeader>
        
        {hasExistingFolgas && getCrediaristaNameById && getUserNameForFolga && (
          <>
            <div className="mt-4 mb-2">
              <h4 className="text-md font-semibold mb-2 text-primary">
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
            <h4 className="text-md font-semibold mb-2 text-primary">
              Adicionar Nova Folga Para Este Dia:
            </h4>
          </>
        )}

        <div className="space-y-3 py-1">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Crediarista</label>
            <Select
              value={selectedCrediarista}
              onValueChange={setSelectedCrediarista}
            >
              <SelectTrigger className="w-full text-xs">
                <SelectValue placeholder="Selecione um crediarista" />
              </SelectTrigger>
              <SelectContent>
                {crediaristas.map((crediarista) => (
                  <SelectItem key={crediarista.id} value={crediarista.id} className="text-xs">
                    {crediarista.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Data da Folga</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal text-xs",
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
                  onSelect={(date) => {
                    if (date) setSelectedDate(date);
                  }}
                  initialFocus
                  className="p-2"
                  disabled={hasExistingFolgas}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium">Motivo (opcional)</label>
            <Textarea
              placeholder="Informe o motivo da folga"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="resize-none text-xs min-h-[60px]"
            />
          </div>
        </div>
        
        <DialogFooter className="pt-3 gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="text-xs h-8 sm:h-9">
            Cancelar
          </Button>
          <Button onClick={onAddFolga} className="text-xs h-8 sm:h-9">
            {hasExistingFolgas ? "Adicionar Outra Folga" : "Adicionar Folga"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
