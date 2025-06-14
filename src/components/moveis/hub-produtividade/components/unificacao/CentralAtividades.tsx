
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, ListTodo } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AtividadesTabContent } from './components/AtividadesTabContent';
import { OrientacoesTabContent } from './components/OrientacoesTabContent';
import { CentralAtividadesDialogs } from './components/CentralAtividadesDialogs';
import { useCentralAtividades } from './hooks/useCentralAtividades';

export function CentralAtividades() {
  const {
    showAddRotinaDialog,
    setShowAddRotinaDialog,
    showAddTarefaForm,
    setShowAddTarefaForm,
    showAddOrientacaoDialog,
    setShowAddOrientacaoDialog,
    selectedTab,
    handleTabChange,
    unreadCount,
    tarefas,
    orientacoes,
    isLoadingTarefas,
    tarefaForm,
    rotinas,
    isLoadingRotinas,
    handleCreateRotina,
    handleCreateTarefaWrapper,
    handleUploadOrientacaoSuccessWrapper,
    handleUnifiedStatusChange,
    handleUnifiedEdit,
    handleUnifiedDelete,
    handleUnifiedCreateRelated,
    handleUnifiedCreateNew,
    getUserName,
  } = useCentralAtividades();

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
              <AtividadesTabContent
                rotinas={rotinas}
                tarefas={tarefas}
                isLoading={isLoadingRotinas || isLoadingTarefas}
                onStatusChange={handleUnifiedStatusChange}
                onEdit={handleUnifiedEdit}
                onDelete={handleUnifiedDelete}
                onCreateRelated={handleUnifiedCreateRelated}
                onCreateNew={handleUnifiedCreateNew}
                getCachedUserName={getUserName}
                onAddTarefa={() => setShowAddTarefaForm(true)}
              />
            </TabsContent>

            <TabsContent value="orientacoes" className="mt-0">
              <OrientacoesTabContent
                onShowAddOrientacaoDialog={() => setShowAddOrientacaoDialog(true)}
              />
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
