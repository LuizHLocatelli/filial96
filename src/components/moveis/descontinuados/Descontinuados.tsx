import { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Package, Heart, AlertTriangle } from 'lucide-react';
import { useDescontinuados } from './hooks/useDescontinuados';
import { ProdutoCard } from './components/ProdutoCard';
import { FiltrosDescontinuados } from './components/FiltrosDescontinuados';
import { AddProdutoDialog } from './components/AddProdutoDialog';
import { useMobileDialog } from '@/hooks/useMobileDialog';

export function Descontinuados() {
  // Force recompilation - button removed
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
  const { getMobileAlertDialogProps, getMobileButtonProps } = useMobileDialog();

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
    <div className="w-full mx-auto animate-fade-in space-y-4 sm:space-y-6 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5 max-w-7xl">
      {/* Header Mobile Otimizado */}
      <div className="header-responsive">
        <div className="inline-md min-w-0 flex-1">
          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-primary border-2 border-primary/20 rounded-full flex items-center justify-center shadow-soft flex-shrink-0">
            <Package className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-responsive-title text-foreground leading-tight">
              Produtos Descontinuados
            </h1>
            <p className="text-responsive-sm text-muted-foreground leading-tight">
              Oportunidades especiais 
            </p>
          </div>
        </div>

        <div className="button-group-responsive flex-shrink-0">
          {produtosFavoritos.length > 0 && (
            <Button
              variant={showFavoritos ? "default" : "outline"}
              onClick={() => setShowFavoritos(!showFavoritos)}
              className="button-responsive-sm border-2 transition-all duration-200 w-full sm:w-auto"
            >
              <Heart className={`h-3 w-3 sm:h-4 sm:w-4 ${showFavoritos ? 'fill-current' : ''}`} />
              <span className="hidden xs:inline ml-1">Favoritos</span>
              <span className="xs:hidden ml-1">♥</span>
              <span className="hidden sm:inline ml-1">({produtosFavoritos.length})</span>
            </Button>
          )}
          <AddProdutoDialog onAdd={createProduto} />
        </div>
      </div>

      {/* Filtros */}
      <div>
        <FiltrosDescontinuados filters={filters} onFiltersChange={setFilters} />
      </div>

      {/* Estatísticas Mobile Otimizada */}
      <div className="grid-responsive-cards">
        <div className="bg-background border-2 border-border rounded-xl p-3 sm:p-4 shadow-soft transition-all duration-200 hover:shadow-medium">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-6 h-6 sm:w-10 sm:h-10 bg-primary border-2 border-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Package className="h-3 w-3 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground leading-tight">Total</p>
              <p className="text-lg sm:text-2xl font-bold text-foreground leading-tight">{produtos.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-background border-2 border-border rounded-xl p-3 sm:p-4 shadow-soft transition-all duration-200 hover:shadow-medium">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-6 h-6 sm:w-10 sm:h-10 bg-red-600 border-2 border-red-200 dark:border-red-800 rounded-full flex items-center justify-center flex-shrink-0">
              <Heart className="h-3 w-3 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground leading-tight">Favoritos</p>
              <p className="text-lg sm:text-2xl font-bold text-foreground leading-tight">{produtosFavoritos.length}</p>
            </div>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-background border-2 border-border rounded-xl p-3 sm:p-4 shadow-soft transition-all duration-200 hover:shadow-medium">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-6 h-6 sm:w-10 sm:h-10 bg-primary border-2 border-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs sm:text-sm">R$</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground leading-tight">Valor Médio</p>
              <p className="text-sm sm:text-2xl font-bold text-foreground leading-tight">
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

      {/* Grid de Produtos Mobile Otimizado */}
      {isLoading ? (
        <div className="grid-responsive-files">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted rounded-xl h-80 sm:h-96 border-2 border-border"></div>
            </div>
          ))}
        </div>
      ) : produtosFiltrados.length === 0 ? (
        <div className="text-center py-8 sm:py-12 px-4">
          <Package className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground mb-3 sm:mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-muted-foreground mb-2">
            {showFavoritos ? 'Nenhum produto favoritado' : 'Nenhum produto encontrado'}
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
            {showFavoritos 
              ? 'Favorite alguns produtos para vê-los aqui'
              : 'Tente ajustar os filtros ou adicione novos produtos'
            }
          </p>
        </div>
      ) : (
        <div className="grid-responsive-files pb-24 sm:pb-8">
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

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent {...getMobileAlertDialogProps("medium")}>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Tem certeza que deseja excluir este produto?
              <br />
              <span className="text-red-600 font-medium text-xs">Esta ação não pode ser desfeita.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel {...getMobileButtonProps()} className="rounded-lg border-2">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              {...getMobileButtonProps()}
              className="bg-red-600 hover:bg-red-700 border-2 border-red-700 rounded-lg"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
