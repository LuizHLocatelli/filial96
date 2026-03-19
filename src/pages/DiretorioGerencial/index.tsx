import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Search, FolderPlus, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useDiretorio, DiretorioProvider } from "./hooks/useDiretorio";
import { FolderGrid } from "./components/FolderGrid";
import { FileGrid } from "./components/FileGrid";
import { Breadcrumb } from "./components/Breadcrumb";
import { UploadZone } from "./components/UploadZone";
import {
  FolderDialog,
  DeleteDialog,
  MoveDialog,
  FileViewerDialog,
} from "./components";
import { getPublicUrl } from "./lib/queries";
import { BreadcrumbItem } from "./types";

function DiretorioContent() {
  const {
    currentFolderId,
    setCurrentFolderId,
    pastas,
    isLoadingPastas,
    arquivos,
    isLoadingArquivos,
    allPastas,
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
    isCreatingFolder,
    isUpdatingFolder,
    isDeletingFolder,
    isMovingFolder,
    isMovingFile,
    isDeletingFile,
  } = useDiretorio();

  const selectedPasta =
    dialogState.itemType === "pasta" && dialogState.selectedId
      ? allPastas?.find((p) => p.id === dialogState.selectedId)
      : null;

  const selectedArquivo =
    dialogState.itemType === "arquivo" && dialogState.selectedId
      ? arquivos?.find((a) => a.id === dialogState.selectedId)
      : null;

  const getBreadcrumbPath = (): BreadcrumbItem[] => {
    const path: BreadcrumbItem[] = [
      { id: null, nome: "Diretório Gerencial" },
    ];

    if (!currentFolderId || !allPastas) return path;

    const folderPath: BreadcrumbItem[] = [];
    let currentId: string | null = currentFolderId;

    while (currentId) {
      const pasta = allPastas.find((p) => p.id === currentId);
      if (pasta) {
        folderPath.unshift({ id: pasta.id, nome: pasta.nome });
        currentId = pasta.pasta_pai_id;
      } else {
        break;
      }
    }

    return [...path, ...folderPath];
  };

  const handleFolderClick = (pasta: { id: string }) => {
    setCurrentFolderId(pasta.id);
  };

  const handleBreadcrumbNavigate = (pastaId: string | null) => {
    setCurrentFolderId(pastaId);
  };

  const handleGoBack = () => {
    if (currentFolderId && allPastas) {
      const currentPasta = allPastas.find((p) => p.id === currentFolderId);
      setCurrentFolderId(currentPasta?.pasta_pai_id || null);
    }
  };

  const handleFileClick = (arquivo: { id: string }) => {
    const foundArquivo = arquivos?.find((a) => a.id === arquivo.id);
    if (foundArquivo) {
      const url = getPublicUrl(foundArquivo.caminho_storage);
      setSelectedFile({ arquivo: foundArquivo, url });
    }
  };

  const handleDeleteConfirm = async () => {
    if (dialogState.itemType === "pasta" && dialogState.selectedId) {
      await handleDeleteFolder(dialogState.selectedId);
    } else if (dialogState.itemType === "arquivo" && selectedArquivo) {
      await handleDeleteFile(selectedArquivo);
    }
  };

  const handleMoveConfirm = async (targetPastaId: string | null) => {
    if (dialogState.itemType === "pasta" && dialogState.selectedId) {
      await handleMoveFolder(dialogState.selectedId, targetPastaId);
    } else if (dialogState.itemType === "arquivo" && dialogState.selectedId) {
      await handleMoveFile(dialogState.selectedId, targetPastaId);
    }
  };

  const currentFolderNome = currentFolderId
    ? allPastas?.find((p) => p.id === currentFolderId)?.nome
    : null;

  return (
    <PageLayout>
      <PageHeader
        title="Diretório Gerencial"
        description="Armazene, organize e analise documentos com inteligência artificial"
      />

      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <UploadZone
            pastaAtualId={currentFolderId}
            pastaAtualNome={currentFolderNome}
          />
        </motion.div>

        <div className="glass-panel p-4 space-y-4 sticky top-[4.5rem] z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 overflow-hidden">
              {currentFolderId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleGoBack}
                  className="h-8 px-2 flex-shrink-0"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Voltar
                </Button>
              )}
              <div className="overflow-x-auto">
                <Breadcrumb
                  path={getBreadcrumbPath()}
                  onNavigate={handleBreadcrumbNavigate}
                />
              </div>
            </div>

            <Button
              onClick={openCreateFolderDialog}
              size="sm"
              className="flex-shrink-0"
            >
              <FolderPlus className="h-4 w-4 mr-2" />
              Nova Pasta
            </Button>
          </div>

          <div className="flex items-center space-x-3">
            <Search className="w-5 h-5 text-muted-foreground ml-2" />
            <Input
              placeholder="Pesquisar pastas e arquivos por nome, tags ou resumo..."
              className="border-0 bg-transparent focus-visible:ring-0 px-0"
            />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <FolderGrid
            pastas={pastas}
            isLoading={isLoadingPastas}
            onFolderClick={handleFolderClick}
            onEditFolder={openEditFolderDialog}
            onDeleteFolder={openDeleteFolderDialog}
            onMoveFolder={openMoveFolderDialog}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <FileGrid
            arquivos={arquivos}
            isLoading={isLoadingArquivos}
            onFileClick={handleFileClick}
            onDeleteFile={openMoveFileDialog}
            onMoveFile={openMoveFileDialog}
          />
        </motion.div>
      </div>

      <FolderDialog
        mode={dialogState.type === "create" ? "create" : "edit"}
        isOpen={dialogState.type === "create" || dialogState.type === "edit"}
        onOpenChange={(open) => !open && closeDialog()}
        onSubmit={async (data) => {
          if (dialogState.type === "create") {
            await handleCreateFolder(data);
          } else if (dialogState.selectedId) {
            await handleUpdateFolder(dialogState.selectedId, data);
          }
        }}
        initialData={selectedPasta}
        isLoading={isCreatingFolder || isUpdatingFolder}
      />

      <DeleteDialog
        isOpen={dialogState.type === "delete"}
        onOpenChange={(open) => !open && closeDialog()}
        onConfirm={handleDeleteConfirm}
        title={`Excluir ${dialogState.itemType === "arquivo" ? "Arquivo" : "Pasta"}`}
        description={
          dialogState.itemType === "pasta"
            ? "Esta ação não pode ser desfeita. Todos os arquivos dentro desta pasta serão movidos para a pasta atual."
            : "Esta ação não pode ser desfeita."
        }
        itemName={
          dialogState.itemType === "pasta"
            ? selectedPasta?.nome
            : selectedArquivo?.nome_arquivo
        }
        itemType={dialogState.itemType as "pasta" | "arquivo"}
        isLoading={isDeletingFolder || isDeletingFile}
      />

      <MoveDialog
        isOpen={dialogState.type === "move"}
        onOpenChange={(open) => !open && closeDialog()}
        onMove={handleMoveConfirm}
        itemName={
          dialogState.itemType === "pasta"
            ? selectedPasta?.nome || ""
            : selectedArquivo?.nome_arquivo || ""
        }
        itemType={dialogState.itemType as "pasta" | "arquivo"}
        pastas={allPastas}
        currentPastaId={currentFolderId}
        isLoading={isMovingFolder || isMovingFile}
      />

      <FileViewerDialog
        arquivo={selectedFile?.arquivo || null}
        url={selectedFile?.url || null}
        open={!!selectedFile}
        onOpenChange={(open) => !open && setSelectedFile(null)}
      />
    </PageLayout>
  );
}

export default function DiretorioGerencial() {
  return (
    <DiretorioProvider>
      <DiretorioContent />
    </DiretorioProvider>
  );
}
