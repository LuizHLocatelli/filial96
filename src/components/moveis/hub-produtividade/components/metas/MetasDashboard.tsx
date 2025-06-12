
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MetaCard } from "./MetaCard";
import { MetaFocoCard } from "./MetaFocoCard";
import { MetaDialog } from "./MetaDialog";
import { MetaFocoDialog } from "./MetaFocoDialog";
import { useMetasDashboard } from "../../hooks/useMetasDashboard";
import { useMetasOperations } from "../../hooks/useMetasOperations";
import { MetaCategoria } from "../../types/metasTypes";
import { Target, Plus, Calendar, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MetasDashboardProps {
  mesReferencia?: Date;
}

export function MetasDashboard({ mesReferencia }: MetasDashboardProps) {
  const { profile } = useAuth();
  const isManager = profile?.role === 'gerente';
  
  const { data, isLoading, refetch } = useMetasDashboard(mesReferencia);
  const { createOrUpdateMetaMensal, createMetaFoco, deleteMetaFoco, isLoading: isOperationLoading } = useMetasOperations();
  
  const [selectedCategoria, setSelectedCategoria] = useState<MetaCategoria | null>(null);
  const [showMetaDialog, setShowMetaDialog] = useState(false);
  const [showMetaFocoDialog, setShowMetaFocoDialog] = useState(false);

  const handleEditMeta = (categoria: MetaCategoria) => {
    setSelectedCategoria(categoria);
    setShowMetaDialog(true);
  };

  const handleMetaSubmit = async (formData: any, metaId?: string) => {
    const currentMonth = mesReferencia || new Date();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const mesAno = firstDayOfMonth.toISOString().split('T')[0];

    const success = await createOrUpdateMetaMensal(formData, mesAno, metaId);
    if (success) {
      refetch();
    }
    return success;
  };

  const handleMetaFocoSubmit = async (formData: any) => {
    const success = await createMetaFoco(formData);
    if (success) {
      refetch();
    }
    return success;
  };

  const handleRemoveMetaFoco = async (metaFocoId: string) => {
    const success = await deleteMetaFoco(metaFocoId);
    if (success) {
      refetch();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhum dado encontrado</h3>
        <p className="text-muted-foreground">Não foi possível carregar os dados das metas.</p>
      </div>
    );
  }

  const currentMonth = mesReferencia || new Date();
  const mesFormatado = format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Metas de {mesFormatado}</h2>
          <p className="text-muted-foreground">
            Acompanhe e gerencie as metas da filial
          </p>
        </div>
        {isManager && (
          <Button onClick={() => setShowMetaFocoDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Meta Foco
          </Button>
        )}
      </div>

      {/* Meta Foco Ativa */}
      {data.meta_foco_ativa && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Meta Foco de Hoje</h3>
          </div>
          <MetaFocoCard
            metaFoco={data.meta_foco_ativa}
            isManager={isManager}
            onRemove={handleRemoveMetaFoco}
          />
        </div>
      )}

      {/* Cards das Categorias */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Metas por Categoria</h3>
          <Badge variant="secondary">
            {data.categorias.length} categorias
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.categorias.map((categoria) => (
            <MetaCard
              key={categoria.id}
              categoria={categoria}
              isManager={isManager}
              onEdit={handleEditMeta}
            />
          ))}
        </div>
      </div>

      {/* Dialogs */}
      <MetaDialog
        open={showMetaDialog}
        onOpenChange={setShowMetaDialog}
        categoria={selectedCategoria}
        onSubmit={handleMetaSubmit}
        isLoading={isOperationLoading}
      />

      <MetaFocoDialog
        open={showMetaFocoDialog}
        onOpenChange={setShowMetaFocoDialog}
        categorias={data.categorias}
        onSubmit={handleMetaFocoSubmit}
        isLoading={isOperationLoading}
      />
    </div>
  );
}
