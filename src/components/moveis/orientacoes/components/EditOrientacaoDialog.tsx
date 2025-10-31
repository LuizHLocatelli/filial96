import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit3, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { Orientacao } from "../types";
import { useMobileDialog } from "@/hooks/useMobileDialog";

interface EditOrientacaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orientacao: Orientacao;
  onSave: (data: Partial<Orientacao>) => void;
  isSubmitting: boolean;
  onSuccess?: () => void;
}

export function EditOrientacaoDialog({
  open,
  onOpenChange,
  orientacao,
  onSave,
  isSubmitting,
  onSuccess
}: EditOrientacaoDialogProps) {
  const { getMobileDialogProps, getMobileFooterProps } = useMobileDialog();
  
  const [formData, setFormData] = useState({
    titulo: orientacao.titulo || '',
    tipo: orientacao.tipo || 'informativo',
    conteudo: orientacao.conteudo || '',
    descricao: orientacao.descricao || ''
  });

  useEffect(() => {
    if (orientacao) {
      setFormData({
        titulo: orientacao.titulo || '',
        tipo: orientacao.tipo || 'informativo',
        conteudo: orientacao.conteudo || '',
        descricao: orientacao.descricao || ''
      });
    }
  }, [orientacao]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (formData.titulo.trim()) {
      onSave(formData);
      if (onSuccess) {
        onSuccess();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent {...getMobileDialogProps("default")}>
        {/* Fixed Header */}
        <div className="flex-shrink-0 p-3 md:p-5 lg:p-6 pb-0">
          <DialogHeader className="pr-8">
            <DialogTitle className="text-base md:text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center">
                <Edit3 className="h-4 w-4 md:h-5 md:w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                Editar Orientação
              </div>
            </DialogTitle>
            <DialogDescription className="text-xs md:text-sm text-muted-foreground">
              Modifique os dados da orientação existente
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3 md:p-5 lg:p-6 pt-3">
          <div className="space-y-4 md:space-y-6">
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
                rows={8}
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
        </div>

        {/* Fixed Footer */}
        <div {...getMobileFooterProps()}>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="px-6"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!formData.titulo.trim() || isSubmitting}
            variant="success"
          >
            <Edit3 className="mr-2 h-3 w-3 md:h-4 md:w-4" />
            {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
