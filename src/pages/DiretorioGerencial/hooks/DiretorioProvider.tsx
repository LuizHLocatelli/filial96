import { useState, useCallback, useMemo, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { usePastas, useAllPastas, useCreatePasta, useUpdatePasta, useDeletePasta, useMovePasta } from "./usePastas";
import { useArquivos, useDeleteArquivo, useMoveArquivo } from "./useArquivos";
import { useUploadQueue } from "./useUploads";
import { PastaComCounts, ArquivoGerencial, BreadcrumbItem, FileWithUrl, DialogState, FolderFormData } from "../types";
import { DiretorioContext } from "./context";

interface DiretorioProviderProps {
  children: ReactNode;
}

export function DiretorioProvider({ children }: DiretorioProviderProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentFolderId = searchParams.get("folder") || null;

  const setCurrentFolderId = useCallback(
    (id: string | null) => {
      if (id) {
        setSearchParams({ folder: id });
      } else {
        setSearchParams({});
      }
    },
    [setSearchParams]
  );

  const { pastas, isLoading: isLoadingPastas } = usePastas(currentFolderId);
  const { arquivos, isLoading: isLoadingArquivos } = useArquivos(currentFolderId);
  const { data: allPastas } = useAllPastas();

  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([
    { id: null, nome: "Diretório Gerencial" },
  ]);

  const [dialogState, setDialogState] = useState<DialogState>({
    type: null,
    itemType: null,
    selectedId: null,
  });

  const [selectedFile, setSelectedFile] = useState<FileWithUrl | null>(null);

  const createPasta = useCreatePasta();
  const updatePasta = useUpdatePasta();
  const deletePasta = useDeletePasta();
  const movePasta = useMovePasta();
  const deleteArquivo = useDeleteArquivo();
  const moveArquivo = useMoveArquivo();

  const { uploads, uploadFiles, clearCompleted } = useUploadQueue();

  const openCreateFolderDialog = useCallback(() => {
    setDialogState({ type: "create", itemType: "pasta", selectedId: null });
  }, []);

  const openEditFolderDialog = useCallback((pasta: PastaComCounts) => {
    setDialogState({ type: "edit", itemType: "pasta", selectedId: pasta.id });
  }, []);

  const openDeleteFolderDialog = useCallback((pasta: PastaComCounts) => {
    setDialogState({ type: "delete", itemType: "pasta", selectedId: pasta.id });
  }, []);

  const openMoveFolderDialog = useCallback((pasta: PastaComCounts) => {
    setDialogState({ type: "move", itemType: "pasta", selectedId: pasta.id });
  }, []);

  const openMoveFileDialog = useCallback((arquivo: ArquivoGerencial) => {
    setDialogState({ type: "move", itemType: "arquivo", selectedId: arquivo.id });
  }, []);

  const closeDialog = useCallback(() => {
    setDialogState({ type: null, itemType: null, selectedId: null });
  }, []);

  const handleCreateFolder = useCallback(
    async (data: FolderFormData) => {
      await createPasta.mutateAsync({ nome: data.nome, pastaPaiId: currentFolderId });
      closeDialog();
    },
    [createPasta, currentFolderId, closeDialog]
  );

  const handleUpdateFolder = useCallback(
    async (id: string, data: FolderFormData) => {
      await updatePasta.mutateAsync({ id, data });
      closeDialog();
    },
    [updatePasta, closeDialog]
  );

  const handleDeleteFolder = useCallback(
    async (id: string) => {
      await deletePasta.mutateAsync(id);
      closeDialog();
      if (currentFolderId === id) {
        setCurrentFolderId(null);
      }
    },
    [deletePasta, currentFolderId, setCurrentFolderId, closeDialog]
  );

  const handleMoveFolder = useCallback(
    async (pastaId: string, targetPastaId: string | null) => {
      if (pastaId === targetPastaId) {
        return;
      }
      await movePasta.mutateAsync({ pastaId, pastaPaiId: targetPastaId });
      closeDialog();
    },
    [movePasta, closeDialog]
  );

  const handleDeleteFile = useCallback(
    async (arquivo: ArquivoGerencial) => {
      await deleteArquivo.mutateAsync(arquivo);
      closeDialog();
      setSelectedFile(null);
    },
    [deleteArquivo, closeDialog, setSelectedFile]
  );

  const handleMoveFile = useCallback(
    async (arquivoId: string, targetPastaId: string | null) => {
      await moveArquivo.mutateAsync({ arquivoId, pastaId: targetPastaId });
      closeDialog();
    },
    [moveArquivo, closeDialog]
  );

  const value = useMemo(
    () => ({
      currentFolderId,
      setCurrentFolderId,
      pastas,
      isLoadingPastas,
      arquivos,
      isLoadingArquivos,
      allPastas,
      breadcrumb,
      setBreadcrumb,
      uploads,
      uploadFiles,
      clearUploads: clearCompleted,
      dialogState,
      openCreateFolderDialog,
      openEditFolderDialog,
      openDeleteFolderDialog,
      openMoveFolderDialog,
      openMoveFileDialog,
      closeDialog,
      selectedFile,
      setSelectedFile,
      handleCreateFolder,
      handleUpdateFolder,
      handleDeleteFolder,
      handleMoveFolder,
      handleDeleteFile,
      handleMoveFile,
      isCreatingFolder: createPasta.isPending,
      isUpdatingFolder: updatePasta.isPending,
      isDeletingFolder: deletePasta.isPending,
      isMovingFolder: movePasta.isPending,
      isMovingFile: moveArquivo.isPending,
      isDeletingFile: deleteArquivo.isPending,
    }),
    [
      currentFolderId,
      setCurrentFolderId,
      pastas,
      isLoadingPastas,
      arquivos,
      isLoadingArquivos,
      allPastas,
      breadcrumb,
      uploads,
      uploadFiles,
      clearCompleted,
      dialogState,
      openCreateFolderDialog,
      openEditFolderDialog,
      openDeleteFolderDialog,
      openMoveFolderDialog,
      openMoveFileDialog,
      closeDialog,
      selectedFile,
      handleCreateFolder,
      handleUpdateFolder,
      handleDeleteFolder,
      handleMoveFolder,
      handleDeleteFile,
      handleMoveFile,
      createPasta.isPending,
      updatePasta.isPending,
      deletePasta.isPending,
      movePasta.isPending,
      moveArquivo.isPending,
      deleteArquivo.isPending,
    ]
  );

  return (
    <DiretorioContext.Provider value={value}>
      {children}
    </DiretorioContext.Provider>
  );
}
