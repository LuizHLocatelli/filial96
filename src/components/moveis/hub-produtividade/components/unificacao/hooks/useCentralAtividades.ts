
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
