import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useModaTracking } from '@/hooks/useModaTracking';
import { 
  Plus, 
  Star, 
  Target, 
  TrendingUp, 
  Edit,
  Trash2,
  Eye,
  ShoppingCart
} from 'lucide-react';
import { ProdutoFocoCard } from './components/ProdutoFocoCard';
import { ProdutoFocoForm } from './components/ProdutoFocoForm';
import { ProdutoFocoDetails } from './components/ProdutoFocoDetails';
import { RegistrarVendaDialog } from './components/RegistrarVendaDialog';
import { ConfirmDeleteDialog } from './components/ConfirmDeleteDialog';
import { ProdutoFocoWithImages } from './types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function ProdutoFoco() {
  const { trackProdutoFocoEvent } = useModaTracking();
  const [produtos, setProdutos] = useState<ProdutoFocoWithImages[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduto, setEditingProduto] = useState<ProdutoFocoWithImages | null>(null);
  const [deletingProduto, setDeletingProduto] = useState<string | null>(null);
  const [viewingProduto, setViewingProduto] = useState<ProdutoFocoWithImages | null>(null);
  const [vendaProduto, setVendaProduto] = useState<ProdutoFocoWithImages | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Registrar acesso à seção de produto foco
    trackProdutoFocoEvent('acesso_produto_foco');
    fetchProdutos();
  }, [trackProdutoFocoEvent]);

  const fetchProdutos = async () => {
    try {
      setIsLoading(true);
      const { data: produtosData, error } = await supabase
        .from('moda_produto_foco')
        .select(`
          *,
          imagens:moda_produto_foco_imagens(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const produtosComImagens = produtosData?.map(produto => ({
        ...produto,
        imagens: produto.imagens || []
      })) || [];
      
      setProdutos(produtosComImagens);
      
      // Rastrear dados carregados
      trackProdutoFocoEvent('dados_carregados', {
        total_produtos: produtosComImagens.length,
        produtos_ativos: produtosComImagens.filter(p => p.ativo).length
      });
    } catch (error) {
      console.error('Erro ao buscar produtos foco:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os produtos foco",
        variant: "destructive"
      });
      trackProdutoFocoEvent('erro_carregamento', { erro: error });
    } finally {
      setIsLoading(false);
    }
  };

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

    try {
      const produto = produtos.find(p => p.id === deletingProduto);
      
      const { error } = await supabase
        .from('moda_produto_foco')
        .delete()
        .eq('id', deletingProduto);

      if (error) throw error;

      setProdutos(produtos.filter(p => p.id !== deletingProduto));
      setDeletingProduto(null);
      
      trackProdutoFocoEvent('produto_deletado', produto);
      toast({
        title: "Sucesso",
        description: "Produto foco excluído com sucesso"
      });
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      trackProdutoFocoEvent('erro_deletar_produto', { erro: error });
      toast({
        title: "Erro",
        description: "Não foi possível excluir o produto foco",
        variant: "destructive"
      });
    }
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
    fetchProdutos(); // Recarregar para atualizar estatísticas
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      const isEditing = !!editingProduto;
      
      if (isEditing) {
        trackProdutoFocoEvent('produto_atualizado', { ...formData, id: editingProduto.id });
      } else {
        trackProdutoFocoEvent('produto_criado', formData);
      }
      
      setShowForm(false);
      setEditingProduto(null);
      await fetchProdutos();
    } catch (error) {
      trackProdutoFocoEvent('erro_formulario', { erro: error, modo: isEditing ? 'edicao' : 'criacao' });
    }
  };

  // Calcular produto ativo (mais prioritário e dentro do período)
  const produtoAtivo = produtos.find(produto => {
    const hoje = new Date();
    const inicio = new Date(produto.periodo_inicio);
    const fim = new Date(produto.periodo_fim);
    return produto.ativo && hoje >= inicio && hoje <= fim;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduto ? 'Editar Produto Foco' : 'Novo Produto Foco'}
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
      <RegistrarVendaDialog
        produto={vendaProduto}
        isOpen={!!vendaProduto}
        onClose={() => setVendaProduto(null)}
        onSuccess={handleVendaRegistrada}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        isOpen={!!deletingProduto}
        onClose={() => setDeletingProduto(null)}
        onConfirm={confirmDeleteProduto}
        itemName={produtos.find(p => p.id === deletingProduto)?.nome_produto || ''}
      />
    </div>
  );
} 