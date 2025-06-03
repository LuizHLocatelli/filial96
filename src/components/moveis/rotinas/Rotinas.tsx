
import { useState, useEffect } from 'react';
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RotinasList } from "./components/RotinasList";
import { RotinasStats } from "./components/RotinasStats";
import { AddRotinaDialog } from "./components/AddRotinaDialog";
import { PDFExportDialog } from "./components/PDFExportDialog";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Plus, Calendar, FileDown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";
import { OrientacaoTarefas } from "../orientacoes/OrientacaoTarefas";
import { useRotinas } from "./hooks/useRotinas";
import { usePDFExport } from "./hooks/usePDFExport";
import { PDFExportOptions } from "./components/PDFExportDialog";

export function Rotinas() {
  const isMobile = useIsMobile();
  const [selectedTab, setSelectedTab] = useState("rotinas");
  const [refreshKey, setRefreshKey] = useState(0);
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
    refetch
  } = useRotinas();

  // Hook para exportação PDF
  const { exportToPDF } = usePDFExport();
  
  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1);
    setShowAddDialog(false);
  };

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
      handleSuccess();
    }
    return success;
  };
  
  return (
    <div className="w-full max-w-full">
      <Tabs 
        value={selectedTab} 
        onValueChange={handleTabChange} 
        className="space-y-6 w-full"
      >
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border/40">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-foreground">Rotinas e Tarefas</h2>
            <p className="text-sm text-muted-foreground">Gerencie rotinas obrigatórias e tarefas relacionadas</p>
          </div>
          
          <TabsList className="grid grid-cols-2 w-full bg-muted/50 p-1 rounded-lg">
            <TabsTrigger 
              value="rotinas" 
              className="flex items-center gap-2 transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/90 data-[state=active]:to-primary"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="flex items-center gap-2"
              >
                <CheckSquare className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{isMobile ? "Rotinas" : "Rotinas"}</span>
              </motion.div>
            </TabsTrigger>
            
            <TabsTrigger 
              value="tarefas" 
              className="flex items-center gap-2 transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/90 data-[state=active]:to-primary"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{isMobile ? "Tarefas" : "Tarefas"}</span>
              </motion.div>
            </TabsTrigger>
          </TabsList>
        </div>
        
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
                    key={refreshKey}
                    rotinas={rotinas}
                    isLoading={isLoading}
                    onToggleConclusao={toggleConclusao}
                    onEditRotina={updateRotina}
                    onDeleteRotina={deleteRotina}
                    onDuplicateRotina={duplicateRotina}
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

      <AddRotinaDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={handleCreateRotina}
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
