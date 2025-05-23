
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Upload, X, Plus, ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ProdutoFocoWithImages } from '../types';
import { Badge } from '@/components/ui/badge';

interface ProdutoFocoFormProps {
  produto?: ProdutoFocoWithImages;
  onSubmit: (dados: any, imagens?: File[]) => Promise<void>;
  onCancel: () => void;
  onUploadImagem?: (file: File) => Promise<void>;
  onDeleteImagem?: (imagemId: string, imagemUrl: string) => Promise<void>;
}

export function ProdutoFocoForm({ 
  produto, 
  onSubmit, 
  onCancel,
  onUploadImagem,
  onDeleteImagem
}: ProdutoFocoFormProps) {
  const [formData, setFormData] = useState({
    nome_produto: '',
    codigo_produto: '',
    categoria: '',
    preco_de: '',
    preco_por: '',
    periodo_inicio: new Date(),
    periodo_fim: new Date(),
    informacoes_adicionais: '',
    motivo_foco: '',
    meta_vendas: '',
    argumentos_venda: [] as string[],
    ativo: true
  });
  
  const [novoArgumento, setNovoArgumento] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [novasImagens, setNovasImagens] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    if (produto) {
      setFormData({
        nome_produto: produto.nome_produto,
        codigo_produto: produto.codigo_produto,
        categoria: produto.categoria,
        preco_de: produto.preco_de.toString(),
        preco_por: produto.preco_por.toString(),
        periodo_inicio: new Date(produto.periodo_inicio),
        periodo_fim: new Date(produto.periodo_fim),
        informacoes_adicionais: produto.informacoes_adicionais || '',
        motivo_foco: produto.motivo_foco || '',
        meta_vendas: produto.meta_vendas?.toString() || '',
        argumentos_venda: produto.argumentos_venda || [],
        ativo: produto.ativo
      });
    }
  }, [produto]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const dadosFormatados = {
        ...formData,
        preco_de: parseFloat(formData.preco_de) || 0,
        preco_por: parseFloat(formData.preco_por) || 0,
        meta_vendas: parseInt(formData.meta_vendas) || 0,
        periodo_inicio: formData.periodo_inicio.toISOString().split('T')[0],
        periodo_fim: formData.periodo_fim.toISOString().split('T')[0]
      };
      
      await onSubmit(dadosFormatados, novasImagens);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const novosArquivos = Array.from(files);
    
    if (produto && onUploadImagem) {
      // Para produtos existentes, upload direto
      for (let i = 0; i < novosArquivos.length; i++) {
        await onUploadImagem(novosArquivos[i]);
      }
    } else {
      // Para novos produtos, armazenar temporariamente
      setNovasImagens(prev => [...prev, ...novosArquivos]);
      
      // Criar URLs de preview
      const urls = novosArquivos.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...urls]);
    }
  };

  const removeNovaImagem = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setNovasImagens(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const adicionarArgumento = () => {
    if (novoArgumento.trim()) {
      setFormData(prev => ({
        ...prev,
        argumentos_venda: [...prev.argumentos_venda, novoArgumento.trim()]
      }));
      setNovoArgumento('');
    }
  };

  const removerArgumento = (index: number) => {
    setFormData(prev => ({
      ...prev,
      argumentos_venda: prev.argumentos_venda.filter((_, i) => i !== index)
    }));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg sm:text-xl">
          {produto ? 'Editar Produto Foco' : 'Novo Produto Foco'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="nome_produto" className="text-sm">Nome do Produto *</Label>
              <Input
                id="nome_produto"
                value={formData.nome_produto}
                onChange={(e) => setFormData(prev => ({ ...prev, nome_produto: e.target.value }))}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="codigo_produto" className="text-sm">Código do Produto *</Label>
              <Input
                id="codigo_produto"
                value={formData.codigo_produto}
                onChange={(e) => setFormData(prev => ({ ...prev, codigo_produto: e.target.value }))}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="categoria" className="text-sm">Categoria *</Label>
              <Input
                id="categoria"
                value={formData.categoria}
                onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                required
                className="mt-1"
              />
            </div>
          </div>

          {/* Preços */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="preco_de" className="text-sm">Preço De (R$) *</Label>
              <Input
                id="preco_de"
                type="number"
                step="0.01"
                min="0"
                value={formData.preco_de}
                onChange={(e) => setFormData(prev => ({ ...prev, preco_de: e.target.value }))}
                required
                className="mt-1"
                placeholder="0,00"
              />
            </div>
            <div>
              <Label htmlFor="preco_por" className="text-sm">Preço Por (R$) *</Label>
              <Input
                id="preco_por"
                type="number"
                step="0.01"
                min="0"
                value={formData.preco_por}
                onChange={(e) => setFormData(prev => ({ ...prev, preco_por: e.target.value }))}
                required
                className="mt-1"
                placeholder="0,00"
              />
            </div>
          </div>

          {/* Período */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label className="text-sm">Data de Início *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal mt-1">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.periodo_inicio, 'dd/MM/yyyy', { locale: ptBR })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.periodo_inicio}
                    onSelect={(date) => date && setFormData(prev => ({ ...prev, periodo_inicio: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label className="text-sm">Data de Fim *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal mt-1">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.periodo_fim, 'dd/MM/yyyy', { locale: ptBR })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.periodo_fim}
                    onSelect={(date) => date && setFormData(prev => ({ ...prev, periodo_fim: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <Label htmlFor="meta_vendas" className="text-sm">Meta de Vendas (unidades)</Label>
            <Input
              id="meta_vendas"
              type="number"
              min="0"
              value={formData.meta_vendas}
              onChange={(e) => setFormData(prev => ({ ...prev, meta_vendas: e.target.value }))}
              className="mt-1"
              placeholder="0"
            />
          </div>

          <div>
            <Label htmlFor="motivo_foco" className="text-sm">Motivo do Foco</Label>
            <Textarea
              id="motivo_foco"
              value={formData.motivo_foco}
              onChange={(e) => setFormData(prev => ({ ...prev, motivo_foco: e.target.value }))}
              rows={2}
              className="mt-1 resize-none"
            />
          </div>

          <div>
            <Label htmlFor="informacoes_adicionais" className="text-sm">Informações Adicionais</Label>
            <Textarea
              id="informacoes_adicionais"
              value={formData.informacoes_adicionais}
              onChange={(e) => setFormData(prev => ({ ...prev, informacoes_adicionais: e.target.value }))}
              rows={3}
              className="mt-1 resize-none"
            />
          </div>

          {/* Argumentos de Venda */}
          <div>
            <Label className="text-sm">Argumentos de Venda</Label>
            <div className="space-y-2 mt-1">
              <div className="flex gap-2">
                <Input
                  value={novoArgumento}
                  onChange={(e) => setNovoArgumento(e.target.value)}
                  placeholder="Digite um argumento de venda"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), adicionarArgumento())}
                  className="flex-1"
                />
                <Button type="button" onClick={adicionarArgumento} size="sm" className="px-3">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.argumentos_venda.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.argumentos_venda.map((argumento, index) => (
                    <Badge key={index} variant="secondary" className="pr-1 text-xs">
                      {argumento}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                        onClick={() => removerArgumento(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Upload de Imagens */}
          <div>
            <Label className="text-sm">Imagens do Produto</Label>
            <div className="space-y-4 mt-1">
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
              </div>
              
              {/* Imagens Existentes (apenas para edição) */}
              {produto && produto.imagens.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">Imagens Atuais</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
                    {produto.imagens.map((imagem) => (
                      <div key={imagem.id} className="relative group">
                        <img
                          src={imagem.imagem_url}
                          alt={imagem.imagem_nome}
                          className="w-full h-20 object-cover rounded-lg border"
                        />
                        {onDeleteImagem && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => onDeleteImagem(imagem.id, imagem.imagem_url)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Novas Imagens (para criação) */}
              {novasImagens.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">Novas Imagens</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeNovaImagem(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Estado vazio */}
              {(!produto || produto.imagens.length === 0) && novasImagens.length === 0 && (
                <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                  <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Nenhuma imagem selecionada
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="order-2 sm:order-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="order-1 sm:order-2">
              {isSubmitting ? 'Salvando...' : produto ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
