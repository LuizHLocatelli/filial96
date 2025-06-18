import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Star, 
  Calendar,
  Target,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useProdutoFoco } from './hooks/useProdutoFoco';
import { ProdutoFocoCard } from './components/ProdutoFocoCard';
import { ProdutoFocoForm } from './components/ProdutoFocoForm';
import { ProdutoFocoDetails } from './components/ProdutoFocoDetails';
import { ProdutoFocoWithImages } from '@/types/produto-foco';
import { 
  Dialog, 
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RegistroVendaDialog } from './components/RegistroVendaDialog';

export function ProdutoFoco() {
  const {
    produtos,
    produtoAtivo,
    isLoading,
    createProduto,
    updateProduto,
    deleteProduto,
    uploadImagem,
    deleteImagem,
    registrarVenda
  } = useProdutoFoco();

  const [showForm, setShowForm] = useState(false);
  const [editingProduto, setEditingProduto] = useState<ProdutoFocoWithImages | null>(null);
  const [viewingProduto, setViewingProduto] = useState<ProdutoFocoWithImages | null>(null);
  const [deletingProduto, setDeletingProduto] = useState<string | null>(null);
  const [vendaProduto, setVendaProduto] = useState<ProdutoFocoWithImages | null>(null);

  const handleCreateProduto = async (dados: any, imagens?: File[]) => {
    const success = await createProduto(dados, imagens);
    if (success) {
      setShowForm(false);
    }
  };

  const handleUpdateProduto = async (dados: any) => {
    if (editingProduto) {
      await updateProduto(editingProduto.id, dados);
      setEditingProduto(null);
      setShowForm(false);
    }
  };

  const handleEditProduto = (produto: ProdutoFocoWithImages) => {
    setEditingProduto(produto);
    setShowForm(true);
  };

  const handleDeleteProduto = async () => {
    if (deletingProduto) {
      await deleteProduto(deletingProduto);
      setDeletingProduto(null);
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

  const closeForm = () => {
    setShowForm(false);
    setEditingProduto(null);
  };

  const handleRegistrarVenda = async (dadosVenda: any) => {
    await registrarVenda(dadosVenda);
    setVendaProduto(null);
  };

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
            Gerencie os produtos prioritários para vendas
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
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
            onDelete={setDeletingProduto}
            onViewDetails={setViewingProduto}
            onRegistrarVenda={setVendaProduto}
          />
        </div>
      )}

      {/* Resumo/Estatísticas */}
                <div className="grid-responsive-cards">
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
      {produtos.length > (produtoAtivo ? 1 : 0) && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Todos os Produtos Foco</h2>
          <div className="grid-responsive-cards">
            {produtos
              .filter(p => !produtoAtivo || p.id !== produtoAtivo.id)
              .map((produto) => (
                <ProdutoFocoCard
                  key={produto.id}
                  produto={produto}
                  onEdit={handleEditProduto}
                  onDelete={setDeletingProduto}
                  onViewDetails={setViewingProduto}
                />
              ))}
          </div>
        </div>
      )}

      {/* Estado Vazio */}
      {produtos.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum produto foco encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Comece criando seu primeiro produto foco para orientar as vendas.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Produto Foco
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <Dialog open={showForm} onOpenChange={closeForm}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduto ? 'Editar Produto Foco' : 'Adicionar Produto Foco'}
            </DialogTitle>
            <DialogDescription>
              {editingProduto 
                ? 'Edite as informações do produto foco selecionado.' 
                : 'Adicione um novo produto foco para orientar as vendas.'
              }
            </DialogDescription>
          </DialogHeader>
          <ProdutoFocoForm
            produto={editingProduto || undefined}
            onSubmit={editingProduto ? handleUpdateProduto : handleCreateProduto}
            onCancel={closeForm}
            onUploadImagem={editingProduto ? handleUploadImagem : undefined}
            onDeleteImagem={editingProduto ? handleDeleteImagem : undefined}
          />
        </DialogContent>
      </Dialog>

      <ProdutoFocoDetails
        produto={viewingProduto}
        isOpen={!!viewingProduto}
        onClose={() => setViewingProduto(null)}
      />

      {vendaProduto && (
        <RegistroVendaDialog
          isOpen={!!vendaProduto}
          onClose={() => setVendaProduto(null)}
          produto={vendaProduto}
          onRegistrarVenda={handleRegistrarVenda}
        />
      )}

      <AlertDialog open={!!deletingProduto} onOpenChange={() => setDeletingProduto(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Produto Foco</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este produto foco? Esta ação não pode ser desfeita.
              Todas as imagens associadas também serão removidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduto} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
