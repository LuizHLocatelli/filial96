import { useState, useMemo } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Search, FolderPlus, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UploadZone } from "./components/UploadZone";
import { FileGrid } from "./components/FileGrid";
import { FolderGrid } from "./components/FolderGrid";
import { FolderBreadcrumb } from "./components/FolderBreadcrumb";
import { DiretorioDialogs } from "./components/DiretorioDialogs";
import { PastaGerencial } from "./types";
import { motion } from "framer-motion";
import { usePastasGerenciais } from "./hooks/usePastasGerenciais";
import { useArquivosGerenciais } from "./hooks/useArquivosGerenciais";
import { useAllPastas } from "./hooks/useAllPastas";
import { useDialogState } from "./hooks/useDialogState";

interface BreadcrumbItem {
  id: string | null;
  nome: string;
}

export default function DiretorioGerencial() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pastaAtualId, setPastaAtualId] = useState<string | null>(null);
  const [breadcrumbPath, setBreadcrumbPath] = useState<BreadcrumbItem[]>([
    { id: null, nome: "Diretório Gerencial" },
  ]);

  const {
    pastas,
    pastaAtual,
    isLoading: isLoadingPastas,
    criarPasta,
    atualizarPasta,
    excluirPasta,
    moverPasta,
  } = usePastasGerenciais(pastaAtualId);

  const { moverArquivo, deleteArquivo } = useArquivosGerenciais(pastaAtualId);
  const { allPastas } = useAllPastas();

  const dialogs = useDialogState({
    pastaAtualId,
    criarPasta,
    atualizarPasta,
    excluirPasta,
    moverPasta,
    moverArquivo,
    deleteArquivo,
  });

  // Filter folders by search
  const filteredPastas = useMemo(() => {
    if (!pastas || !searchQuery.trim()) return pastas;
    const q = searchQuery.toLowerCase();
    return pastas.filter((p) => p.nome.toLowerCase().includes(q));
  }, [pastas, searchQuery]);

  const handleFolderClick = (pasta: PastaGerencial) => {
    setPastaAtualId(pasta.id);
    setBreadcrumbPath((prev) => [...prev, { id: pasta.id, nome: pasta.nome }]);
  };

  const handleBreadcrumbNavigate = (pastaId: string | null) => {
    setPastaAtualId(pastaId);
    const index = breadcrumbPath.findIndex((item) => item.id === pastaId);
    if (index !== -1) {
      setBreadcrumbPath(breadcrumbPath.slice(0, index + 1));
    }
  };

  const handleGoBack = () => {
    if (breadcrumbPath.length > 1) {
      const newPath = breadcrumbPath.slice(0, -1);
      const parentFolder = newPath[newPath.length - 1];
      setPastaAtualId(parentFolder.id);
      setBreadcrumbPath(newPath);
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title="Diretório Gerencial"
        description="Armazene, organize e analise documentos com inteligência artificial"
      />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Upload Zone */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <UploadZone pastaAtualId={pastaAtualId} pastaAtualNome={pastaAtual?.nome} />
        </motion.div>

        {/* Toolbar */}
        <div className="glass-panel p-4 space-y-4 sticky top-[4.5rem] z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 overflow-hidden">
              {breadcrumbPath.length > 1 && (
                <Button variant="ghost" size="sm" onClick={handleGoBack} className="h-8 px-2 flex-shrink-0">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Voltar
                </Button>
              )}
              <div className="overflow-x-auto">
                <FolderBreadcrumb path={breadcrumbPath} onNavigate={handleBreadcrumbNavigate} />
              </div>
            </div>

            <Button onClick={() => dialogs.setIsCreateFolderOpen(true)} size="sm" className="flex-shrink-0">
              <FolderPlus className="h-4 w-4 mr-2" />
              Nova Pasta
            </Button>
          </div>

          <div className="flex items-center space-x-3">
            <Search className="w-5 h-5 text-muted-foreground ml-2" />
            <Input
              placeholder="Pesquisar pastas e arquivos por nome, tags ou resumo..."
              className="border-0 bg-transparent focus-visible:ring-0 px-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Folders Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <FolderGrid
            pastas={filteredPastas}
            isLoading={isLoadingPastas}
            onFolderClick={handleFolderClick}
            onEditFolder={dialogs.onEditFolderClick}
            onDeleteFolder={dialogs.onDeleteFolderClick}
            onMoveFolder={dialogs.onMoveFolderClick}
          />
        </motion.div>

        {/* Files Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <FileGrid
            pastaAtualId={pastaAtualId}
            searchQuery={searchQuery}
            onFileClick={(arquivo, url) => dialogs.setSelectedFile({ arquivo, url })}
            onDeleteFile={dialogs.handleDeleteFile}
            onMoveFile={dialogs.onMoveFileClick}
          />
        </motion.div>
      </div>

      {/* All Dialogs */}
      <DiretorioDialogs
        selectedFile={dialogs.selectedFile}
        setSelectedFile={dialogs.setSelectedFile}
        isCreateFolderOpen={dialogs.isCreateFolderOpen}
        setIsCreateFolderOpen={dialogs.setIsCreateFolderOpen}
        handleCreateFolder={dialogs.handleCreateFolder}
        isCreatingFolder={dialogs.isCreatingFolder}
        isEditFolderOpen={dialogs.isEditFolderOpen}
        setIsEditFolderOpen={dialogs.setIsEditFolderOpen}
        handleEditFolder={dialogs.handleEditFolder}
        isEditingFolder={dialogs.isEditingFolder}
        selectedPasta={dialogs.selectedPasta}
        isDeleteFolderOpen={dialogs.isDeleteFolderOpen}
        setIsDeleteFolderOpen={dialogs.setIsDeleteFolderOpen}
        handleDeleteFolder={dialogs.handleDeleteFolder}
        isDeletingFolder={dialogs.isDeletingFolder}
        isMoveFolderOpen={dialogs.isMoveFolderOpen}
        setIsMoveFolderOpen={dialogs.setIsMoveFolderOpen}
        handleMoveFolder={dialogs.handleMoveFolder}
        isMovingFolder={dialogs.isMovingFolder}
        isMoveFileOpen={dialogs.isMoveFileOpen}
        setIsMoveFileOpen={dialogs.setIsMoveFileOpen}
        handleMoveFile={dialogs.handleMoveFile}
        isMovingFile={dialogs.isMovingFile}
        selectedArquivo={dialogs.selectedArquivo}
        isDeleteFileOpen={dialogs.isDeleteFileOpen}
        setIsDeleteFileOpen={dialogs.setIsDeleteFileOpen}
        confirmDeleteFile={dialogs.confirmDeleteFile}
        isDeletingFile={dialogs.isDeletingFile}
        pastaAtualId={pastaAtualId}
        allPastas={allPastas}
      />
    </PageLayout>
  );
}
