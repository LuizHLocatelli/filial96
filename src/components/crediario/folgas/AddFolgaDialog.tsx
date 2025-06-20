import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, UserX } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  const { getMobileDialogProps, getMobileButtonProps, getMobileFooterProps } = useMobileDialog();
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
      <DialogContent {...getMobileDialogProps("default")}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center">
              <UserX className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              {hasExistingFolgas ? "Detalhes do Dia & Adicionar Folga" : "Adicionar Folga"}
            </div>
          </DialogTitle>
          {selectedDate && (
            <DialogDescription className="text-sm text-muted-foreground">
              {format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="space-y-6">
          {hasExistingFolgas && getCrediaristaNameById && getUserNameForFolga && (
            <>
              <div>
                <h4 className="text-base font-semibold mb-4 text-green-700 dark:text-green-300">
                  Folgas Registradas Neste Dia:
                </h4>
                <ScrollArea className="h-[150px] rounded-md border p-4 bg-muted/30">
                  <div className="space-y-3">
                    {folgasNoDia.map((folga) => {
                      const crediaristaName = getCrediaristaNameById(folga.crediaristaId) || "N/A";
                      const createdByName = getUserNameForFolga(folga.createdBy) || "N/A";
                      return (
                        <div key={folga.id} className="p-3 border-b last:border-b-0 rounded-lg bg-background/50">
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-medium">{crediaristaName}</span>
                            <Badge variant="outline" className="text-xs">
                              Por: {createdByName}
                            </Badge>
                          </div>
                          {folga.motivo && (
                            <p className="text-muted-foreground mt-1 text-sm">
                              Motivo: {folga.motivo}
                            </p>
                          )}
                          <p className="text-muted-foreground text-xs mt-1">
                            Em: {format(new Date(folga.createdAt), "dd/MM/yyyy HH:mm")}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
              
              <Separator />
              
              <h4 className="text-base font-semibold text-green-700 dark:text-green-300">
                Adicionar Nova Folga Para Este Dia:
              </h4>
            </>
          )}

          <div className="space-y-6">
            <div>
              <Label>Crediarista *</Label>
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
            
            <div>
              <Label>Data da Folga *</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                    disabled={hasExistingFolgas}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    initialFocus
                    disabled={hasExistingFolgas}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Motivo (opcional)</Label>
              <Textarea
                placeholder="Informe o motivo da folga"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>
          </div>
        </div>
        
        <div {...getMobileFooterProps()}>
          <Button 
            type="button"
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            className="px-6"
          >
            Cancelar
          </Button>
          <Button 
            onClick={onAddFolga} 
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-lg transition-all duration-300 px-8 hover:scale-105"
          >
            {hasExistingFolgas ? "Adicionar Outra Folga" : "Adicionar Folga"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
