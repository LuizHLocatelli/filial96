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
  AlertCircle,
  Package,
  Trash2
} from 'lucide-react';
import { useProdutoFoco } from './hooks/useProdutoFoco';
import { ProdutoFocoCard } from './components/ProdutoFocoCard';
import { ProdutoFocoForm } from './components/ProdutoFocoForm';
import { ProdutoFocoDetails } from './components/ProdutoFocoDetails';
import { ProdutoFocoWithImages, type ProdutoFoco } from '@/types/produto-foco';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { StandardDialogHeader, StandardDialogFooter } from '@/components/ui/standard-dialog';
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
  const isMobile = useIsMobile();

  const handleCreateProduto = async (dados: Omit<ProdutoFoco, 'id' | 'created_at' | 'updated_at' | 'created_by'>, imagens?: File[]) => {
    const success = await createProduto(dados, imagens);
    if (success) {
      setShowForm(false);
    }
  };

  const handleUpdateProduto = async (dados: Partial<ProdutoFoco>) => {
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

  const handleRegistrarVenda = async (dadosVenda: { cliente_nome: string; cliente_telefone: string; valor_venda: number; forma_pagamento: string; observacoes: string }) => {
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
    <div className="w-full mx-auto animate-fade-in space-y-4 sm:space-y-6 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5 max-w-7xl">
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
        <DialogContent 
          className={`${isMobile ? 'w-[calc(100%-2rem)] max-w-full p-0' : 'sm:max-w-2xl p-0'} max-h-[85vh] overflow-y-auto flex flex-col`}
          hideCloseButton
        >
          <StandardDialogHeader
            icon={Package}
            iconColor="primary"
            title={editingProduto ? 'Editar Produto Foco' : 'Adicionar Produto Foco'}
            description={editingProduto
              ? 'Edite as informações do produto foco selecionado.'
              : 'Adicione um novo produto foco para orientar as vendas.'
            }
            onClose={closeForm}
          />
          
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <ProdutoFocoForm
              produto={editingProduto || undefined}
              onSubmit={editingProduto ? handleUpdateProduto : handleCreateProduto}
              onCancel={closeForm}
              onUploadImagem={editingProduto ? handleUploadImagem : undefined}
              onDeleteImagem={editingProduto ? handleDeleteImagem : undefined}
            />
          </div>
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

      {/* AlertDialog de Exclusão */}
      <Dialog open={!!deletingProduto} onOpenChange={() => setDeletingProduto(null)}>
        <DialogContent 
          className="max-w-[400px] p-0 max-h-[85vh] overflow-y-auto flex flex-col"
          hideCloseButton
        >
          <div className="bg-gradient-to-br from-red-500/5 via-red-500/10 to-red-500/5 p-4 border-b border-border/10">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-red-100">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold leading-none tracking-tight">
                    Excluir Produto Foco
                  </h2>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tem certeza que deseja excluir este produto foco? Esta ação não pode ser desfeita.
              Todas as imagens associadas também serão removidas.
            </p>
          </div>
          
          <div className="p-4 border-t border-border/10">
            <StandardDialogFooter className={isMobile ? 'flex-col gap-2' : 'flex-row gap-2'}>
              <Button variant="outline" onClick={() => setDeletingProduto(null)} className={isMobile ? 'w-full' : 'flex-1'}>
                Cancelar
              </Button>
              <Button onClick={handleDeleteProduto} className={`${isMobile ? 'w-full' : 'flex-1'} bg-destructive text-destructive-foreground hover:bg-destructive/90`}>
                Excluir
              </Button>
            </StandardDialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
