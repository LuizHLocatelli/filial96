import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PackagePlus, DollarSign } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { StandardDialogHeader, StandardDialogFooter } from '@/components/ui/standard-dialog';

interface ProdutoData {
  nome: string;
  codigo: string;
  categoria: string;
  preco_original: number;
  descricao: string;
  motivo_descontinuacao: string;
  estoque_restante: number;
}

interface AddProdutoDialogProps {
  onAdd: (produtoData: ProdutoData, file?: File) => Promise<void>;
}

export function AddProdutoDialog({ onAdd }: AddProdutoDialogProps) {
  const isMobile = useIsMobile();
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
      <Button 
        onClick={() => setOpen(true)} 
        className="button-responsive-sm border-2 transition-all duration-200 w-full sm:w-auto"
        variant="success"
      >
        <PackagePlus className="h-3 w-3 sm:h-4 sm:w-4" />
        <span className="hidden xs:inline ml-1">Adicionar</span>
        <span className="xs:hidden ml-1">+</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent 
          className={`${isMobile ? 'w-[calc(100%-2rem)] max-w-full p-0' : 'sm:max-w-2xl p-0'} max-h-[85vh] overflow-y-auto flex flex-col`}
          hideCloseButton
        >
          <StandardDialogHeader
            icon={PackagePlus}
            iconColor="primary"
            title="Adicionar Produto Descontinuado"
            description="Registre um novo produto descontinuado no sistema"
            onClose={handleClose}
            loading={isSubmitting}
          />

          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="space-y-6">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground">Informações Básicas</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome" className="text-foreground">Nome do Produto *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => handleInputChange('nome', e.target.value)}
                      placeholder="Nome do produto"
                      required
                      className="border-2 border-border"
                    />
                  </div>

                  <div>
                    <Label htmlFor="codigo" className="text-foreground">Código do Produto *</Label>
                    <Input
                      id="codigo"
                      value={formData.codigo}
                      onChange={(e) => handleInputChange('codigo', e.target.value)}
                      placeholder="Código/SKU"
                      required
                      className="border-2 border-border"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="categoria" className="text-foreground">Categoria</Label>
                    <Select value={formData.categoria} onValueChange={(value) => handleInputChange('categoria', value)}>
                      <SelectTrigger className="border-2 border-border">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent className="border-2 border-border">
                        <SelectItem value="moveis">Móveis</SelectItem>
                        <SelectItem value="eletronicos">Eletrônicos</SelectItem>
                        <SelectItem value="decoracao">Decoração</SelectItem>
                        <SelectItem value="iluminacao">Iluminação</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="preco_original" className="text-foreground">Preço Original</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="preco_original"
                        type="number"
                        step="0.01"
                        value={formData.preco_original}
                        onChange={(e) => handleInputChange('preco_original', e.target.value)}
                        placeholder="0,00"
                        className="pl-10 border-2 border-border"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Detalhes da Descontinuação */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground">Detalhes da Descontinuação</h3>
                
                <div>
                  <Label htmlFor="motivo_descontinuacao" className="text-foreground">Motivo da Descontinuação</Label>
                  <Select value={formData.motivo_descontinuacao} onValueChange={(value) => handleInputChange('motivo_descontinuacao', value)}>
                    <SelectTrigger className="border-2 border-border">
                      <SelectValue placeholder="Selecione o motivo" />
                    </SelectTrigger>
                    <SelectContent className="border-2 border-border">
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
                  <Label htmlFor="estoque_restante" className="text-foreground">Estoque Restante</Label>
                  <Input
                    id="estoque_restante"
                    type="number"
                    value={formData.estoque_restante}
                    onChange={(e) => handleInputChange('estoque_restante', e.target.value)}
                    placeholder="Quantidade em estoque"
                    className="border-2 border-border"
                  />
                </div>

                <div>
                  <Label htmlFor="descricao" className="text-foreground">Descrição/Observações</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => handleInputChange('descricao', e.target.value)}
                    placeholder="Descrição adicional do produto ou observações sobre a descontinuação"
                    rows={3}
                    className="resize-none border-2 border-border"
                  />
                </div>
              </div>
            </div>
          </div>

          <StandardDialogFooter className={isMobile ? 'flex-col gap-2' : 'flex-row gap-3'}>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className={isMobile ? 'w-full' : 'px-6'}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.nome.trim() || !formData.codigo.trim() || isSubmitting}
              variant="success"
              className={isMobile ? 'w-full' : ''}
            >
              <PackagePlus className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Adicionando...' : 'Adicionar Produto'}
            </Button>
          </StandardDialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
