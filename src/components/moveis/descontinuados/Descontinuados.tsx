
import { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, Heart } from 'lucide-react';
import { useDescontinuados } from './hooks/useDescontinuados';
import { ProdutoCard } from './components/ProdutoCard';
import { FiltrosDescontinuados } from './components/FiltrosDescontinuados';
import { AddProdutoDialog } from './components/AddProdutoDialog';

interface DescontinuadosProps {
  onBack: () => void;
}

export function Descontinuados({ onBack }: DescontinuadosProps) {
  const { 
    produtos, 
    isLoading, 
    filters, 
    setFilters, 
    createProduto, 
    toggleFavorito, 
    deleteProduto 
  } = useDescontinuados();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [produtoToDelete, setProdutoToDelete] = useState<string | null>(null);
  const [showFavoritos, setShowFavoritos] = useState(false);

  const handleDeleteConfirm = () => {
    if (produtoToDelete) {
      deleteProduto(produtoToDelete);
      setDeleteDialogOpen(false);
      setProdutoToDelete(null);
    }
  };

  const handleDelete = (produtoId: string) => {
    setProdutoToDelete(produtoId);
    setDeleteDialogOpen(true);
  };

  const produtosFiltrados = showFavoritos 
    ? produtos.filter(p => p.favorito)
    : produtos;

  const produtosFavoritos = produtos.filter(p => p.favorito);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-red-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                  Produtos Descontinuados
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Oportunidades especiais para nossos clientes
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {produtosFavoritos.length > 0 && (
              <Button
                variant={showFavoritos ? "default" : "outline"}
                onClick={() => setShowFavoritos(!showFavoritos)}
                className="flex items-center gap-2"
              >
                <Heart className={`h-4 w-4 ${showFavoritos ? 'fill-current' : ''}`} />
                Favoritos ({produtosFavoritos.length})
              </Button>
            )}
            <AddProdutoDialog onAdd={createProduto} />
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6">
          <FiltrosDescontinuados filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/70 dark:bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-600/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total de Produtos</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{produtos.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-600/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Favoritos</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{produtosFavoritos.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-600/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">R$</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Valor Médio</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {produtos.length > 0 
                    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                        .format(produtos.reduce((acc, p) => acc + p.preco, 0) / produtos.length)
                    : 'R$ 0,00'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de Produtos */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-96"></div>
              </div>
            ))}
          </div>
        ) : produtosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              {showFavoritos ? 'Nenhum produto favoritado' : 'Nenhum produto encontrado'}
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              {showFavoritos 
                ? 'Favorite alguns produtos para vê-los aqui'
                : 'Tente ajustar os filtros ou adicione novos produtos'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {produtosFiltrados.map((produto) => (
              <ProdutoCard
                key={produto.id}
                produto={produto}
                onToggleFavorito={toggleFavorito}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este produto descontinuado? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
