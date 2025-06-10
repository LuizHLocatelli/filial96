import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RotinasList } from "./components/RotinasList";
import { RotinasStats } from "./components/RotinasStats";
import { AddRotinaDialog } from "./components/AddRotinaDialog";
import { PDFExportDialog } from "./components/PDFExportDialog";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Plus, Calendar, FileDown, Filter } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";
import { OrientacaoTarefas } from "../orientacoes/OrientacaoTarefas";
import { useRotinas } from "./hooks/useRotinas";
import { usePDFExport } from "./hooks/usePDFExport";
import { PDFExportOptions } from "./components/PDFExportDialog";

export function Rotinas() {
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTab, setSelectedTab] = useState("rotinas");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showPDFDialog, setShowPDFDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Usar o hook de rotinas para obter dados e operações
  const {
    rotinas,
    isLoading,
    addRotina,
    updateRotina,
    deleteRotina,
    duplicateRotina,
    toggleConclusao,
    refetch,
    getCachedUserName
  } = useRotinas();

  // Hook para exportação PDF
  const { exportToPDF } = usePDFExport();

  // Verificar parâmetros de URL para abrir dialogs automaticamente
  useEffect(() => {
    const action = searchParams.get('action');
    
    if (action === 'new') {
      setShowAddDialog(true);
      // Limpar o parâmetro da URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('action');
      setSearchParams(newParams);
    }
  }, [searchParams, setSearchParams]);

  const handleTabChange = (value: string) => {
    setSelectedTab(value);
  };

  const handleExportPDF = async (options: PDFExportOptions) => {
    try {
      setIsExporting(true);
      await exportToPDF(rotinas, options);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCreateRotina = async (data: any) => {
    const success = await addRotina(data);
    if (success) {
      setShowAddDialog(false);
    }
    return success;
  };

  // Handlers para navegação entre rotinas e tarefas
  const handleCreateTarefa = (rotinaId: string) => {
    // Mudar para a aba de tarefas e passar o ID da rotina
    setSelectedTab("tarefas");
    // Aqui poderia abrir um dialog de criação de tarefa com a rotina pré-selecionada
    // Por enquanto, apenas muda para a aba de tarefas
  };

  const handleViewTarefa = (tarefaId: string) => {
    // Mudar para a aba de tarefas e focar na tarefa específica
    setSelectedTab("tarefas");
    // Aqui poderia implementar scroll ou highlight para a tarefa específica
  };

  // Estatísticas para exibir no header
  const stats = {
    total: rotinas.length,
    concluidas: rotinas.filter(r => r.status === 'concluida').length,
    pendentes: rotinas.filter(r => r.status === 'pendente').length,
    atrasadas: rotinas.filter(r => r.status === 'atrasada').length,
  };
  
  return (
    <div className="w-full max-w-full relative">
      <Tabs 
        value={selectedTab} 
        onValueChange={handleTabChange} 
        className="space-y-4 sm:space-y-6 w-full"
      >
        {/* Header otimizado com ações */}
        <div className="bg-card rounded-xl p-4 sm:p-6 shadow-sm border border-border/40">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Rotinas e Tarefas</h2>
              <p className="text-sm text-muted-foreground">
                Gerencie rotinas obrigatórias e tarefas relacionadas
              </p>
              {/* Stats rápidas no header */}
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs text-muted-foreground">{stats.concluidas} concluídas</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span className="text-xs text-muted-foreground">{stats.pendentes} pendentes</span>
                </div>
                {stats.atrasadas > 0 && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-xs text-muted-foreground">{stats.atrasadas} atrasadas</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Ações rápidas */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size={isMobile ? "sm" : "default"}
                onClick={() => setShowPDFDialog(true)}
                className={`${isMobile ? 'h-10' : 'h-12'} gap-2`}
              >
                <FileDown className="h-4 w-4" />
                {!isMobile && "Exportar"}
              </Button>
              
              <Button
                onClick={() => setShowAddDialog(true)}
                size={isMobile ? "sm" : "default"}
                className={`${isMobile ? 'h-10' : 'h-12'} gap-2 bg-green-600 hover:bg-green-700 text-white`}
              >
                <Plus className="h-4 w-4" />
                {isMobile ? "Nova" : "Nova Rotina"}
              </Button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="mt-6">
            <TabsList className="grid grid-cols-2 w-full bg-muted/50 p-1 rounded-lg h-12">
              <TabsTrigger 
                value="rotinas" 
                className="flex items-center gap-2 transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600/90 data-[state=active]:to-green-600 data-[state=active]:text-white h-10"
              >
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className="flex items-center gap-2"
                >
                  <CheckSquare className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Rotinas</span>
                  {stats.total > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs bg-white/20 text-current border-0">
                      {stats.total}
                    </Badge>
                  )}
                </motion.div>
              </TabsTrigger>
              
              <TabsTrigger 
                value="tarefas" 
                className="flex items-center gap-2 transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600/90 data-[state=active]:to-green-600 data-[state=active]:text-white h-10"
              >
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className="flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Tarefas</span>
                </motion.div>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
        
        {/* Conteúdo das tabs */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            <TabsContent value="rotinas" className="space-y-4 w-full m-0">
              <div className="bg-card rounded-xl shadow-sm border border-border/40 overflow-hidden">
                <div className="p-4 sm:p-6">
                  <RotinasStats rotinas={rotinas} />
                  <RotinasList 
                    rotinas={rotinas}
                    isLoading={isLoading}
                    onToggleConclusao={toggleConclusao}
                    onEditRotina={updateRotina}
                    onDeleteRotina={deleteRotina}
                    onDuplicateRotina={duplicateRotina}
                    getCachedUserName={getCachedUserName}
                    onCreateTarefa={handleCreateTarefa}
                    onViewTarefa={handleViewTarefa}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="tarefas" className="space-y-4 w-full m-0">
              <div className="bg-card rounded-xl shadow-sm border border-border/40 overflow-hidden">
                <OrientacaoTarefas />
              </div>
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>

      {/* Dialog para adicionar nova rotina */}
      <AddRotinaDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSave={handleCreateRotina}
      />

      <PDFExportDialog
        open={showPDFDialog}
        onOpenChange={setShowPDFDialog}
        rotinas={rotinas}
        onExport={handleExportPDF}
        isExporting={isExporting}
      />
    </div>
  );
}
