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

interface CartazEditDialogProps {
  cartaz: CartazItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, newTitle: string) => void;
}

export function CartazEditDialog({
  cartaz,
  open,
  onOpenChange,
  onUpdate
}: CartazEditDialogProps) {
  const isMobile = useIsMobile();
  const [title, setTitle] = useState(cartaz.title);
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
      const { error } = await supabase
        .from('cartazes')
        .update({ title: title.trim() })
        .eq('id', cartaz.id);

      if (error) throw error;

      onUpdate(cartaz.id, title.trim());
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
