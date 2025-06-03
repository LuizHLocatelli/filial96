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
import { ProdutoFocoWithImages } from './types';
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
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

  const handleCreateProduto = async (dados: any) => {
    const success = await createProduto(dados);
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

  const closeForm = () => {
    setShowForm(false);
    setEditingProduto(null);
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
            Gerencie os produtos prioritários para vendas de moda
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
          <Card className="border-2 border-yellow-200 bg-yellow-50">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{produtoAtivo.nome_produto}</h3>
                  <p className="text-muted-foreground mb-4">Código: {produtoAtivo.codigo_produto}</p>
                  
                  <div className="flex flex-wrap gap-4 mb-4">
                    <Badge variant="secondary">{produtoAtivo.categoria}</Badge>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(produtoAtivo.periodo_inicio), 'dd/MM', { locale: ptBR })} - {' '}
                        {format(new Date(produtoAtivo.periodo_fim), 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                    </div>
              </div>
              
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">De:</p>
                      <p className="text-lg line-through text-muted-foreground">
                        R$ {produtoAtivo.preco_de.toFixed(2)}
                      </p>
                    </div>
              <div>
                      <p className="text-sm text-muted-foreground">Por:</p>
                      <p className="text-2xl font-bold text-green-600">
                        R$ {produtoAtivo.preco_por.toFixed(2)}
                      </p>
                    </div>
                  </div>
              </div>
              
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleEditProduto(produtoAtivo)}>
                    Editar
                </Button>
                  <Button variant="outline" onClick={() => setViewingProduto(produtoAtivo)}>
                    Ver Detalhes
                </Button>
              </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Resumo/Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      {produtos.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Todos os Produtos Foco</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {produtos
              .filter(p => !produtoAtivo || p.id !== produtoAtivo.id)
              .map((produto) => (
              <Card key={produto.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold truncate">{produto.nome_produto}</h4>
                        <p className="text-sm text-muted-foreground">Código: {produto.codigo_produto}</p>
                        <Badge variant="outline" className="mt-1">{produto.categoria}</Badge>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs text-muted-foreground">De: R$ {produto.preco_de.toFixed(2)}</p>
                          <p className="font-bold text-green-600">Por: R$ {produto.preco_por.toFixed(2)}</p>
                        </div>
                        {!produto.ativo && (
                          <Badge variant="secondary">Inativo</Badge>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditProduto(produto)}>
                          Editar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setViewingProduto(produto)}>
                          Ver
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => setDeletingProduto(produto.id)}
                        >
                          Remover
                        </Button>
                      </div>
                  </div>
                </CardContent>
              </Card>
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

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={!!deletingProduto} onOpenChange={() => setDeletingProduto(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar remoção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este produto do foco? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduto}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de visualização de detalhes */}
      <Dialog open={!!viewingProduto} onOpenChange={() => setViewingProduto(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{viewingProduto?.nome_produto}</DialogTitle>
            <DialogDescription>
              Detalhes do produto foco
            </DialogDescription>
          </DialogHeader>
          {viewingProduto && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold">Código:</p>
                  <p>{viewingProduto.codigo_produto}</p>
                </div>
                <div>
                  <p className="font-semibold">Categoria:</p>
                  <p>{viewingProduto.categoria}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold">Preço Original:</p>
                  <p>R$ {viewingProduto.preco_de.toFixed(2)}</p>
                </div>
                <div>
                  <p className="font-semibold">Preço Promocional:</p>
                  <p className="text-green-600 font-bold">R$ {viewingProduto.preco_por.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <p className="font-semibold">Período:</p>
                <p>
                  {format(new Date(viewingProduto.periodo_inicio), 'dd/MM/yyyy', { locale: ptBR })} - {' '}
                  {format(new Date(viewingProduto.periodo_fim), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              </div>

              {viewingProduto.meta_vendas && (
                <div>
                  <p className="font-semibold">Meta de Vendas:</p>
                  <p>{viewingProduto.meta_vendas} unidades</p>
                </div>
              )}

              {viewingProduto.motivo_foco && (
                <div>
                  <p className="font-semibold">Motivo do Foco:</p>
                  <p>{viewingProduto.motivo_foco}</p>
                </div>
              )}

              {viewingProduto.informacoes_adicionais && (
                <div>
                  <p className="font-semibold">Informações Adicionais:</p>
                  <p>{viewingProduto.informacoes_adicionais}</p>
                </div>
        )}
      </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 