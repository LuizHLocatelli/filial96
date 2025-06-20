import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useMobileDialog } from "@/hooks/useMobileDialog";

interface AddFolgaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  vendedores: Array<{ id: string; nome: string }>;
  isSubmitting: boolean;
}

export function AddFolgaDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  vendedores,
  isSubmitting 
}: AddFolgaDialogProps) {
  const { getMobileDialogProps, getMobileFooterProps } = useMobileDialog();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedVendedor, setSelectedVendedor] = useState<string>("");
  const [observacoes, setObservacoes] = useState("");

  const handleSubmit = () => {
    if (selectedDate && selectedVendedor) {
      onSubmit({
        data: selectedDate,
        vendedor_id: selectedVendedor,
        observacoes: observacoes.trim()
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent {...getMobileDialogProps("default")}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              Registrar Folga
            </div>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Registre uma nova folga para um vendedor
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seleção de Vendedor */}
          <div>
            <Label htmlFor="vendedor">Vendedor *</Label>
            <Select value={selectedVendedor} onValueChange={setSelectedVendedor}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um vendedor" />
              </SelectTrigger>
              <SelectContent>
                {vendedores.map((vendedor) => (
                  <SelectItem key={vendedor.id} value={vendedor.id}>
                    {vendedor.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Seleção de Data */}
          <div>
            <Label>Data da Folga *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
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
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Observações sobre a folga (opcional)"
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <div {...getMobileFooterProps()}>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="px-6"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedDate || !selectedVendedor || isSubmitting}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-lg transition-all duration-300 px-8 hover:scale-105"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            {isSubmitting ? "Registrando..." : "Registrar Folga"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
