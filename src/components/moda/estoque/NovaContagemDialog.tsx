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
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg mx-auto">
        <DialogHeader className="text-center space-y-3 sm:space-y-4">
          <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Package className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
          <div>
            <DialogTitle className="text-lg sm:text-xl">Nova Contagem de Estoque</DialogTitle>
            <DialogDescription className="mt-1 sm:mt-2 text-sm">
              Crie uma nova contagem para organizar o controle de produtos armazenados.
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-2 sm:space-y-3">
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
              className="text-sm sm:text-base h-10 sm:h-11"
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="inline-block w-1 h-1 bg-muted-foreground rounded-full"></span>
              Mínimo de 5 caracteres
            </p>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleOpenChange(false)}
              disabled={loading}
              className="w-full sm:w-auto h-10 sm:h-11 text-sm"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={nome.trim().length < 5 || loading}
              className="w-full sm:w-auto gap-2 h-10 sm:h-11 text-sm"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span className="hidden sm:inline">Criando...</span>
                  <span className="sm:hidden">Criando...</span>
                </>
              ) : (
                <>
                  <Package className="h-4 w-4" />
                  <span className="hidden sm:inline">Criar Contagem</span>
                  <span className="sm:hidden">Criar</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}