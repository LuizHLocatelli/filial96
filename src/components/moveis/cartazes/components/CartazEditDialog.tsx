
import { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { CartazItem } from "../hooks/useCartazes";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  StandardDialogHeader,
  StandardDialogContent,
  StandardDialogFooter,
} from "@/components/ui/standard-dialog";

const MONTHS = [
  { value: "01", label: "Janeiro" },
  { value: "02", label: "Fevereiro" },
  { value: "03", label: "Março" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Maio" },
  { value: "06", label: "Junho" },
  { value: "07", label: "Julho" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

interface CartazEditDialogProps {
  cartaz: CartazItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, newTitle: string, newMonth: string) => void;
}

export function CartazEditDialog({
  cartaz,
  open,
  onOpenChange,
  onUpdate
}: CartazEditDialogProps) {
  const isMobile = useIsMobile();
  const [title, setTitle] = useState(cartaz.title);
  const [month, setMonth] = useState(cartaz.month ? cartaz.month.split('-')[1] : "01");
  const [year, setYear] = useState(cartaz.month ? cartaz.month.split('-')[0] : new Date().getFullYear().toString());
  const [isUpdating, setIsUpdating] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Erro",
        description: "O título é obrigatório",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);
    try {
      const newMonth = `${year}-${month}`;
      const { error } = await supabase
        .from('cartazes')
        .update({ title: title.trim(), month: newMonth })
        .eq('id', cartaz.id);

      if (error) throw error;

      onUpdate(cartaz.id, title.trim(), newMonth);
      onOpenChange(false);
      
      toast({
        title: "Sucesso",
        description: "Cartaz atualizado com sucesso"
      });
    } catch (error) {
      console.error('Error updating cartaz:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o cartaz",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`${isMobile ? 'w-[calc(100%-2rem)] max-w-full p-0' : 'sm:max-w-[500px] p-0'} overflow-hidden`}
        hideCloseButton
      >
        <StandardDialogHeader
          icon={Edit2}
          iconColor="primary"
          title="Editar Cartaz"
          onClose={() => onOpenChange(false)}
          loading={isUpdating}
        />

        <StandardDialogContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Digite o título do cartaz"
                disabled={isUpdating}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="year">Ano</Label>
                <select
                  id="year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  disabled={isUpdating}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const y = new Date().getFullYear() - 2 + i;
                    return (
                      <option key={y} value={y.toString()}>
                        {y}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <Label htmlFor="month">Mês</Label>
                <select
                  id="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  disabled={isUpdating}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {MONTHS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </form>
        </StandardDialogContent>
        
        <StandardDialogFooter className={isMobile ? 'flex-col gap-2' : 'flex-row gap-3'}>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isUpdating}
            className={isMobile ? 'w-full h-10' : ''}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isUpdating}
            className={isMobile ? 'w-full h-10' : ''}
          >
            {isUpdating ? "Salvando..." : "Salvar"}
          </Button>
        </StandardDialogFooter>
      </DialogContent>
    </Dialog>
  );
}
