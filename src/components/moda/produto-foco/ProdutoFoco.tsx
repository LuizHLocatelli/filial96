import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useModaTracking } from '@/hooks/useModaTracking';
import { useProdutoFoco } from './hooks/useProdutoFoco';
import { 
  Plus, 
  Star, 
  Target, 
  TrendingUp, 
  Edit,
  Trash2,
  Eye,
  ShoppingCart,
  Package
} from 'lucide-react';
import { ProdutoFocoCard } from './components/ProdutoFocoCard';
import { ProdutoFocoForm } from './components/ProdutoFocoForm';
import { ProdutoFocoDetails } from './components/ProdutoFocoDetails';
import { RegistrarVendaDialog } from './components/RegistrarVendaDialog';
import { ConfirmDeleteDialog } from './components/ConfirmDeleteDialog';
import { ProdutoFocoWithImages } from '@/types/produto-foco';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMobileDialog } from '@/hooks/useMobileDialog';

export function ProdutoFoco() {
  const { trackProdutoFocoEvent } = useModaTracking();
  const {
    produtos,
    produtoAtivo,
    isLoading,
    createProduto,
    updateProduto,
    deleteProduto,
    uploadImagem,
    deleteImagem,
    refetch
  } = useProdutoFoco();
  
  const [showForm, setShowForm] = useState(false);
  const [editingProduto, setEditingProduto] = useState<ProdutoFocoWithImages | null>(null);
  const [deletingProduto, setDeletingProduto] = useState<string | null>(null);
  const [viewingProduto, setViewingProduto] = useState<ProdutoFocoWithImages | null>(null);
  const [vendaProduto, setVendaProduto] = useState<ProdutoFocoWithImages | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const { getMobileDialogProps } = useMobileDialog();

  useEffect(() => {
    // Registrar acesso à seção de produto foco
    trackProdutoFocoEvent('acesso_produto_foco');
  }, [trackProdutoFocoEvent]);

  useEffect(() => {
    if (produtos.length > 0) {
      // Rastrear dados carregados
      trackProdutoFocoEvent('dados_carregados', {
        total_produtos: produtos.length,
        produtos_ativos: produtos.filter(p => p.ativo).length
      });
    }
  }, [produtos, trackProdutoFocoEvent]);

  const handleCreateProduto = () => {
    trackProdutoFocoEvent('criar_produto_iniciado');
    setEditingProduto(null);
    setShowForm(true);
  };

  const handleEditProduto = (produto: ProdutoFocoWithImages) => {
    trackProdutoFocoEvent('editar_produto_iniciado', produto);
    setEditingProduto(produto);
    setShowForm(true);
  };

  const handleDeleteProduto = (produtoId: string) => {
    const produto = produtos.find(p => p.id === produtoId);
    trackProdutoFocoEvent('deletar_produto_iniciado', produto);
    setDeletingProduto(produtoId);
  };

  const confirmDeleteProduto = async () => {
    if (!deletingProduto) return;

    const produto = produtos.find(p => p.id === deletingProduto);
    await deleteProduto(deletingProduto);
    setDeletingProduto(null);
    trackProdutoFocoEvent('produto_deletado', produto);
  };

  const handleViewDetails = (produto: ProdutoFocoWithImages) => {
    trackProdutoFocoEvent('produto_visualizado', produto);
    setViewingProduto(produto);
  };

  const handleRegistrarVenda = (produto: ProdutoFocoWithImages) => {
    trackProdutoFocoEvent('registrar_venda_iniciado', produto);
    setVendaProduto(produto);
  };

  const handleVendaRegistrada = () => {
    trackProdutoFocoEvent('venda_registrada', vendaProduto);
    setVendaProduto(null);
    refetch(); // Recarregar para atualizar estatísticas
  };

  const handleFormSubmit = async (formData: any, imagens?: File[]) => {
    try {
      const isEditingMode = !!editingProduto;
      
      if (isEditingMode) {
        await updateProduto(editingProduto.id, formData);
        trackProdutoFocoEvent('produto_atualizado', { ...formData, id: editingProduto.id });
      } else {
        await createProduto(formData, imagens);
        trackProdutoFocoEvent('produto_criado', formData);
      }
      
      setShowForm(false);
      setEditingProduto(null);
    } catch (error) {
      trackProdutoFocoEvent('erro_formulario', { erro: error, modo: editingProduto ? 'edicao' : 'criacao' });
    }
  };

  const handleUploadImagem = async (file: File) => {
    if (editingProduto) {
      await uploadImagem(editingProduto.id, file);
    }
  };

  const handleDeleteImagem = async (imagemId: string, imagemUrl: string) => {
    await deleteImagem(imagemId, imagemUrl);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto animate-fade-in space-y-4 sm:space-y-6 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Produto Foco</h1>
          <p className="text-muted-foreground">
            Gerencie os produtos prioritários para vendas de moda
          </p>
        </div>
        <Button onClick={handleCreateProduto}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Produto Foco
        </Button>
      </div>

      {/* Produto Ativo em Destaque */}
      {produtoAtivo && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <h2 className="text-xl font-semibold">Produto Foco Atual</h2>
          </div>
          <ProdutoFocoCard
            produto={produtoAtivo}
            isActive={true}
            onEdit={handleEditProduto}
            onDelete={handleDeleteProduto}
            onViewDetails={handleViewDetails}
            onRegistrarVenda={handleRegistrarVenda}
          />
        </div>
      )}

      {/* Resumo/Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{produtos.length}</p>
                <p className="text-xs text-muted-foreground">Total de Produtos</p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {produtos.filter(p => p.ativo).length}
                </p>
                <p className="text-xs text-muted-foreground">Produtos Ativos</p>
              </div>
              <Star className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {produtos.reduce((acc, p) => acc + (p.meta_vendas || 0), 0)}
                </p>
                <p className="text-xs text-muted-foreground">Meta Total (unidades)</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Todos os Produtos */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Todos os Produtos</h2>
        {produtos.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum produto foco cadastrado</h3>
              <p className="text-muted-foreground text-center mb-4">
                Crie seu primeiro produto foco para começar a gerenciar prioridades de vendas
              </p>
              <Button onClick={handleCreateProduto}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Produto
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {produtos.map((produto) => (
              <ProdutoFocoCard
                key={produto.id}
                produto={produto}
                onEdit={handleEditProduto}
                onDelete={handleDeleteProduto}
                onViewDetails={handleViewDetails}
                onRegistrarVenda={handleRegistrarVenda}
              />
            ))}
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent {...getMobileDialogProps("default")}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center">
                <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div>{editingProduto ? 'Editar Produto Foco' : 'Novo Produto Foco'}</div>
                <div className="text-sm font-normal text-muted-foreground">
                  {editingProduto ? 'Atualize as informações' : 'Gerenciar prioridades de venda'}
                </div>
              </div>
            </DialogTitle>
            <DialogDescription>
              {editingProduto 
                ? 'Atualize as informações do produto foco'
                : 'Adicione um novo produto às prioridades de vendas'
              }
            </DialogDescription>
          </DialogHeader>
          <ProdutoFocoForm
            produto={editingProduto}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingProduto(null);
            }}
            onUploadImagem={handleUploadImagem}
            onDeleteImagem={handleDeleteImagem}
          />
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <ProdutoFocoDetails
        produto={viewingProduto}
        isOpen={!!viewingProduto}
        onClose={() => setViewingProduto(null)}
      />

      {/* Registrar Venda Dialog */}
      {vendaProduto && (
        <RegistrarVendaDialog
          open={!!vendaProduto}
          onOpenChange={(open) => {
            if (!open) setVendaProduto(null);
          }}
          produtoNome={vendaProduto.nome_produto}
          onSubmit={async (vendaData) => {
            // Aqui você pode implementar a lógica de salvar a venda
            console.log('Venda registrada:', vendaData);
            handleVendaRegistrada();
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={!!deletingProduto}
        onOpenChange={(open) => {
          if (!open) setDeletingProduto(null);
        }}
        onConfirm={confirmDeleteProduto}
        productName={produtos.find(p => p.id === deletingProduto)?.nome_produto || ''}
      />
    </div>
  );
}
