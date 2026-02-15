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
import { Package, User, Baby } from "lucide-react";
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
        className={`${isMobile ? 'w-[calc(100%-2rem)] max-w-full p-0' : 'sm:max-w-[500px] p-0'} max-h-[85vh] overflow-y-auto flex flex-col`}
        hideCloseButton
      >
        <StandardDialogHeader
          icon={Package}
          iconColor="primary"
          title="Nova Contagem de Estoque"
          description="Crie uma nova contagem para organizar o controle de produtos armazenados."
          onClose={() => handleOpenChange(false)}
          loading={loading}
        />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="nome" className="text-sm font-medium">Nome da Contagem *</Label>
              <Input
                id="nome"
                placeholder="Ex: Contagem de Produtos Femininos do Verão"
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

            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="setor" className="text-sm font-medium">Setor da Contagem *</Label>
              <Select value={setor} onValueChange={setSetor} disabled={loading}>
                <SelectTrigger className="h-10 sm:h-11 text-sm sm:text-base">
                  <SelectValue placeholder="Selecione o setor" />
                </SelectTrigger>
                <SelectContent>
                  {setores.map((setorOption) => {
                    const Icon = setorOption.icon;
                    return (
                      <SelectItem key={setorOption.value} value={setorOption.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {setorOption.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="inline-block w-1 h-1 bg-muted-foreground rounded-full"></span>
                Todos os produtos cadastrados serão deste setor
              </p>
            </div>
          </form>
        </div>

        <StandardDialogFooter className={isMobile ? 'flex-col gap-2' : 'flex-row gap-3'}>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => handleOpenChange(false)}
            disabled={loading}
            className={isMobile ? 'w-full h-10' : ''}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={nome.trim().length < 5 || !setor || loading}
            className={isMobile ? 'w-full h-10' : ''}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
