
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Upload, X } from 'lucide-react';
import { ProdutoDescontinuadoFormData } from '@/types/descontinuados';

interface AddProdutoDialogProps {
  onAdd: (data: ProdutoDescontinuadoFormData, file?: File) => void;
}

export function AddProdutoDialog({ onAdd }: AddProdutoDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<ProdutoDescontinuadoFormData>({
    nome: '',
    codigo: '',
    categoria: '',
    preco: 0,
    descricao: '',
    percentual_desconto: undefined,
    quantidade_estoque: undefined
  });
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const categorias = [
    'Linha Branca',
    'Som e Imagem', 
    'Telefonia',
    'Linha Móveis',
    'Eletroportáteis',
    'Tecnologia',
    'Automotivo'
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Arquivo muito grande. Máximo 5MB.');
        return;
      }
      
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.codigo || !formData.categoria || !formData.preco) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    setIsLoading(true);
    
    try {
      await onAdd(formData, file || undefined);
      
      // Reset form
      setFormData({
        nome: '',
        codigo: '',
        categoria: '',
        preco: 0,
        descricao: '',
        percentual_desconto: undefined,
        quantidade_estoque: undefined
      });
      removeFile();
      setOpen(false);
    } catch (error) {
      console.error('Erro ao criar produto:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-sm">
          <Plus className="h-4 w-4 mr-2" />
          Novo Produto
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
              <Plus className="h-4 w-4 text-white" />
            </div>
            Adicionar Produto Descontinuado
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome do Produto */}
            <div className="md:col-span-2">
              <Label htmlFor="nome" className="text-sm font-semibold">
                Nome do Produto *
              </Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Ex: Smart TV 55' Samsung"
                required
                className="mt-1"
              />
            </div>

            {/* Código */}
            <div>
              <Label htmlFor="codigo" className="text-sm font-semibold">
                Código *
              </Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
                placeholder="Ex: TV55SAM001"
                required
                className="mt-1"
              />
            </div>

            {/* Categoria */}
            <div>
              <Label className="text-sm font-semibold">
                Categoria *
              </Label>
              <Select value={formData.categoria} onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria} value={categoria}>
                      {categoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Preço */}
            <div>
              <Label htmlFor="preco" className="text-sm font-semibold">
                Preço (R$) *
              </Label>
              <Input
                id="preco"
                type="number"
                step="0.01"
                min="0"
                value={formData.preco}
                onChange={(e) => setFormData(prev => ({ ...prev, preco: Number(e.target.value) }))}
                placeholder="0,00"
                required
                className="mt-1"
              />
            </div>

            {/* Desconto */}
            <div>
              <Label htmlFor="desconto" className="text-sm font-semibold">
                Desconto (%)
              </Label>
              <Input
                id="desconto"
                type="number"
                min="0"
                max="100"
                value={formData.percentual_desconto || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, percentual_desconto: e.target.value ? Number(e.target.value) : undefined }))}
                placeholder="Ex: 20"
                className="mt-1"
              />
            </div>

            {/* Estoque */}
            <div>
              <Label htmlFor="estoque" className="text-sm font-semibold">
                Quantidade em Estoque
              </Label>
              <Input
                id="estoque"
                type="number"
                min="0"
                value={formData.quantidade_estoque || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, quantidade_estoque: e.target.value ? Number(e.target.value) : undefined }))}
                placeholder="Ex: 5"
                className="mt-1"
              />
            </div>

            {/* Descrição */}
            <div className="md:col-span-2">
              <Label htmlFor="descricao" className="text-sm font-semibold">
                Descrição
              </Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descrição breve do produto..."
                rows={3}
                className="mt-1"
              />
            </div>
          </div>

          {/* Upload de Imagem */}
          <div>
            <Label className="text-sm font-semibold">
              Imagem do Produto
            </Label>
            <div className="mt-2">
              {!file ? (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-orange-400 transition-colors">
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Clique para selecionar uma imagem
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG até 5MB
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={removeFile}
                    className="absolute top-2 right-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
            >
              {isLoading ? 'Criando...' : 'Criar Produto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
