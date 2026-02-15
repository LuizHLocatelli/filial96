import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit2, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  StandardDialogHeader,
  StandardDialogFooter,
} from "@/components/ui/standard-dialog";

interface Contagem {
  id: string;
  nome: string;
  status: "em_andamento" | "finalizada";
}

interface EditarNomeContagemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contagem: Contagem | null;
  onContagemAtualizada: () => void;
}

export function EditarNomeContagemDialog({ 
  open, 
  onOpenChange, 
  contagem,
  onContagemAtualizada 
}: EditarNomeContagemDialogProps) {
  const isMobile = useIsMobile();
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (contagem) {
      setNome(contagem.nome);
    }
  }, [contagem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome.trim()) {
      toast({
        title: "Erro",
        description: "O nome da contagem não pode estar vazio.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("moda_estoque_contagens")
        .update({ nome: nome.trim() })
        .eq("id", contagem.id);

      if (error) {
        console.error("Erro ao atualizar contagem:", error);
        toast({
          title: "Erro",
          description: `Erro ao atualizar contagem: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Nome da contagem atualizado com sucesso!",
      });

      onContagemAtualizada();
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao atualizar contagem:", error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar contagem.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!contagem) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`${isMobile ? 'w-[calc(100%-2rem)] max-w-full p-0' : 'sm:max-w-[500px] p-0'} max-h-[85vh] overflow-y-auto flex flex-col`}
        hideCloseButton
      >
        <StandardDialogHeader
          icon={Edit2}
          iconColor="primary"
          title="Editar Nome da Contagem"
          description="Altere o nome da contagem para facilitar a identificação."
          onClose={() => onOpenChange(false)}
          loading={loading}
        />
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome-contagem">Nome da Contagem *</Label>
              <Input
                id="nome-contagem"
                placeholder="Ex: Contagem Janeiro 2024"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                disabled={loading}
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                Máximo 100 caracteres
              </p>
            </div>
          </form>
        </div>

        <StandardDialogFooter className={isMobile ? 'flex-col gap-2' : 'flex-row gap-3'}>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className={isMobile ? 'w-full h-10' : ''}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!nome.trim() || loading}
            className={isMobile ? 'w-full h-10' : ''}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Salvando...
              </>
            ) : (
              <>
                <Package className="h-4 w-4 mr-2" />
                Salvar Nome
              </>
            )}
          </Button>
        </StandardDialogFooter>
      </DialogContent>
    </Dialog>
  );
}
