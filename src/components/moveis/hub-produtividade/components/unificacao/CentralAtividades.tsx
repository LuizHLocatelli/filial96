
import { useState, useEffect } from 'react';
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, ListTodo } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

// Components from Orientacoes
import { OrientacoesList } from "@/components/moveis/orientacoes/OrientacoesList";

// New unified component
import { UnifiedActivityTimeline } from './UnifiedActivityTimeline';

// New hooks and components
import { useTarefasOperations } from './hooks/useTarefasOperations';
import { useUrlParams } from './hooks/useUrlParams';
import { useOrientacoesMonitoring } from './hooks/useOrientacoesMonitoring';
import { CentralAtividadesDialogs } from './components/CentralAtividadesDialogs';

// Hooks
import { useIsMobile } from "@/hooks/use-mobile";
import { useRotinas } from "@/components/moveis/rotinas/hooks/useRotinas";

export function CentralAtividades() {
  const isMobile = useIsMobile();
  const [showAddRotinaDialog, setShowAddRotinaDialog] = useState(false);
  const [showAddTarefaForm, setShowAddTarefaForm] = useState(false);
  const [showAddOrientacaoDialog, setShowAddOrientacaoDialog] = useState(false);
  
  // Custom hooks
  const { searchParams, selectedTab, clearActionParam, handleTabChange } = useUrlParams();
  const { unreadCount, handleUploadOrientacaoSuccess } = useOrientacoesMonitoring();
  const {
    tarefas,
    orientacoes,
    isLoadingTarefas,
    tarefaForm,
    handleCreateTarefa,
    handleAtualizarStatusTarefa,
    handleExcluirTarefa,
  } = useTarefasOperations();

  const {
    rotinas,
    isLoading: isLoadingRotinas,
    addRotina,
    deleteRotina,
    toggleConclusao,
  } = useRotinas();

  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'new-rotina') {
      setShowAddRotinaDialog(true);
      clearActionParam();
    } else if (action === 'new-tarefa') {
      setShowAddTarefaForm(true);
      clearActionParam();
    } else if (action === 'new-orientacao') {
      setShowAddOrientacaoDialog(true);
      clearActionParam();
    }
  }, [searchParams, clearActionParam]);

  const handleCreateRotina = async (data: any) => {
    const success = await addRotina(data);
    if (success) {
      setShowAddRotinaDialog(false);
    }
    return success;
  };

  const handleCreateTarefaWrapper = async (data: any) => {
    await handleCreateTarefa(data);
    setShowAddTarefaForm(false);
  };

  const handleUploadOrientacaoSuccessWrapper = () => {
    handleUploadOrientacaoSuccess();
    setShowAddOrientacaoDialog(false);
  };

  // Handlers para o componente unificado
  const handleUnifiedStatusChange = async (id: string, type: 'rotina' | 'tarefa', status: string) => {
    if (type === 'rotina') {
      if (status === 'concluida' || status === 'pendente') {
        const isCompleted = status === 'concluida';
        await toggleConclusao(id, isCompleted);
      }
    } else if (type === 'tarefa') {
      await handleAtualizarStatusTarefa(id, status);
    }
  };

  const handleUnifiedEdit = (id: string, type: 'rotina' | 'tarefa') => {
    // Implementar lógica de edição
    console.log(`Editar ${type}:`, id);
  };

  const handleUnifiedDelete = async (id: string, type: 'rotina' | 'tarefa') => {
    if (type === 'rotina') {
      await deleteRotina(id);
    } else if (type === 'tarefa') {
      await handleExcluirTarefa(id);
    }
  };

  const handleUnifiedCreateRelated = (parentId: string, parentType: 'rotina' | 'tarefa', newType: 'rotina' | 'tarefa') => {
    if (newType === 'rotina') {
      setShowAddRotinaDialog(true);
    } else if (newType === 'tarefa') {
      setShowAddTarefaForm(true);
    }
  };

  const handleUnifiedCreateNew = (type: 'rotina' | 'tarefa') => {
    if (type === 'rotina') {
      setShowAddRotinaDialog(true);
    } else if (type === 'tarefa') {
      setShowAddTarefaForm(true);
    }
  };

  // Helper function to get user name synchronously
  const getUserName = (userId: string): string => {
    return "Usuário"; // Placeholder - you might want to implement a synchronous cache
  };

  return (
    <div className="w-full max-w-full relative">
      <Tabs 
        value={selectedTab} 
        onValueChange={handleTabChange} 
        className="w-full"
      >
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 -mx-6 px-6 border-b">
          <TabsList className="grid w-full grid-cols-2 h-auto py-2">
            <TabsTrigger value="atividades" className="flex flex-col sm:flex-row items-center gap-2 p-3">
              <ListTodo className="h-5 w-5" />
              <div className="text-center">
                <span className="font-semibold">Rotinas e Tarefas</span>
                <Badge variant="outline" className="ml-2 hidden sm:inline-block">{rotinas.length + tarefas.length}</Badge>
              </div>
            </TabsTrigger>
            <TabsTrigger value="orientacoes" className="flex flex-col sm:flex-row items-center gap-2 p-3">
              <FileText className="h-5 w-5" />
              <div className="text-center">
                <span className="font-semibold">VM e Informativos</span>
                {unreadCount > 0 && (
                  <Badge className="ml-2 hidden sm:inline-block">{unreadCount}</Badge>
                )}
              </div>
            </TabsTrigger>
          </TabsList>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            className="w-full max-w-full relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <TabsContent value="atividades" className="mt-0">
              <div className="bg-gradient-to-br from-background to-muted/20">
                <div className="p-4 sm:p-6">
                  <UnifiedActivityTimeline
                    rotinas={rotinas || []}
                    tarefas={tarefas || []}
                    isLoading={isLoadingRotinas || isLoadingTarefas}
                    onStatusChange={handleUnifiedStatusChange}
                    onEdit={handleUnifiedEdit}
                    onDelete={handleUnifiedDelete}
                    onCreateRelated={handleUnifiedCreateRelated}
                    onCreateNew={handleUnifiedCreateNew}
                    getCachedUserName={getUserName}
                    onAddTarefa={() => setShowAddTarefaForm(true)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="orientacoes" className="mt-0">
              <div className="bg-gradient-to-br from-background to-purple-50/20 dark:to-purple-950/20">
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
                        VM e Informativos
                      </h1>
                      <p className="text-muted-foreground mt-1">
                        Gerencie orientações e informativos da empresa.
                      </p>
                    </div>
                    
                    <Button
                      onClick={() => setShowAddOrientacaoDialog(true)}
                      className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
                      size={isMobile ? "sm" : "default"}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Novo Informativo
                    </Button>
                  </div>
                  <OrientacoesList />
                </div>
              </div>
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>

      <CentralAtividadesDialogs
        showAddRotinaDialog={showAddRotinaDialog}
        setShowAddRotinaDialog={setShowAddRotinaDialog}
        onCreateRotina={handleCreateRotina}
        showAddTarefaForm={showAddTarefaForm}
        setShowAddTarefaForm={setShowAddTarefaForm}
        tarefaForm={tarefaForm}
        onCreateTarefa={handleCreateTarefaWrapper}
        orientacoes={orientacoes}
        rotinas={rotinas.map(r => ({ id: r.id, nome: r.nome }))}
        showAddOrientacaoDialog={showAddOrientacaoDialog}
        setShowAddOrientacaoDialog={setShowAddOrientacaoDialog}
        onUploadOrientacaoSuccess={handleUploadOrientacaoSuccessWrapper}
      />
    </div>
  );
}

export default CentralAtividades;
