import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package } from "lucide-react";

interface NovaContagemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCriar: (nome: string) => void;
}

export function NovaContagemDialog({ open, onOpenChange, onCriar }: NovaContagemDialogProps) {
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (nome.trim().length < 5) {
      return;
    }

    setLoading(true);
    try {
      await onCriar(nome.trim());
      setNome("");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!loading) {
      onOpenChange(newOpen);
      if (!newOpen) {
        setNome("");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <DialogTitle>Nova Contagem de Estoque</DialogTitle>
          </div>
          <DialogDescription>
            Crie uma nova contagem para organizar o controle de produtos armazenados.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Contagem *</Label>
            <Input
              id="nome"
              placeholder="Ex: Contagem de Produtos Armazenados do Verão"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              minLength={5}
              maxLength={255}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Mínimo de 5 caracteres
            </p>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={nome.trim().length < 5 || loading}
              className="gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Criando...
                </>
              ) : (
                <>
                  <Package className="h-4 w-4" />
                  Criar Contagem
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}