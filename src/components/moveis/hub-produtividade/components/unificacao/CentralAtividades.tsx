import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Plus, Calendar, FileText, Upload, ListTodo, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Components from Rotinas
import { RotinasList } from "@/components/moveis/rotinas/components/RotinasList";
import { RotinasStats } from "@/components/moveis/rotinas/components/RotinasStats";
import { AddRotinaDialog } from "@/components/moveis/rotinas/components/AddRotinaDialog";
import { PDFExportDialog, PDFExportOptions } from "@/components/moveis/rotinas/components/PDFExportDialog";

// Components from Orientacoes
import { OrientacoesList } from "@/components/moveis/orientacoes/OrientacoesList";
import { OrientacaoUploader } from "@/components/moveis/orientacoes/OrientacaoUploader";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Components from Tarefas
import { TarefasList } from "@/components/moveis/orientacoes/components/TarefasList";
import { TarefaForm } from "@/components/moveis/orientacoes/components/TarefaForm";
import { TarefasHeaderStats } from "@/components/moveis/orientacoes/components/TarefasHeaderStats";
import { Tarefa } from "@/components/moveis/orientacoes/types";

// Hooks
import { useIsMobile } from "@/hooks/use-mobile";
import { useRotinas } from "@/components/moveis/rotinas/hooks/useRotinas";
import { usePDFExport } from "@/components/moveis/rotinas/hooks/usePDFExport";
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UnifiedActivityTimeline } from './UnifiedActivityTimeline';

const tarefaFormSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório"),
  descricao: z.string().optional(),
  data_entrega: z.date(),
  orientacao_id: z.string().optional(),
  rotina_id: z.string().optional(),
  prioridade: z.enum(['baixa', 'media', 'alta', 'urgente']).default('media'),
  origem: z.enum(['manual', 'rotina', 'orientacao']).default('manual'),
});

type TarefaFormValues = z.infer<typeof tarefaFormSchema>;

export function CentralAtividades() {
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTab, setSelectedTab] = useState("atividades");
  const [showAddRotinaDialog, setShowAddRotinaDialog] = useState(false);
  const [showAddTarefaForm, setShowAddTarefaForm] = useState(false);
  const [showAddOrientacaoDialog, setShowAddOrientacaoDialog] = useState(false);
  const [showPDFDialog, setShowPDFDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [refreshOrientacoes, setRefreshOrientacoes] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Estados para Tarefas
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [orientacoes, setOrientacoes] = useState<Array<{ id: string; titulo: string }>>([]);
  const [isLoadingTarefas, setIsLoadingTarefas] = useState(true);

  const { user } = useAuth();
  const { toast } = useToast();
  
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

  const tarefaForm = useForm<TarefaFormValues>({
    resolver: zodResolver(tarefaFormSchema),
    defaultValues: {
      titulo: "",
      descricao: "",
      orientacao_id: "none",
      rotina_id: "none",
      prioridade: "media",
      origem: "manual",
    },
  });

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
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    fetchTarefas();
    fetchOrientacoes();
  }, []);

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

  const handleCreateTarefa = async (data: TarefaFormValues) => {
    try {
      setIsLoadingTarefas(true);
      const response = await fetch('/api/tarefas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          usuario_id: user?.id,
          orientacao_id: data.orientacao_id === 'none' ? null : data.orientacao_id,
          rotina_id: data.rotina_id === 'none' ? null : data.rotina_id,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar tarefa');
      }

      const novaTarefa = await response.json();
      setTarefas(prev => [novaTarefa, ...prev]);
      setShowAddTarefaForm(false);
      tarefaForm.reset();
      
      toast({
        title: "Sucesso",
        description: "Tarefa criada com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar tarefa. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingTarefas(false);
    }
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

  // Funções para Tarefas
  const fetchTarefas = async () => {
    setIsLoadingTarefas(true);
    try {
      const { data, error } = await supabase
        .from("moveis_tarefas")
        .select(`
          *,
          orientacao:moveis_orientacoes(titulo)
        `)
        .order("data_entrega", { ascending: true });

      if (error) throw error;

      setTarefas((data || []) as unknown as Tarefa[]);
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de tarefas.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingTarefas(false);
    }
  };

  const fetchOrientacoes = async () => {
    try {
      const { data, error } = await supabase
        .from("moveis_orientacoes")
        .select("id, titulo")
        .order("titulo", { ascending: true });

      if (error) throw error;

      setOrientacoes((data || []) as unknown as Array<{ id: string; titulo: string }>);
    } catch (error) {
      console.error("Erro ao buscar orientações:", error);
    }
  };

  const handleAtualizarStatusTarefa = async (tarefaId: string, novoStatus: string) => {
    try {
      const { error } = await supabase
        .from("moveis_tarefas")
        .update({ status: novoStatus })
        .eq("id", tarefaId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Status da tarefa atualizado!",
      });

      fetchTarefas();
    } catch (error) {
      console.error("Erro ao atualizar status da tarefa:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status da tarefa.",
        variant: "destructive",
      });
    }
  };

  const handleExcluirTarefa = async (tarefaId: string) => {
    try {
      const { error } = await supabase
        .from("moveis_tarefas")
        .delete()
        .eq("id", tarefaId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Tarefa excluída com sucesso!",
      });

      fetchTarefas();
    } catch (error) {
      console.error("Erro ao excluir tarefa:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a tarefa.",
        variant: "destructive",
      });
    }
  };

  // Fetch unread count for orientacoes
  useEffect(() => {
    if (!user) return;
    const fetchUnreadCount = async () => {
      try {
        // Primeiro, buscar os IDs das orientações já visualizadas
        const { data: visualizadas, error: errorVisualizadas } = await supabase
          .from('moveis_orientacoes_visualizacoes')
          .select('orientacao_id')
          .eq('user_id', user.id);
        
        if (errorVisualizadas) throw errorVisualizadas;
        
        // Extrair apenas os IDs
        const idsVisualizadas = visualizadas?.map(v => v.orientacao_id) || [];
        
        // Buscar orientações não visualizadas
        let query = supabase
          .from('moveis_orientacoes')
          .select('id');
        
        // Se há orientações visualizadas, excluí-las da busca
        if (idsVisualizadas.length > 0) {
          query = query.not('id', 'in', `(${idsVisualizadas.map(id => `'${id}'`).join(',')})`);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        setUnreadCount(data?.length || 0);
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

  const tarefasStats = {
    total: tarefas.length,
    concluidas: tarefas.filter(t => t.status === 'concluida').length,
    pendentes: tarefas.filter(t => t.status === 'pendente').length,
    atrasadas: tarefas.filter(t => new Date(t.data_entrega) < new Date() && t.status !== 'concluida').length,
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
    // Since getCachedUserName is async but we need sync, we'll use a fallback
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
          <TabsList className="grid w-full grid-cols-3 h-auto py-2">
            <TabsTrigger value="atividades" className="flex flex-col sm:flex-row items-center gap-2 p-3">
              <ListTodo className="h-5 w-5" />
              <div className="text-center">
                <span className="font-semibold">Rotinas</span>
                <Badge variant="outline" className="ml-2 hidden sm:inline-block">{rotinas.length}</Badge>
              </div>
            </TabsTrigger>
            <TabsTrigger value="orientacoes" className="flex flex-col sm:flex-row items-center gap-2 p-3">
              <FileText className="h-5 w-5" />
              <div className="text-center">
                <span className="font-semibold">Orientações</span>
                {unreadCount > 0 && (
                  <Badge className="ml-2 hidden sm:inline-block">{unreadCount}</Badge>
                )}
              </div>
            </TabsTrigger>
            <TabsTrigger value="tarefas" className="flex flex-col sm:flex-row items-center gap-2 p-3">
              <CheckSquare className="h-5 w-5" />
              <div className="text-center">
                <span className="font-semibold">Tarefas</span>
                <Badge variant="outline" className="ml-2 hidden sm:inline-block">{tarefas.length}</Badge>
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
                  <OrientacoesList key={refreshOrientacoes} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tarefas" className="mt-0">
              <div className="bg-gradient-to-br from-background to-muted/20">
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
                        Tarefas
                      </h1>
                      <p className="text-muted-foreground mt-1">
                        Gerencie suas tarefas.
                      </p>
                    </div>
                    
                    <Button
                      onClick={() => setShowAddTarefaForm(true)}
                      className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
                      size={isMobile ? "sm" : "default"}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Tarefa
                    </Button>
                  </div>
                  <TarefasList 
                    tarefas={tarefas} 
                    isLoading={isLoadingTarefas}
                    onAtualizarStatus={handleAtualizarStatusTarefa}
                    onExcluirTarefa={handleExcluirTarefa}
                  />
                </div>
              </div>
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>

      <AddRotinaDialog
        open={showAddRotinaDialog}
        onOpenChange={setShowAddRotinaDialog}
        onSubmit={handleCreateRotina}
      />

      <Dialog open={showAddTarefaForm} onOpenChange={setShowAddTarefaForm}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Tarefa</DialogTitle>
          </DialogHeader>
          <TarefaForm
            form={tarefaForm}
            orientacoes={orientacoes}
            rotinas={rotinas.map(r => ({ id: r.id, nome: r.nome }))}
            onSubmit={handleCreateTarefa}
            onCancel={() => setShowAddTarefaForm(false)}
          />
        </DialogContent>
      </Dialog>

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
        rotinas={rotinas || []}
        onExport={handleExportPDF}
        isExporting={isExporting}
      />
    </div>
  );
}

export default CentralAtividades;
