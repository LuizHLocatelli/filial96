
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Target, 
  TrendingUp, 
  Info,
  Star,
  Eye,
  X
} from 'lucide-react';
import { ProdutoFocoWithImages } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useState } from 'react';

interface ProdutoFocoDetailsProps {
  produto: ProdutoFocoWithImages | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProdutoFocoDetails({ produto, isOpen, onClose }: ProdutoFocoDetailsProps) {
  const [imagemSelecionada, setImagemSelecionada] = useState<string | null>(null);

  if (!produto) return null;

  const desconto = ((produto.preco_de - produto.preco_por) / produto.preco_de) * 100;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {produto.ativo && <Star className="h-5 w-5 text-yellow-500" />}
              {produto.nome_produto}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Código</p>
                <Badge variant="outline">{produto.codigo_produto}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Categoria</p>
                <Badge variant="secondary">{produto.categoria}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={produto.ativo ? "default" : "secondary"}>
                  {produto.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Desconto</p>
                <Badge variant="destructive">-{desconto.toFixed(0)}%</Badge>
              </div>
            </div>

            {/* Galeria de Imagens */}
            {produto.imagens.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Imagens do Produto</h3>
                <Carousel className="w-full">
                  <CarouselContent>
                    {produto.imagens.map((imagem) => (
                      <CarouselItem key={imagem.id} className="md:basis-1/2 lg:basis-1/3">
                        <div 
                          className="aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer"
                          onClick={() => setImagemSelecionada(imagem.imagem_url)}
                        >
                          <img 
                            src={imagem.imagem_url} 
                            alt={imagem.imagem_nome}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {produto.imagens.length > 1 && (
                    <>
                      <CarouselPrevious />
                      <CarouselNext />
                    </>
                  )}
                </Carousel>
              </div>
            )}

            {/* Informações de Preço */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Informações de Preço</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Preço Original</p>
                  <p className="text-lg line-through text-muted-foreground">
                    R$ {produto.preco_de.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Preço Promocional</p>
                  <p className="text-2xl font-bold text-green-600">
                    R$ {produto.preco_por.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Período e Meta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4" />
                  <h3 className="font-semibold">Período do Foco</h3>
                </div>
                <p className="text-sm">
                  De {format(new Date(produto.periodo_inicio), 'dd/MM/yyyy', { locale: ptBR })} {' '}
                  até {format(new Date(produto.periodo_fim), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              </div>

              {produto.meta_vendas && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4" />
                    <h3 className="font-semibold">Meta de Vendas</h3>
                  </div>
                  <p className="text-2xl font-bold">{produto.meta_vendas} unidades</p>
                </div>
              )}
            </div>

            {/* Motivo do Foco */}
            {produto.motivo_foco && (
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4" />
                  <h3 className="font-semibold">Motivo do Foco</h3>
                </div>
                <p className="text-sm">{produto.motivo_foco}</p>
              </div>
            )}

            {/* Informações Adicionais */}
            {produto.informacoes_adicionais && (
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Informações Adicionais</h3>
                <p className="text-sm whitespace-pre-wrap">{produto.informacoes_adicionais}</p>
              </div>
            )}

            {/* Argumentos de Venda */}
            {produto.argumentos_venda && produto.argumentos_venda.length > 0 && (
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4" />
                  <h3 className="font-semibold">Argumentos de Venda</h3>
                </div>
                <div className="space-y-2">
                  {produto.argumentos_venda.map((argumento, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <p className="text-sm">{argumento}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Zoom da Imagem */}
      {imagemSelecionada && (
        <Dialog open={!!imagemSelecionada} onOpenChange={() => setImagemSelecionada(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0">
            <div className="relative">
              <img 
                src={imagemSelecionada} 
                alt="Imagem ampliada"
                className="w-full h-auto max-h-[85vh] object-contain"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
                onClick={() => setImagemSelecionada(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
