import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Filter, BarChart3, Download } from 'lucide-react';
import { useRotinas } from './hooks/useRotinas';
import { usePDFExport } from './hooks/usePDFExport';
import { RotinasList } from './components/RotinasList';
import { RotinasStats } from './components/RotinasStats';
import { AddRotinaDialog } from './components/AddRotinaDialog';
import { RotinaFilters } from './components/RotinaFilters';
import { PDFExportDialog, PDFExportOptions } from './components/PDFExportDialog';
import { PeriodicidadeFilter, StatusFilter } from './types';

export function Rotinas() {
  const { rotinas, isLoading, addRotina, updateRotina, deleteRotina, toggleConclusao, duplicateRotina } = useRotinas();
  const { exportToPDF } = usePDFExport();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
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

  const handleExportPDF = async (options: PDFExportOptions) => {
    setIsExporting(true);
    try {
      // Usar rotinas filtradas ou todas, dependendo da opção
      const rotinasParaExportar = options.showOnlyFiltered ? filteredRotinas : rotinas;
      
      await exportToPDF(rotinasParaExportar, options);
      setShowExportDialog(false);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const openExportDialog = () => {
    setShowExportDialog(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-1 sm:px-0">
      {/* Header responsivo */}
      <div className="flex flex-col gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold">Rotinas</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gerencie suas rotinas obrigatórias e acompanhe o progresso
          </p>
        </div>
        
        {/* Botões de ação - empilhados em mobile */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="flex flex-row gap-2 sm:gap-3 flex-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 flex-1 sm:flex-none"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden xs:inline">Filtros</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={openExportDialog}
              className="flex items-center gap-2 flex-1 sm:flex-none"
              disabled={isLoading || rotinas.length === 0}
            >
              <Download className="h-4 w-4" />
              <span className="hidden xs:inline">Exportar PDF</span>
            </Button>
          </div>
          
          <Button
            onClick={() => setShowAddDialog(true)}
            className="flex items-center gap-2 w-full sm:w-auto"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            Nova Rotina
          </Button>
        </div>
      </div>

      {/* Filtros */}
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

      {/* Tabs responsivas */}
      <Tabs defaultValue="lista" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 h-auto p-1">
          <TabsTrigger value="lista" className="py-2 px-4 text-sm">
            Lista
          </TabsTrigger>
          <TabsTrigger value="stats" className="py-2 px-4 text-sm">
            Estatísticas
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="lista" className="space-y-4 mt-4">
          <RotinasList
            rotinas={filteredRotinas}
            isLoading={isLoading}
            onEditRotina={updateRotina}
            onDeleteRotina={deleteRotina}
            onToggleConclusao={toggleConclusao}
            onDuplicateRotina={duplicateRotina}
          />
        </TabsContent>
        
        <TabsContent value="stats" className="space-y-4 mt-4">
          <RotinasStats rotinas={filteredRotinas} />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <AddRotinaDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={addRotina}
      />

      <PDFExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        rotinas={filteredRotinas}
        onExport={handleExportPDF}
        isExporting={isExporting}
      />
    </div>
  );
}
