import { useState } from "react";
import { ArquivoGerencial, PastaGerencial } from "../types";
import { useToast } from "@/components/ui/use-toast";
import { UseMutationResult } from "@tanstack/react-query";

interface UseDialogStateProps {
  pastaAtualId: string | null;
  criarPasta: UseMutationResult<PastaGerencial, Error, string>;
  atualizarPasta: UseMutationResult<PastaGerencial, Error, { id: string; nome?: string; cor?: string; icone?: string; pasta_pai_id?: string | null }>;
  excluirPasta: UseMutationResult<string, Error, string>;
  moverPasta: UseMutationResult<PastaGerencial, Error, { id: string; pasta_pai_id: string | null }>;
  moverArquivo: UseMutationResult<ArquivoGerencial, Error, { arquivoId: string; pastaId: string | null }>;
  deleteArquivo: UseMutationResult<void, Error, ArquivoGerencial>;
}

export function useDialogState({
  pastaAtualId,
  criarPasta,
  atualizarPasta,
  excluirPasta,
  moverPasta,
  moverArquivo,
  deleteArquivo,
}: UseDialogStateProps) {
  const { toast } = useToast();

  // Dialog open states
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isEditFolderOpen, setIsEditFolderOpen] = useState(false);
  const [isDeleteFolderOpen, setIsDeleteFolderOpen] = useState(false);
  const [isDeleteFileOpen, setIsDeleteFileOpen] = useState(false);
  const [isMoveFolderOpen, setIsMoveFolderOpen] = useState(false);
  const [isMoveFileOpen, setIsMoveFileOpen] = useState(false);

  // Selected items
  const [selectedPasta, setSelectedPasta] = useState<PastaGerencial | null>(null);
  const [selectedArquivo, setSelectedArquivo] = useState<ArquivoGerencial | null>(null);
  const [selectedFile, setSelectedFile] = useState<{ arquivo: ArquivoGerencial; url: string } | null>(null);

  // Folder handlers
  const handleCreateFolder = async (nome: string) => {
    await criarPasta.mutateAsync(nome);
    setIsCreateFolderOpen(false);
  };

  const handleEditFolder = async (id: string, nome: string) => {
    await atualizarPasta.mutateAsync({ id, nome });
    setIsEditFolderOpen(false);
    setSelectedPasta(null);
  };

  const handleDeleteFolder = async (id: string) => {
    await excluirPasta.mutateAsync(id);
    setIsDeleteFolderOpen(false);
    setSelectedPasta(null);
  };

  const handleMoveFolder = async (pastaDestinoId: string | null) => {
    if (!selectedPasta) return;
    if (pastaDestinoId === selectedPasta.id) {
      toast({
        title: "Erro",
        description: "Não é possível mover uma pasta para dentro dela mesma",
        variant: "destructive",
      });
      return;
    }
    await moverPasta.mutateAsync({ id: selectedPasta.id, pasta_pai_id: pastaDestinoId });
    setIsMoveFolderOpen(false);
    setSelectedPasta(null);
  };

  const handleMoveFile = async (pastaDestinoId: string | null) => {
    if (!selectedArquivo) return;
    await moverArquivo.mutateAsync({ arquivoId: selectedArquivo.id, pastaId: pastaDestinoId });
    setIsMoveFileOpen(false);
    setSelectedArquivo(null);
  };

  const handleDeleteFile = (arquivo: ArquivoGerencial) => {
    setSelectedArquivo(arquivo);
    setIsDeleteFileOpen(true);
  };

  const confirmDeleteFile = async (arquivo: ArquivoGerencial) => {
    await deleteArquivo.mutateAsync(arquivo);
    setIsDeleteFileOpen(false);
    setSelectedArquivo(null);
  };

  // Click handlers for opening dialogs
  const onEditFolderClick = (pasta: PastaGerencial) => {
    setSelectedPasta(pasta);
    setIsEditFolderOpen(true);
  };

  const onDeleteFolderClick = (pasta: PastaGerencial) => {
    setSelectedPasta(pasta);
    setIsDeleteFolderOpen(true);
  };

  const onMoveFolderClick = (pasta: PastaGerencial) => {
    setSelectedPasta(pasta);
    setIsMoveFolderOpen(true);
  };

  const onMoveFileClick = (arquivo: ArquivoGerencial) => {
    setSelectedArquivo(arquivo);
    setIsMoveFileOpen(true);
  };

  return {
    // File viewer
    selectedFile,
    setSelectedFile,

    // Dialog states
    isCreateFolderOpen,
    setIsCreateFolderOpen,
    isEditFolderOpen,
    setIsEditFolderOpen,
    isDeleteFolderOpen,
    setIsDeleteFolderOpen,
    isDeleteFileOpen,
    setIsDeleteFileOpen,
    isMoveFolderOpen,
    setIsMoveFolderOpen,
    isMoveFileOpen,
    setIsMoveFileOpen,

    // Selected items
    selectedPasta,
    selectedArquivo,

    // Handlers
    handleCreateFolder,
    handleEditFolder,
    handleDeleteFolder,
    handleMoveFolder,
    handleMoveFile,
    handleDeleteFile,
    confirmDeleteFile,
    onEditFolderClick,
    onDeleteFolderClick,
    onMoveFolderClick,
    onMoveFileClick,

    // Loading states
    isCreatingFolder: criarPasta.isPending,
    isEditingFolder: atualizarPasta.isPending,
    isDeletingFolder: excluirPasta.isPending,
    isMovingFolder: moverPasta.isPending,
    isMovingFile: moverArquivo.isPending,
    isDeletingFile: deleteArquivo.isPending,
  };
}
