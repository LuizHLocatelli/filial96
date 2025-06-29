
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CartazItem } from "../hooks/useCartazes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface CartazEditDialogProps {
  cartaz: CartazItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, newTitle: string) => void;
}

export function CartazEditDialog({ cartaz, open, onOpenChange, onUpdate }: CartazEditDialogProps) {
  const [title, setTitle] = useState(cartaz.title);
  const [isLoading, setIsLoading] = useState(false);

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

    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Cartaz</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título do cartaz"
              disabled={isLoading}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
