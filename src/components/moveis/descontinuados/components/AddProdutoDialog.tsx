
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PackagePlus, Calendar, DollarSign } from 'lucide-react';
import { useMobileDialog } from '@/hooks/useMobileDialog';

interface AddProdutoDialogProps {
  onAdd: (produtoData: any, file?: File) => Promise<void>;
}

export function AddProdutoDialog({ onAdd }: AddProdutoDialogProps) {
  const { getMobileDialogProps, getMobileFooterProps } = useMobileDialog();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: '',
    codigo: '',
    categoria: '',
    preco_original: '',
    descricao: '',
    motivo_descontinuacao: '',
    estoque_restante: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (formData.nome.trim() && formData.codigo.trim()) {
      setIsSubmitting(true);
      try {
        await onAdd({
          ...formData,
          preco_original: formData.preco_original ? parseFloat(formData.preco_original) : 0,
          estoque_restante: formData.estoque_restante ? parseInt(formData.estoque_restante) : 0
        });
        resetForm();
        setOpen(false);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      codigo: '',
      categoria: '',
      preco_original: '',
      descricao: '',
      motivo_descontinuacao: '',
      estoque_restante: ''
    });
  };

  const handleClose = () => {
    resetForm();
    setOpen(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="flex items-center gap-1 sm:gap-2 h-8 px-2 sm:h-auto sm:px-4 text-xs sm:text-sm">
        <PackagePlus className="h-3 w-3 sm:h-4 sm:w-4" />
        <span className="hidden xs:inline">Adicionar</span>
        <span className="xs:hidden">+</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent {...getMobileDialogProps("default")}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center">
                <PackagePlus className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                Adicionar Produto Descontinuado
              </div>
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Registre um novo produto descontinuado no sistema
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informações Básicas</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome do Produto *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    placeholder="Nome do produto"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="codigo">Código do Produto *</Label>
                  <Input
                    id="codigo"
                    value={formData.codigo}
                    onChange={(e) => handleInputChange('codigo', e.target.value)}
                    placeholder="Código/SKU"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select value={formData.categoria} onValueChange={(value) => handleInputChange('categoria', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="moveis">Móveis</SelectItem>
                      <SelectItem value="eletronicos">Eletrônicos</SelectItem>
                      <SelectItem value="decoracao">Decoração</SelectItem>
                      <SelectItem value="iluminacao">Iluminação</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="preco_original">Preço Original</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="preco_original"
                      type="number"
                      step="0.01"
                      value={formData.preco_original}
                      onChange={(e) => handleInputChange('preco_original', e.target.value)}
                      placeholder="0,00"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Detalhes da Descontinuação */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Detalhes da Descontinuação</h3>
              
              <div>
                <Label htmlFor="motivo_descontinuacao">Motivo da Descontinuação</Label>
                <Select value={formData.motivo_descontinuacao} onValueChange={(value) => handleInputChange('motivo_descontinuacao', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa_demanda">Baixa Demanda</SelectItem>
                    <SelectItem value="custo_alto">Custo Alto</SelectItem>
                    <SelectItem value="novo_modelo">Novo Modelo Disponível</SelectItem>
                    <SelectItem value="fornecedor">Problemas com Fornecedor</SelectItem>
                    <SelectItem value="qualidade">Problemas de Qualidade</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="estoque_restante">Estoque Restante</Label>
                <Input
                  id="estoque_restante"
                  type="number"
                  value={formData.estoque_restante}
                  onChange={(e) => handleInputChange('estoque_restante', e.target.value)}
                  placeholder="Quantidade em estoque"
                />
              </div>

              <div>
                <Label htmlFor="descricao">Descrição/Observações</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => handleInputChange('descricao', e.target.value)}
                  placeholder="Descrição adicional do produto ou observações sobre a descontinuação"
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>
          </div>

          <div {...getMobileFooterProps()}>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-6"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.nome.trim() || !formData.codigo.trim() || isSubmitting}
              variant="success"
            >
              <PackagePlus className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Adicionando...' : 'Adicionar Produto'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
