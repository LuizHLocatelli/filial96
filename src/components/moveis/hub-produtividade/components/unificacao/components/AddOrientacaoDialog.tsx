import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useMobileDialog } from "@/hooks/useMobileDialog";

interface AddOrientacaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (orientacao: { titulo: string; tipo: string; descricao: string; conteudo: string }) => void;
}

export function AddOrientacaoDialog({ open, onOpenChange, onAdd }: AddOrientacaoDialogProps) {
  const { getMobileDialogProps, getMobileFooterProps } = useMobileDialog();
  const [formData, setFormData] = useState({
    titulo: '',
    tipo: 'informativo',
    descricao: '',
    conteudo: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (formData.titulo.trim()) {
      onAdd(formData);
      setFormData({
        titulo: '',
        tipo: 'informativo',
        descricao: '',
        conteudo: ''
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent {...getMobileDialogProps("default")}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center">
              <Plus className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              Nova Orientação
            </div>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Crie uma nova orientação para o sistema
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informações Básicas</h3>
            
            <div>
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => handleInputChange('titulo', e.target.value)}
                placeholder="Título da orientação"
                required
              />
            </div>

            <div>
              <Label htmlFor="tipo">Tipo de Orientação</Label>
              <Select value={formData.tipo} onValueChange={(value) => handleInputChange('tipo', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vm">VM (Vendas & Marketing)</SelectItem>
                  <SelectItem value="informativo">Informativo</SelectItem>
                  <SelectItem value="procedimento">Procedimento</SelectItem>
                  <SelectItem value="treinamento">Treinamento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => handleInputChange('descricao', e.target.value)}
                placeholder="Breve descrição da orientação"
                rows={2}
                className="resize-none"
              />
            </div>
          </div>

          {/* Conteúdo */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Conteúdo</h3>
            
            <div>
              <Label htmlFor="conteudo">Conteúdo da Orientação</Label>
              <Textarea
                id="conteudo"
                value={formData.conteudo}
                onChange={(e) => handleInputChange('conteudo', e.target.value)}
                placeholder="Conteúdo detalhado da orientação..."
                rows={6}
                className="resize-none"
              />
              <div className="text-xs text-muted-foreground mt-1">
                Você pode usar formatação HTML básica como &lt;strong&gt;, &lt;em&gt;, &lt;br&gt;, etc.
              </div>
            </div>
          </div>

          {/* Preview do Conteúdo */}
          {formData.conteudo && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Preview</h3>
              <div className="p-4 border rounded-lg bg-muted/30">
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: formData.conteudo }}
                />
              </div>
            </div>
          )}
        </div>

        <div {...getMobileFooterProps()}>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="px-6"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.titulo.trim()}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-lg transition-all duration-300 px-8 hover:scale-105"
          >
            <Plus className="mr-2 h-4 w-4" />
            Criar Orientação
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
