import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { Dialog, DialogContent, DialogDescription } from "@/components/ui/dialog";
import { DialogScrollableContainer } from "@/components/ui/dialog-scrollable-container";
import { StandardDialogHeader, StandardDialogFooter } from "@/components/ui/standard-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { updateEscala } from "../services/escalasApi";
import { EscalaCarga } from "@/types/shared/escalas";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Consultor {
  id: string;
  name: string;
  avatar_url: string | null;
}

interface EditarTurnoPopoverProps {
  shift: EscalaCarga | null;
  consultores: Consultor[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditarTurnoPopover({ shift, consultores, open, onOpenChange, onSuccess }: EditarTurnoPopoverProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState(shift?.user_id || "");
  const [shiftStart, setShiftStart] = useState(shift?.shift_start?.substring(0, 5) || "09:30");
  const [shiftEnd, setShiftEnd] = useState(shift?.shift_end?.substring(0, 5) || "18:30");
  const [isCarga, setIsCarga] = useState(shift?.is_carga || false);

  // Sync state when shift changes
  if (shift && userId !== shift.user_id && !isSaving) {
    setUserId(shift.user_id);
    setShiftStart(shift.shift_start.substring(0, 5));
    setShiftEnd(shift.shift_end.substring(0, 5));
    setIsCarga(shift.is_carga);
  }

  const handleSave = async () => {
    if (!shift) return;

    try {
      setIsSaving(true);
      await updateEscala(shift.id, {
        user_id: userId,
        shift_start: shiftStart + ":00",
        shift_end: shiftEnd + ":00",
        is_carga: isCarga,
      });

      toast.success("Turno atualizado!");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar", {
        description: error instanceof Error ? error.message : "Erro desconhecido",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!shift) return null;

  const dateObj = new Date(shift.date + "T12:00:00");
  const dateLabel = format(dateObj, "EEEE, dd 'de' MMMM", { locale: ptBR });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[75dvh] sm:max-h-[75vh] overflow-hidden flex flex-col p-0 sm:max-w-md" hideCloseButton>
        <StandardDialogHeader
          icon={Save}
          title="Editar Turno"
          onClose={() => onOpenChange(false)}
        />

        <DialogScrollableContainer>
          <DialogDescription className="capitalize">{dateLabel}</DialogDescription>

          <div className="space-y-2">
            <Label>Consultor</Label>
            <Select value={userId} onValueChange={setUserId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {consultores.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={c.avatar_url || ''} />
                        <AvatarFallback className="text-[9px]">{c.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {c.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Entrada</Label>
              <Input type="time" value={shiftStart} onChange={e => setShiftStart(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Saída</Label>
              <Input type="time" value={shiftEnd} onChange={e => setShiftEnd(e.target.value)} />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label>Turno de Carga</Label>
              <p className="text-xs text-muted-foreground">Horário 08:30 - 17:30</p>
            </div>
            <Switch checked={isCarga} onCheckedChange={setIsCarga} />
          </div>
        </DialogScrollableContainer>

        <StandardDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar
          </Button>
        </StandardDialogFooter>
      </DialogContent>
    </Dialog>
  );
}
