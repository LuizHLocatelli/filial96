import { useState } from "react";
import { format } from "date-fns";
import { Trash2, Loader2, CalendarIcon } from "lucide-react";

import { Dialog, DialogContent, DialogDescription } from "@/components/ui/dialog";
import { StandardDialogHeader, StandardDialogFooter } from "@/components/ui/standard-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { deleteEscalas } from "./services/escalasApi";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function LimparEscalaDialog({ open, onOpenChange, onSuccess }: Props) {
  const { toast } = useToast();
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-01"));
  
  // Default to end of month
  const today = new Date();
  const [endDate, setEndDate] = useState(format(new Date(today.getFullYear(), today.getMonth() + 1, 0), "yyyy-MM-dd"));
  
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!startDate || !endDate) return;

    if (startDate > endDate) {
      toast({
        variant: "destructive",
        title: "Período inválido",
        description: "A data inicial deve ser menor ou igual à data final."
      });
      return;
    }

    try {
      setIsDeleting(true);
      await deleteEscalas(startDate, endDate);
      
      toast({
        title: "Escalas apagadas",
        description: "As escalas no período selecionado foram removidas com sucesso.",
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro ao apagar",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao excluir as escalas."
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto flex flex-col p-0 sm:max-w-md" hideCloseButton>
        <StandardDialogHeader 
          icon={Trash2} 
          title="Apagar Escala" 
          onClose={() => onOpenChange(false)} 
        />
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <DialogDescription>
            Defina o período para o qual você deseja excluir a escala do banco de dados. Esta ação apagará definitivamente as escalas destes dias.
          </DialogDescription>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deleteStartDate">A partir de</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="deleteStartDate"
                  type="date" 
                  className="pl-9"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deleteEndDate">Até</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="deleteEndDate"
                  type="date" 
                  className="pl-9"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <StandardDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting || !startDate || !endDate}>
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isDeleting ? "Apagando..." : "Apagar Escalas"}
          </Button>
        </StandardDialogFooter>
      </DialogContent>
    </Dialog>
  );
}