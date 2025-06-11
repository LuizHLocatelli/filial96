import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth";
import { useMobileDialog } from "@/hooks/useMobileDialog";

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sector: "furniture" | "fashion" | "loan" | "service";
}

export function CreateFolderDialog({ open, onOpenChange, sector }: CreateFolderDialogProps) {
  const [folderName, setFolderName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { getMobileDialogProps, getMobileButtonProps, getMobileFormProps } = useMobileDialog();
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!folderName.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira um nome para a pasta",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('card_folders')
        .insert([
          { 
            name: folderName.trim(), 
            sector: sector,
            created_by: user?.id 
          }
        ]);
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Pasta criada com sucesso"
      });
      
      setFolderName("");
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating folder:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a pasta",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent {...getMobileDialogProps("md")} className="dark:bg-zinc-900/60 dark:backdrop-blur-xl dark:border-white/10">
        <form onSubmit={handleSubmit} {...getMobileFormProps()}>
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Criar Nova Pasta</DialogTitle>
            <DialogDescription className="text-sm">
              Crie uma nova pasta para organizar seus cards promocionais
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Nome
              </Label>
              <Input
                id="name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Nome da pasta"
                autoFocus
                className="text-base sm:text-sm"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => onOpenChange(false)}
              {...getMobileButtonProps()}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              {...getMobileButtonProps()}
            >
              {isSubmitting ? "Criando..." : "Criar Pasta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
