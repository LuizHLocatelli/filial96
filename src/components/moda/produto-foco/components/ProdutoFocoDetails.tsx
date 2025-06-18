import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
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
  X,
  Download
} from 'lucide-react';
import { ProdutoFocoWithImages } from '@/types/produto-foco';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useState } from 'react';
import { toast } from 'sonner';

interface ProdutoFocoDetailsProps {
  produto: ProdutoFocoWithImages | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProdutoFocoDetails({ produto, isOpen, onClose }: ProdutoFocoDetailsProps) {
  const [imagemSelecionada, setImagemSelecionada] = useState<string | null>(null);

  if (!produto) return null;

  const desconto = ((produto.preco_de - produto.preco_por) / produto.preco_de) * 100;

  const handleDownloadImage = async (imageUrl: string, imageName: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${produto.nome_produto}_${imageName}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Download da imagem iniciado');
    } catch (error) {
      console.error('Erro ao fazer download da imagem:', error);
      toast.error('Erro ao fazer download da imagem');
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto sm:rounded-xl rounded-2xl mx-2 sm:mx-auto">
          <DialogHeader className="px-2 sm:px-0">
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
              {produto.ativo && <Star className="h-5 w-5 text-yellow-500" />}
              {produto.nome_produto}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
            {/* Informações Básicas */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Código</p>
                <Badge variant="outline" className="text-xs">{produto.codigo_produto}</Badge>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Categoria</p>
                <Badge variant="secondary" className="text-xs">{produto.categoria}</Badge>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Status</p>
                <Badge variant={produto.ativo ? "default" : "secondary"} className="text-xs">
                  {produto.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Desconto</p>
                <Badge variant="destructive" className="text-xs">-{desconto.toFixed(0)}%</Badge>
              </div>
            </div>

            {/* Galeria de Imagens com proporção 4:5 */}
            {produto.imagens.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 text-base sm:text-lg">Imagens do Produto</h3>
                <Carousel className="w-full">
                  <CarouselContent>
                    {produto.imagens.map((imagem) => (
                      <CarouselItem key={imagem.id} className="sm:basis-1/2 lg:basis-1/3">
                        <div className="space-y-2">
                          <AspectRatio ratio={4/5}>
                            <div 
                              className="w-full h-full bg-muted rounded-lg overflow-hidden cursor-pointer group relative"
                              onClick={() => setImagemSelecionada(imagem.imagem_url)}
                            >
                              <img 
                                src={imagem.imagem_url} 
                                alt={imagem.imagem_nome}
                                className="w-full h-full object-cover hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Eye className="h-6 w-6 text-white" />
                              </div>
                            </div>
                          </AspectRatio>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full text-xs"
                            onClick={() => handleDownloadImage(imagem.imagem_url, imagem.imagem_nome)}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Baixar
                          </Button>
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
            <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
              <h3 className="font-semibold mb-3 text-base sm:text-lg">Informações de Preço</h3>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Preço Original</p>
                  <p className="text-base sm:text-lg line-through text-muted-foreground">
                    R$ {produto.preco_de.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Preço Promocional</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">
                    R$ {produto.preco_por.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Período e Meta */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4" />
                  <h3 className="font-semibold text-sm sm:text-base">Período do Foco</h3>
                </div>
                <p className="text-xs sm:text-sm">
                  De {format(new Date(produto.periodo_inicio), 'dd/MM/yyyy', { locale: ptBR })} {' '}
                  até {format(new Date(produto.periodo_fim), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              </div>

              {produto.meta_vendas && (
                <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4" />
                    <h3 className="font-semibold text-sm sm:text-base">Meta de Vendas</h3>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold">{produto.meta_vendas} unidades</p>
                </div>
              )}
            </div>

            {/* Motivo do Foco */}
            {produto.motivo_foco && (
              <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4" />
                  <h3 className="font-semibold text-sm sm:text-base">Motivo do Foco</h3>
                </div>
                <p className="text-xs sm:text-sm">{produto.motivo_foco}</p>
              </div>
            )}

            {/* Informações Adicionais */}
            {produto.informacoes_adicionais && (
              <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
                <h3 className="font-semibold mb-2 text-sm sm:text-base">Informações Adicionais</h3>
                <p className="text-xs sm:text-sm whitespace-pre-wrap">{produto.informacoes_adicionais}</p>
              </div>
            )}

            {/* Argumentos de Venda */}
            {produto.argumentos_venda && produto.argumentos_venda.length > 0 && (
              <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4" />
                  <h3 className="font-semibold text-sm sm:text-base">Argumentos de Venda</h3>
                </div>
                <div className="space-y-2">
                  {produto.argumentos_venda.map((argumento, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <p className="text-xs sm:text-sm">{argumento}</p>
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
          <DialogContent className="max-w-4xl max-h-[85vh] p-0 sm:rounded-xl rounded-2xl mx-2 sm:mx-auto">
            <DialogHeader className="sr-only">
              <DialogTitle>Visualização Ampliada</DialogTitle>
              <DialogDescription>
                Imagem do produto em tamanho ampliado para melhor visualização
              </DialogDescription>
            </DialogHeader>
            <div className="relative">
              <img 
                src={imagemSelecionada} 
                alt="Imagem ampliada"
                className="w-full h-auto max-h-[85vh] object-contain rounded-2xl sm:rounded-xl"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70 rounded-full"
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