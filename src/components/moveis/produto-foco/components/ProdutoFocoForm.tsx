
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Upload, X, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ProdutoFocoWithImages } from '../types';
import { Badge } from '@/components/ui/badge';

interface ProdutoFocoFormProps {
  produto?: ProdutoFocoWithImages;
  onSubmit: (dados: any) => Promise<void>;
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
    preco_de: 0,
    preco_por: 0,
    periodo_inicio: new Date(),
    periodo_fim: new Date(),
    informacoes_adicionais: '',
    motivo_foco: '',
    meta_vendas: 0,
    argumentos_venda: [] as string[],
    ativo: true
  });
  
  const [novoArgumento, setNovoArgumento] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (produto) {
      setFormData({
        nome_produto: produto.nome_produto,
        codigo_produto: produto.codigo_produto,
        categoria: produto.categoria,
        preco_de: produto.preco_de,
        preco_por: produto.preco_por,
        periodo_inicio: new Date(produto.periodo_inicio),
        periodo_fim: new Date(produto.periodo_fim),
        informacoes_adicionais: produto.informacoes_adicionais || '',
        motivo_foco: produto.motivo_foco || '',
        meta_vendas: produto.meta_vendas || 0,
        argumentos_venda: produto.argumentos_venda || [],
        ativo: produto.ativo
      });
    }
  }, [produto]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit({
        ...formData,
        periodo_inicio: formData.periodo_inicio.toISOString().split('T')[0],
        periodo_fim: formData.periodo_fim.toISOString().split('T')[0]
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !onUploadImagem) return;

    for (let i = 0; i < files.length; i++) {
      await onUploadImagem(files[i]);
    }
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
      <CardHeader>
        <CardTitle>
          {produto ? 'Editar Produto Foco' : 'Novo Produto Foco'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome_produto">Nome do Produto</Label>
              <Input
                id="nome_produto"
                value={formData.nome_produto}
                onChange={(e) => setFormData(prev => ({ ...prev, nome_produto: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="codigo_produto">Código do Produto</Label>
              <Input
                id="codigo_produto"
                value={formData.codigo_produto}
                onChange={(e) => setFormData(prev => ({ ...prev, codigo_produto: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="categoria">Categoria</Label>
            <Input
              id="categoria"
              value={formData.categoria}
              onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
              required
            />
          </div>

          {/* Preços */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="preco_de">Preço De (R$)</Label>
              <Input
                id="preco_de"
                type="number"
                step="0.01"
                value={formData.preco_de}
                onChange={(e) => setFormData(prev => ({ ...prev, preco_de: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="preco_por">Preço Por (R$)</Label>
              <Input
                id="preco_por"
                type="number"
                step="0.01"
                value={formData.preco_por}
                onChange={(e) => setFormData(prev => ({ ...prev, preco_por: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>
          </div>

          {/* Período */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Data de Início</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
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
              <Label>Data de Fim</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
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
            <Label htmlFor="meta_vendas">Meta de Vendas (unidades)</Label>
            <Input
              id="meta_vendas"
              type="number"
              value={formData.meta_vendas}
              onChange={(e) => setFormData(prev => ({ ...prev, meta_vendas: parseInt(e.target.value) || 0 }))}
            />
          </div>

          <div>
            <Label htmlFor="motivo_foco">Motivo do Foco</Label>
            <Textarea
              id="motivo_foco"
              value={formData.motivo_foco}
              onChange={(e) => setFormData(prev => ({ ...prev, motivo_foco: e.target.value }))}
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="informacoes_adicionais">Informações Adicionais</Label>
            <Textarea
              id="informacoes_adicionais"
              value={formData.informacoes_adicionais}
              onChange={(e) => setFormData(prev => ({ ...prev, informacoes_adicionais: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Argumentos de Venda */}
          <div>
            <Label>Argumentos de Venda</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={novoArgumento}
                  onChange={(e) => setNovoArgumento(e.target.value)}
                  placeholder="Digite um argumento de venda"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), adicionarArgumento())}
                />
                <Button type="button" onClick={adicionarArgumento} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.argumentos_venda.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.argumentos_venda.map((argumento, index) => (
                    <Badge key={index} variant="secondary" className="pr-1">
                      {argumento}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1"
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
          {produto && onUploadImagem && (
            <div>
              <Label>Imagens do Produto</Label>
              <div className="space-y-4">
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="cursor-pointer"
                  />
                </div>
                {produto.imagens.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {produto.imagens.map((imagem) => (
                      <div key={imagem.id} className="relative">
                        <img
                          src={imagem.imagem_url}
                          alt={imagem.imagem_nome}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        {onDeleteImagem && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0"
                            onClick={() => onDeleteImagem(imagem.id, imagem.imagem_url)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : produto ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
