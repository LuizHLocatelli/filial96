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
    
    if (!contagem || !nome.trim()) {
      toast({
        title: "Erro",
        description: "O nome da contagem é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("moda_estoque_contagens")
        .update({
          nome: nome.trim(),
          updated_at: new Date().toISOString()
        })
        .eq("id", contagem.id);

      if (error) throw error;
      
      toast({
        title: "✅ Nome atualizado!",
        description: `A contagem foi renomeada para "${nome.trim()}"`
      });

      onContagemAtualizada();
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao atualizar nome da contagem:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o nome da contagem.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!contagem) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit2 className="h-5 w-5" />
            Editar Nome da Contagem
          </DialogTitle>
          <DialogDescription>
            Altere o nome da contagem para facilitar a identificação.
          </DialogDescription>
        </DialogHeader>
        
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

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!nome.trim() || loading}
              className="gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Package className="h-4 w-4" />
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