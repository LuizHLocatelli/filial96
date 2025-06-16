
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Share2, 
  Trash2, 
  Package, 
  Monitor, 
  Phone, 
  Sofa, 
  Zap, 
  Laptop, 
  Car 
} from 'lucide-react';
import { ProdutoDescontinuado } from '@/types/descontinuados';
import { useAuth } from '@/contexts/auth';

interface ProdutoCardProps {
  produto: ProdutoDescontinuado;
  onToggleFavorito: (id: string, favorito: boolean) => void;
  onDelete: (id: string) => void;
}

const categoriaIcons = {
  'Linha Branca': Package,
  'Som e Imagem': Monitor,
  'Telefonia': Phone,
  'Linha Móveis': Sofa,
  'Eletroportáteis': Zap,
  'Tecnologia': Laptop,
  'Automotivo': Car
};

export function ProdutoCard({ produto, onToggleFavorito, onDelete }: ProdutoCardProps) {
  const [imageError, setImageError] = useState(false);
  const { user } = useAuth();
  const IconComponent = categoriaIcons[produto.categoria];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const handleShare = () => {
    const message = `🔥 *OPORTUNIDADE ESPECIAL* 🔥

*${produto.nome}*
Código: ${produto.codigo}
${produto.descricao ? `${produto.descricao}\n` : ''}
💰 Preço especial: *${formatPrice(produto.preco)}*
${produto.percentual_desconto ? `🎯 Desconto de ${produto.percentual_desconto}%` : ''}

⚠️ Produto descontinuado - Estoque limitado!

Interessado(a)? Entre em contato comigo! 📱`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const canDelete = user?.id === produto.created_by;

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/70 dark:bg-gray-800/30 backdrop-blur-sm">
      <CardContent className="p-3 sm:p-4">
        {/* Badge e Ações */}
        <div className="flex justify-between items-start mb-2 sm:mb-3">
          <Badge 
            variant="destructive" 
            className="bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold px-2 py-0.5 sm:px-3 sm:py-1 shadow-sm text-xs"
          >
            DESCONTINUADO
          </Badge>
          <div className="flex gap-0.5 sm:gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleFavorito(produto.id, produto.favorito)}
              className="p-1 h-6 w-6 sm:h-auto sm:w-auto hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Heart 
                className={`h-3 w-3 sm:h-4 sm:w-4 ${produto.favorito ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
              />
            </Button>
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(produto.id)}
                className="p-1 h-6 w-6 sm:h-auto sm:w-auto hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500"
              >
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Imagem do Produto */}
        <div className="aspect-square mb-3 sm:mb-4 rounded-lg sm:rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center">
          {produto.imagem_url && !imageError ? (
            <img
              src={produto.imagem_url}
              alt={produto.nome}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
              <Package className="h-8 w-8 sm:h-12 sm:w-12 mb-1 sm:mb-2" />
              <span className="text-xs">Sem imagem</span>
            </div>
          )}
        </div>

        {/* Informações do Produto */}
        <div className="space-y-1.5 sm:space-y-2">
          <h3 className="font-bold text-sm sm:text-lg text-gray-800 dark:text-gray-100 leading-tight line-clamp-2">
            {produto.nome}
          </h3>
          
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Código: {produto.codigo}
          </p>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <IconComponent className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate">
              {produto.categoria}
            </span>
          </div>

          {produto.descricao && (
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {produto.descricao}
            </p>
          )}

          {/* Preço e Estoque */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex flex-col">
              <span className="text-lg sm:text-2xl font-bold text-primary">
                {formatPrice(produto.preco)}
              </span>
              {produto.percentual_desconto && (
                <span className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 font-medium">
                  {produto.percentual_desconto}% OFF
                </span>
              )}
            </div>
            
            {produto.quantidade_estoque !== null && produto.quantidade_estoque !== undefined && (
              <div className="text-right">
                <span className="text-xs text-gray-500 dark:text-gray-400">Estoque:</span>
                <br />
                <span className={`text-xs sm:text-sm font-medium ${produto.quantidade_estoque > 0 ? 'text-primary' : 'text-red-600 dark:text-red-400'}`}>
                  {produto.quantidade_estoque} un.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Botão de Ação */}
        <div className="mt-3 sm:mt-4">
          <Button
            onClick={handleShare}
            className="w-full bg-gradient-to-r from-primary to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-sm h-8 sm:h-auto text-xs sm:text-sm"
            size="sm"
          >
            <Share2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Ofertar ao Cliente</span>
            <span className="xs:hidden">Ofertar</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
