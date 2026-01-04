import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit2, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
      <DialogContent className="max-w-md sm:max-w-lg mx-auto">
        <DialogHeader className="space-y-2 sm:space-y-3">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center flex-shrink-0">
              <Edit2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <span>Editar Nome da Contagem</span>
          </DialogTitle>
          <DialogDescription className="text-sm ml-12">
            Altere o nome da contagem para facilitar a identificação.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-2 sm:space-y-3">
            <Label htmlFor="nome-contagem" className="text-sm sm:text-base">Nome da Contagem *</Label>
            <Input
              id="nome-contagem"
              placeholder="Ex: Contagem Janeiro 2024"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              disabled={loading}
              maxLength={100}
              className="h-10 sm:h-11 text-sm sm:text-base"
            />
            <p className="text-xs sm:text-sm text-muted-foreground">
              Máximo 100 caracteres
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto h-10 sm:h-11 text-sm sm:text-base order-2 sm:order-1"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!nome.trim() || loading}
              className="w-full sm:w-auto h-10 sm:h-11 text-sm sm:text-base gap-1.5 sm:gap-2 order-1 sm:order-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                  <span className="hidden sm:inline">Salvando...</span>
                  <span className="sm:hidden">Salvando</span>
                </>
              ) : (
                <>
                  <Package className="h-3 w-3 sm:h-4 sm:w-4" />
                  Salvar Nome
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}