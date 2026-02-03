import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, UserPlus, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { StandardDialogHeader, StandardDialogContent, StandardDialogFooter } from "@/components/ui/standard-dialog";
import { useIsMobile } from "@/hooks/use-mobile";

interface AddFolgaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consultores: Array<{ id: string; nome: string }>;
  selectedDate?: Date | null;
  setSelectedDate?: (date: Date | null) => void;
  selectedConsultor?: string;
  setSelectedConsultor?: (id: string) => void;
  motivo?: string;
  setMotivo?: (motivo: string) => void;
  handleAddFolga?: (data: any) => Promise<void>;
  isLoading?: boolean;
  folgasNoDia?: any[];
  getConsultorNameById?: (id: string) => string | undefined;
  getUserNameForFolga?: (userId: string) => string;
  onSubmit?: (data: any) => void;
  isSubmitting?: boolean;
}

export function AddFolgaDialog({ 
  open, 
  onOpenChange, 
  consultores,
  isSubmitting = false,
  onSubmit
}: AddFolgaDialogProps) {
  const isMobile = useIsMobile();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedConsultor, setSelectedConsultor] = useState<string>("");
  const [observacoes, setObservacoes] = useState("");

  const handleSubmit = () => {
    if (selectedDate && selectedConsultor && onSubmit) {
      onSubmit({
        data: selectedDate,
        consultor_id: selectedConsultor,
        observacoes: observacoes.trim()
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`
          ${isMobile ? 'w-[calc(100%-2rem)] max-w-full p-0' : 'sm:max-w-[500px] p-0'}
          overflow-hidden
        `}
        hideCloseButton
      >
        <StandardDialogHeader
          icon={UserPlus}
          iconColor="primary"
          title="Registrar Folga"
          description="Registre uma nova folga para um consultor"
          onClose={() => onOpenChange(false)}
          loading={isSubmitting}
        />

        <StandardDialogContent>
          <div className="space-y-6">
            {/* Seleção de Consultor */}
            <div>
              <Label htmlFor="consultor" className="text-base">Consultor *</Label>
              <Select value={selectedConsultor} onValueChange={setSelectedConsultor}>
                <SelectTrigger className="mt-1">
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

            {/* Seleção de Data */}
            <div>
              <Label className="text-base">Data da Folga *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Observações */}
            <div>
              <Label htmlFor="observacoes" className="text-base">Observações</Label>
              <Textarea
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Observações sobre a folga (opcional)"
                rows={3}
                className="resize-none mt-1"
              />
            </div>
          </div>
        </StandardDialogContent>

        <StandardDialogFooter className={isMobile ? 'flex-col gap-2' : 'flex-row gap-3'}>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className={isMobile ? 'w-full h-10' : ''}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedDate || !selectedConsultor || isSubmitting}
            className={`gap-2 ${isMobile ? 'w-full h-10' : ''}`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Registrando...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Registrar Folga
              </>
            )}
          </Button>
        </StandardDialogFooter>
      </DialogContent>
    </Dialog>
  );
}
