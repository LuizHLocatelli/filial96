import { useState, useEffect } from 'react';
import { useUrlParams } from './useUrlParams';
import { useOrientacoesMonitoring } from './useOrientacoesMonitoring';
import { useTarefasOperations } from './useTarefasOperations';
import { useRotinas } from "@/components/moveis/rotinas/hooks/useRotinas";

export function useCentralAtividades() {
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
    console.log('🎯 [CentralAtividades] Processando parâmetro action:', action);
    console.log('🎯 [CentralAtividades] URL completa:', window.location.href);
    console.log('🎯 [CentralAtividades] Search params:', Object.fromEntries(searchParams.entries()));
    
    if (action === 'new-rotina') {
      console.log('🔄 [CentralAtividades] Abrindo dialog de Nova Rotina');
      setShowAddRotinaDialog(true);
      clearActionParam();
    } else if (action === 'new-tarefa') {
      console.log('✅ [CentralAtividades] Abrindo dialog de Nova Tarefa');
      setShowAddTarefaForm(true);
      clearActionParam();
    } else if (action === 'new-orientacao') {
      console.log('📖 [CentralAtividades] Abrindo dialog de Nova Orientação');
      setShowAddOrientacaoDialog(true);
      clearActionParam();
    }
  }, [searchParams, clearActionParam]);

  // Debug dos estados dos dialogs
  useEffect(() => {
    console.log('🎯 [CentralAtividades] Estados dos dialogs:', {
      showAddRotinaDialog,
      showAddTarefaForm,
      showAddOrientacaoDialog
    });
  }, [showAddRotinaDialog, showAddTarefaForm, showAddOrientacaoDialog]);

  const handleCreateRotina = async (data: any) => {
    console.log('🔄 [CentralAtividades] Criando rotina:', data);
    const success = await addRotina(data);
    if (success) {
      console.log('🔄 [CentralAtividades] Rotina criada com sucesso, fechando dialog');
      setShowAddRotinaDialog(false);
    }
    return success;
  };

  const handleCreateTarefaWrapper = async (data: any) => {
    console.log('✅ [CentralAtividades] Criando tarefa:', data);
    await handleCreateTarefa(data);
    setShowAddTarefaForm(false);
  };

  const handleUploadOrientacaoSuccessWrapper = () => {
    console.log('📖 [CentralAtividades] Upload de orientação bem-sucedido');
    handleUploadOrientacaoSuccess();
    setShowAddOrientacaoDialog(false);
  };

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
    console.log(`🎯 [CentralAtividades] Criando novo ${type} manualmente`);
    if (type === 'rotina') {
      setShowAddRotinaDialog(true);
    } else if (type === 'tarefa') {
      setShowAddTarefaForm(true);
    }
  };

  const getUserName = (userId: string): string => {
    return "Usuário";
  };

  return {
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
  };
}
