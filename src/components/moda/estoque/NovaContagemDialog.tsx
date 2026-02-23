import { useState } from "react";
import { 
  Dialog, 
  DialogContent
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Package, User, Baby, Tag } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  StandardDialogHeader,
  StandardDialogFooter,
} from "@/components/ui/standard-dialog";

interface NovaContagemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCriar: (nome: string, setor: string) => void;
}

const setores = [
  { value: "masculino", label: "Masculino", icon: User },
  { value: "feminino", label: "Feminino", icon: User },
  { value: "infantil", label: "Infantil", icon: Baby }
];

export function NovaContagemDialog({ open, onOpenChange, onCriar }: NovaContagemDialogProps) {
  const isMobile = useIsMobile();
  const [nome, setNome] = useState("");
  const [setor, setSetor] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (nome.trim().length < 5 || !setor) {
      return;
    }

    setLoading(true);
    try {
      await onCriar(nome.trim(), setor);
      setNome("");
      setSetor("");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!loading) {
      onOpenChange(newOpen);
      if (!newOpen) {
        setNome("");
        setSetor("");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className={`${isMobile ? 'w-[calc(100%-2rem)] max-w-full p-0' : 'sm:max-w-[450px] p-0'} max-h-[85vh] overflow-y-auto flex flex-col glass-overlay border-none`}
        hideCloseButton
      >
        <StandardDialogHeader
          icon={Package}
          iconColor="primary"
          title="Nova Contagem de Estoque"
          description="Crie uma contagem para iniciar a auditoria de produtos armazenados."
          onClose={() => handleOpenChange(false)}
          loading={loading}
        />

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-background/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="nome" className="text-sm font-semibold flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" />
                Nome da Contagem
              </Label>
              <Input
                id="nome"
                placeholder="Ex: Balanço de Inverno 2024"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                minLength={5}
                maxLength={255}
                disabled={loading}
                className="text-base h-12 bg-card border-muted-foreground/20 focus-visible:ring-primary shadow-sm"
              />
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 ml-1">
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${nome.length >= 5 ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`}></span>
                Mínimo de 5 caracteres
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="setor" className="text-sm font-semibold flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                Setor do Estoque
              </Label>
              <Select value={setor} onValueChange={setSetor} disabled={loading}>
                <SelectTrigger className="h-12 text-base bg-card border-muted-foreground/20 shadow-sm focus:ring-primary">
                  <SelectValue placeholder="Selecione um setor" />
                </SelectTrigger>
                <SelectContent className="glass-overlay">
                  {setores.map((setorOption) => {
                    const Icon = setorOption.icon;
                    return (
                      <SelectItem key={setorOption.value} value={setorOption.value} className="py-2.5 cursor-pointer">
                        <div className="flex items-center gap-2.5 font-medium">
                          <div className="p-1.5 bg-primary/10 rounded-md text-primary">
                            <Icon className="h-4 w-4" />
                          </div>
                          {setorOption.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 ml-1">
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${setor ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`}></span>
                Restrito aos produtos deste setor
              </p>
            </div>
          </form>
        </div>

        <StandardDialogFooter className={`bg-background/80 backdrop-blur-sm border-t p-4 sm:p-6 ${isMobile ? 'flex-col gap-3' : 'flex-row gap-3'}`}>
          <Button 
            type="button" 
            variant="ghost" 
            onClick={() => handleOpenChange(false)}
            disabled={loading}
            className={isMobile ? 'w-full h-11' : 'flex-1 h-11'}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={nome.trim().length < 5 || !setor || loading}
            className={`shadow-md ${isMobile ? 'w-full h-11' : 'flex-1 h-11'}`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Criando...
              </>
            ) : (
              <>
                <Package className="h-4 w-4 mr-2" />
                Criar Contagem
              </>
            )}
          </Button>
        </StandardDialogFooter>
      </DialogContent>
    </Dialog>
  );
}
