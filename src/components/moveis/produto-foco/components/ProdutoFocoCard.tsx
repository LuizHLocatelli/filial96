
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Star, 
  Calendar, 
  Edit, 
  Trash2, 
  Eye,
  Target,
  TrendingUp,
  ImageIcon,
  ShoppingCart
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

interface ProdutoFocoCardProps {
  produto: ProdutoFocoWithImages;
  isActive?: boolean;
  onEdit: (produto: ProdutoFocoWithImages) => void;
  onDelete: (id: string) => void;
  onViewDetails: (produto: ProdutoFocoWithImages) => void;
  onRegistrarVenda?: (produto: ProdutoFocoWithImages) => void;
}

export function ProdutoFocoCard({ 
  produto, 
  isActive = false, 
  onEdit, 
  onDelete, 
  onViewDetails,
  onRegistrarVenda
}: ProdutoFocoCardProps) {
  const desconto = ((produto.preco_de - produto.preco_por) / produto.preco_de) * 100;

  return (
    <Card className={`${isActive ? 'ring-2 ring-primary bg-primary/5' : ''} relative`}>
      {isActive && (
        <div className="absolute -top-2 -right-2 z-10">
          <Badge variant="default" className="bg-primary text-primary-foreground">
            <Star className="h-3 w-3 mr-1" />
            PRODUTO FOCO
          </Badge>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{produto.nome_produto}</CardTitle>
            <div className="flex gap-2 mt-1">
              <Badge variant="outline">{produto.codigo_produto}</Badge>
              <Badge variant="secondary">{produto.categoria}</Badge>
            </div>
          </div>
          <div className="flex gap-1">
            {isActive && onRegistrarVenda && (
              <Button variant="ghost" size="sm" onClick={() => onRegistrarVenda(produto)} title="Registrar Venda">
                <ShoppingCart className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => onViewDetails(produto)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onEdit(produto)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(produto.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Galeria de Imagens */}
        {produto.imagens.length > 0 ? (
          <div className="relative">
            <Carousel className="w-full">
              <CarouselContent>
                {produto.imagens.map((imagem) => (
                  <CarouselItem key={imagem.id}>
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                      <img 
                        src={imagem.imagem_url} 
                        alt={imagem.imagem_nome}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {produto.imagens.length > 1 && (
                <>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </>
              )}
            </Carousel>
          </div>
        ) : (
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <ImageIcon className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Sem imagens</p>
            </div>
          </div>
        )}

        {/* Informações de Preço */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">De:</span>
            <span className="text-sm line-through text-muted-foreground">
              R$ {produto.preco_de.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Por:</span>
            <div className="text-right">
              <span className="text-lg font-bold text-green-600">
                R$ {produto.preco_por.toFixed(2)}
              </span>
              <Badge variant="destructive" className="ml-2">
                -{desconto.toFixed(0)}%
              </Badge>
            </div>
          </div>
        </div>

        {/* Período */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>
            {format(new Date(produto.periodo_inicio), 'dd/MM', { locale: ptBR })} - {' '}
            {format(new Date(produto.periodo_fim), 'dd/MM/yyyy', { locale: ptBR })}
          </span>
        </div>

        {/* Meta de Vendas */}
        {produto.meta_vendas && (
          <div className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span>Meta: {produto.meta_vendas} unidades</span>
          </div>
        )}

        {/* Informações Adicionais */}
        {produto.informacoes_adicionais && (
          <div className="text-sm text-muted-foreground">
            <p className="line-clamp-2">{produto.informacoes_adicionais}</p>
          </div>
        )}

        {/* Argumentos de Venda */}
        {produto.argumentos_venda && produto.argumentos_venda.length > 0 && (
          <div className="space-y-1">
            <span className="text-sm font-medium flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Argumentos de Venda:
            </span>
            <div className="flex flex-wrap gap-1">
              {produto.argumentos_venda.slice(0, 2).map((argumento, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {argumento}
                </Badge>
              ))}
              {produto.argumentos_venda.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{produto.argumentos_venda.length - 2} mais
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
