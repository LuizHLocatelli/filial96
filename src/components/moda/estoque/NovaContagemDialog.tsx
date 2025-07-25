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
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <div>
            <DialogTitle className="text-xl">Nova Contagem de Estoque</DialogTitle>
            <DialogDescription className="mt-2">
              Crie uma nova contagem para organizar o controle de produtos armazenados.
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="nome" className="text-sm font-medium">Nome da Contagem *</Label>
            <Input
              id="nome"
              placeholder="Ex: Contagem de Produtos Armazenados do Verão"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              minLength={5}
              maxLength={255}
              disabled={loading}
              className="text-base"
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="inline-block w-1 h-1 bg-muted-foreground rounded-full"></span>
              Mínimo de 5 caracteres
            </p>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleOpenChange(false)}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={nome.trim().length < 5 || loading}
              className="w-full sm:w-auto gap-2"
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