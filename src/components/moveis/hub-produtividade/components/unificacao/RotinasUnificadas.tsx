import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Plus, Calendar, FileText, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Components from Rotinas
import { RotinasList } from "@/components/moveis/rotinas/components/RotinasList";
import { RotinasStats } from "@/components/moveis/rotinas/components/RotinasStats";
import { AddRotinaDialog } from "@/components/moveis/rotinas/components/AddRotinaDialog";
import { PDFExportDialog, PDFExportOptions } from "@/components/moveis/rotinas/components/PDFExportDialog";

// Components from Orientacoes
import { OrientacoesList } from "@/components/moveis/orientacoes/OrientacoesList";
import { OrientacaoUploader } from "@/components/moveis/orientacoes/OrientacaoUploader"; // Using as a dialog content
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Components from Tarefas
import { OrientacaoTarefas } from "@/components/moveis/orientacoes/OrientacaoTarefas";

// Hooks
import { useIsMobile } from "@/hooks/use-mobile";
import { useRotinas } from "@/components/moveis/rotinas/hooks/useRotinas";
import { usePDFExport } from "@/components/moveis/rotinas/hooks/usePDFExport";
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';

export function RotinasUnificadas() {
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTab, setSelectedTab] = useState("rotinas");
  const [showAddRotinaDialog, setShowAddRotinaDialog] = useState(false);
  const [showAddOrientacaoDialog, setShowAddOrientacaoDialog] = useState(false);
  const [showPDFDialog, setShowPDFDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [refreshOrientacoes, setRefreshOrientacoes] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  const { user } = useAuth();
  
  const {
    rotinas,
    isLoading: isLoadingRotinas,
    addRotina,
    updateRotina,
    deleteRotina,
    duplicateRotina,
    toggleConclusao,
    refetch: refetchRotinas,
    getCachedUserName
  } = useRotinas();

  const { exportToPDF } = usePDFExport();

  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'new-rotina') {
      setShowAddRotinaDialog(true);
      clearActionParam();
    } else if (action === 'new-orientacao') {
      setShowAddOrientacaoDialog(true);
      clearActionParam();
    }
  }, [searchParams, setSearchParams]);

  const clearActionParam = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('action');
    setSearchParams(newParams);
  };
  
  const handleTabChange = (value: string) => {
    setSelectedTab(value);
  };

  const handleCreateRotina = async (data: any) => {
    const success = await addRotina(data);
    if (success) {
      setShowAddRotinaDialog(false);
    }
    return success;
  };

  const handleUploadOrientacaoSuccess = () => {
    setRefreshOrientacoes(prev => prev + 1);
    setShowAddOrientacaoDialog(false);
  };
  
  const handleExportPDF = async (options: PDFExportOptions) => {
    setIsExporting(true);
    await exportToPDF(rotinas, options);
    setIsExporting(false);
  };

  // Fetch unread count for orientacoes
  useEffect(() => {
    if (!user) return;
    const fetchUnreadCount = async () => {
      try {
        const { data: orientacoes, error: orientacoesError } = await supabase
          .from('moveis_orientacoes')
          .select('id');
          
        if (orientacoesError) throw orientacoesError;
        if (!orientacoes || orientacoes.length === 0) {
          setUnreadCount(0);
          return;
        }
        
        const orientacaoIds = orientacoes.map(o => o.id);
        const { data: readStatus, error: readError } = await supabase
          .from('notification_read_status')
          .select('activity_id')
          .eq('user_id', user.id)
          .in('activity_id', orientacaoIds);
          
        if (readError) throw readError;
        
        const readIds = readStatus?.map(s => s.activity_id) || [];
        const count = orientacaoIds.filter(id => !readIds.includes(id)).length;
        setUnreadCount(count);
      } catch (error) {
        console.error("Erro ao buscar informativos não lidos:", error);
      }
    };
    
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [user, refreshOrientacoes]);

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
        <div className="bg-card rounded-xl p-4 sm:p-6 shadow-sm border border-border/40">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Central de Atividades</h2>
              <p className="text-sm text-muted-foreground">
                Gerencie rotinas, tarefas, VM e informativos em um só lugar.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddOrientacaoDialog(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Novo VM ou Informativo
              </Button>
              <Button
                onClick={() => setShowAddRotinaDialog(true)}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Rotina
              </Button>
            </div>
          </div>
          
          <div className="mt-6">
            <TabsList className="grid grid-cols-3 w-full bg-muted/50 p-1 rounded-lg h-12">
              <TabsTrigger 
                value="rotinas" 
                className="flex items-center gap-2 transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600/90 data-[state=active]:to-green-600 data-[state=active]:text-white h-10"
              >
                <CheckSquare className="h-4 w-4" />
                <span>Rotinas</span>
                <Badge variant="secondary" className="ml-2">{stats.total}</Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="tarefas" 
                className="flex items-center gap-2 transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600/90 data-[state=active]:to-green-600 data-[state=active]:text-white h-10"
              >
                <Calendar className="h-4 w-4" />
                <span>Tarefas</span>
              </TabsTrigger>
              <TabsTrigger 
                value="informativos" 
                className="flex items-center gap-2 transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/90 data-[state=active]:to-primary data-[state=active]:text-white h-10 relative"
              >
                <FileText className="h-4 w-4" />
                <span>VM e Informativos</span>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2 absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">{unreadCount}</Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>
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
                    rotinas={rotinas}
                    isLoading={isLoadingRotinas}
                    onToggleConclusao={toggleConclusao}
                    onEditRotina={updateRotina}
                    onDeleteRotina={deleteRotina}
                    onDuplicateRotina={duplicateRotina}
                    getCachedUserName={getCachedUserName}
                    onCreateTarefa={() => setSelectedTab("tarefas")}
                    onViewTarefa={() => setSelectedTab("tarefas")}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="tarefas" className="space-y-4 w-full m-0">
              <div className="bg-card rounded-xl shadow-sm border border-border/40 overflow-hidden">
                <OrientacaoTarefas />
              </div>
            </TabsContent>

            <TabsContent value="informativos" className="space-y-4 w-full m-0">
                <div className="bg-card rounded-xl shadow-sm border border-border/40 overflow-hidden">
                    <OrientacoesList key={refreshOrientacoes} onNovaOrientacao={() => setShowAddOrientacaoDialog(true)} />
                </div>
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>

      <AddRotinaDialog
        open={showAddRotinaDialog}
        onOpenChange={setShowAddRotinaDialog}
        onSave={handleCreateRotina}
      />

      <Dialog open={showAddOrientacaoDialog} onOpenChange={setShowAddOrientacaoDialog}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo VM ou Informativo</DialogTitle>
          </DialogHeader>
          <OrientacaoUploader onSuccess={handleUploadOrientacaoSuccess} />
        </DialogContent>
      </Dialog>

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
