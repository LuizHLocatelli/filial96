
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Filter, BarChart3, Download } from 'lucide-react';
import { useRotinas } from './hooks/useRotinas';
import { RotinasList } from './components/RotinasList';
import { RotinasStats } from './components/RotinasStats';
import { AddRotinaDialog } from './components/AddRotinaDialog';
import { RotinaFilters } from './components/RotinaFilters';
import { PeriodicidadeFilter, StatusFilter } from './types';

export function Rotinas() {
  const { rotinas, isLoading, addRotina, updateRotina, deleteRotina, toggleConclusao, duplicateRotina } = useRotinas();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [periodicidadeFilter, setPeriodicidadeFilter] = useState<PeriodicidadeFilter>('todos');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos');
  const [categoriaFilter, setCategoriaFilter] = useState<string>('todos');

  const categorias = [...new Set(rotinas.map(r => r.categoria))];

  const filteredRotinas = rotinas.filter(rotina => {
    // Filtro por periodicidade
    if (periodicidadeFilter === 'hoje' && rotina.periodicidade !== 'diario') return false;
    if (periodicidadeFilter === 'semana' && rotina.periodicidade !== 'semanal') return false;
    if (periodicidadeFilter === 'mes' && rotina.periodicidade !== 'mensal') return false;

    // Filtro por status
    if (statusFilter !== 'todos' && rotina.status !== statusFilter) return false;

    // Filtro por categoria
    if (categoriaFilter !== 'todos' && rotina.categoria !== categoriaFilter) return false;

    return true;
  });

  const handleExportPDF = () => {
    // Esta funcionalidade seria implementada com uma biblioteca como jsPDF
    console.log('Exportar rotinas para PDF');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Rotinas</h1>
          <p className="text-muted-foreground">
            Gerencie suas rotinas obrigatórias e acompanhe o progresso
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
          
          <Button
            onClick={() => setShowAddDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nova Rotina
          </Button>
        </div>
      </div>

      {showFilters && (
        <RotinaFilters
          periodicidadeFilter={periodicidadeFilter}
          statusFilter={statusFilter}
          categoriaFilter={categoriaFilter}
          categorias={categorias}
          onPeriodicidadeChange={setPeriodicidadeFilter}
          onStatusChange={setStatusFilter}
          onCategoriaChange={setCategoriaFilter}
        />
      )}

      <Tabs defaultValue="checklist" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="checklist" className="flex items-center gap-2">
            <div className="h-4 w-4 border border-current rounded-sm" />
            Checklist
          </TabsTrigger>
          <TabsTrigger value="estatisticas" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Estatísticas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="checklist" className="mt-6">
          <RotinasList
            rotinas={filteredRotinas}
            isLoading={isLoading}
            onToggleConclusao={toggleConclusao}
            onEditRotina={updateRotina}
            onDeleteRotina={deleteRotina}
            onDuplicateRotina={duplicateRotina}
          />
        </TabsContent>

        <TabsContent value="estatisticas" className="mt-6">
          <RotinasStats rotinas={rotinas} />
        </TabsContent>
      </Tabs>

      <AddRotinaDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={addRotina}
      />
    </div>
  );
}
