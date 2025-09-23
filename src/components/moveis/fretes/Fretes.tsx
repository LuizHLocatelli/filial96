import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Package, TrendingUp, Clock, CheckCircle } from "lucide-react";

import { FreteDialog } from "./FreteDialog";
import { FretesList } from "./FretesList";
import { FreteDetalhes } from "./FreteDetalhes";
import { useFretes } from "@/hooks/moveis/useFretes";
import { Frete } from "@/types/frete";

export function Fretes() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detalhesOpen, setDetalhesOpen] = useState(false);
  const [editingFrete, setEditingFrete] = useState<Frete | null>(null);
  const [selectedFrete, setSelectedFrete] = useState<Frete | null>(null);

  const {
    fretes,
    loading,
    error,
    createFrete,
    updateFrete,
    deleteFrete,
    refreshFretes
  } = useFretes();

  const handleCreateFrete = () => {
    setEditingFrete(null);
    setDialogOpen(true);
  };

  const handleEditFrete = (frete: Frete) => {
    setEditingFrete(frete);
    setDialogOpen(true);
  };

  const handleViewFrete = (frete: Frete) => {
    setSelectedFrete(frete);
    setDetalhesOpen(true);
  };

  const handleDeleteFrete = async (id: string) => {
    await deleteFrete(id);
  };

  // Calcular estatísticas
  const stats = {
    total: fretes.length,
    pendentes: fretes.filter(f => f.status === 'Pendente de Entrega').length,
    emTransporte: fretes.filter(f => f.status === 'Em Transporte').length,
    entregues: fretes.filter(f => f.status === 'Entregue').length,
    valorTotal: fretes.reduce((acc, f) => acc + f.valor_frete, 0),
    valorPendente: fretes
      .filter(f => !f.pago)
      .reduce((acc, f) => acc + f.valor_frete, 0),
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="text-destructive mb-2">Erro ao carregar fretes</div>
            <Button onClick={refreshFretes} variant="outline">
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fretes</h1>
          <p className="text-muted-foreground">
            Gerencie os fretes e entregas dos móveis
          </p>
        </div>
        <Button onClick={handleCreateFrete}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Frete
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Fretes</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              fretes cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendentes}</div>
            <p className="text-xs text-muted-foreground">
              aguardando entrega
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entregues</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.entregues}</div>
            <p className="text-xs text-muted-foreground">
              entregas concluídas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.valorTotal)}</div>
            <p className="text-xs text-muted-foreground">
              em fretes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Valores Pendentes */}
      {stats.valorPendente > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-800">Valores Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">
              {formatCurrency(stats.valorPendente)}
            </div>
            <p className="text-sm text-amber-700">
              em fretes não pagos
            </p>
          </CardContent>
        </Card>
      )}

      {/* Lista de Fretes */}
      <FretesList
        fretes={fretes}
        loading={loading}
        onEdit={handleEditFrete}
        onDelete={handleDeleteFrete}
        onView={handleViewFrete}
      />

      {/* Dialog de Criação/Edição */}
      <FreteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onFreteCreated={createFrete}
        editingFrete={editingFrete}
        onFreteUpdated={updateFrete}
      />

      {/* Dialog de Detalhes */}
      <FreteDetalhes
        open={detalhesOpen}
        onOpenChange={setDetalhesOpen}
        frete={selectedFrete}
        onEdit={handleEditFrete}
      />
    </div>
  );
}