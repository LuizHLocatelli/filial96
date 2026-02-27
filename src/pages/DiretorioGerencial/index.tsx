import { useState, useMemo } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Search, FolderPlus, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UploadZone } from "./components/UploadZone";
import { FileGrid } from "./components/FileGrid";
import { FileViewer } from "./components/FileViewer";
import { FolderGrid } from "./components/FolderGrid";
import { FolderBreadcrumb } from "./components/FolderBreadcrumb";
import { CreateFolderDialog } from "./components/CreateFolderDialog";
import { EditFolderDialog } from "./components/EditFolderDialog";
import { DeleteFolderDialog } from "./components/DeleteFolderDialog";
import { DeleteFileDialog } from "./components/DeleteFileDialog";
import { MoveItemDialog } from "./components/MoveItemDialog";
import { ArquivoGerencial, PastaGerencial } from "./types";
import { motion } from "framer-motion";
import { usePastasGerenciais } from "./hooks/usePastasGerenciais";
import { useArquivosGerenciais } from "./hooks/useArquivosGerenciais";
import { useToast } from "@/components/ui/use-toast";

interface BreadcrumbItem {
  id: string | null;
  nome: string;
}

export default function DiretorioGerencial() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pastaAtualId, setPastaAtualId] = useState<string | null>(null);
  const [breadcrumbPath, setBreadcrumbPath] = useState<BreadcrumbItem[]>([
    { id: null, nome: "Diretório Gerencial" }
  ]);
  
  const [selectedFile, setSelectedFile] = useState<{arquivo: ArquivoGerencial, url: string} | null>(null);
  
  // Dialogs state
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isEditFolderOpen, setIsEditFolderOpen] = useState(false);
  const [isDeleteFolderOpen, setIsDeleteFolderOpen] = useState(false);
  const [isDeleteFileOpen, setIsDeleteFileOpen] = useState(false);
  const [isMoveFolderOpen, setIsMoveFolderOpen] = useState(false);
  const [isMoveFileOpen, setIsMoveFileOpen] = useState(false);
  const [selectedPasta, setSelectedPasta] = useState<PastaGerencial | null>(null);
  const [selectedArquivo, setSelectedArquivo] = useState<ArquivoGerencial | null>(null);
  
  const { toast } = useToast();
  
  const { 
    pastas, 
    pastaAtual, 
    isLoading: isLoadingPastas,
    criarPasta, 
    atualizarPasta, 
    excluirPasta,
    moverPasta
  } = usePastasGerenciais(pastaAtualId);
  
  const { 
    moverArquivo,
    deleteArquivo
  } = useArquivosGerenciais(pastaAtualId);

  // Get all folders for move dialog (from root level)
  const { pastas: allPastas } = usePastasGerenciais();

  const handleFolderClick = (pasta: PastaGerencial) => {
    setPastaAtualId(pasta.id);
    setBreadcrumbPath(prev => [...prev, { id: pasta.id, nome: pasta.nome }]);
  };

  const handleBreadcrumbNavigate = (pastaId: string | null) => {
    setPastaAtualId(pastaId);
    
    // Find the index of the clicked item in the breadcrumb
    const index = breadcrumbPath.findIndex(item => item.id === pastaId);
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
    
    // Cannot move a folder into itself
    if (pastaDestinoId === selectedPasta.id) {
      toast({
        title: "Erro",
        description: "Não é possível mover uma pasta para dentro dela mesma",
        variant: "destructive"
      });
      return;
    }
    
    await moverPasta.mutateAsync({ 
      id: selectedPasta.id, 
      pasta_pai_id: pastaDestinoId
    });
    setIsMoveFolderOpen(false);
    setSelectedPasta(null);
  };

  const handleMoveFile = async (pastaDestinoId: string | null) => {
    if (!selectedArquivo) return;
    
    await moverArquivo.mutateAsync({
      arquivoId: selectedArquivo.id,
      pastaId: pastaDestinoId
    });
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
          <UploadZone 
            pastaAtualId={pastaAtualId}
            pastaAtualNome={pastaAtual?.nome}
          />
        </motion.div>

        {/* Toolbar with Breadcrumb, Search and Actions */}
        <div className="glass-panel p-4 space-y-4 sticky top-[4.5rem] z-10">
          {/* Breadcrumb */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 overflow-hidden">
              {breadcrumbPath.length > 1 && (
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
                <FolderBreadcrumb 
                  path={breadcrumbPath}
                  onNavigate={handleBreadcrumbNavigate}
                />
              </div>
            </div>
            
            <Button
              onClick={() => setIsCreateFolderOpen(true)}
              size="sm"
              className="flex-shrink-0"
            >
              <FolderPlus className="h-4 w-4 mr-2" />
              Nova Pasta
            </Button>
          </div>
          
          {/* Search Bar */}
          <div className="flex items-center space-x-3">
            <Search className="w-5 h-5 text-muted-foreground ml-2" />
            <Input
              placeholder="Pesquisar arquivos por nome, tags ou conteúdo do resumo..."
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
            pastas={pastas}
            isLoading={isLoadingPastas}
            onFolderClick={handleFolderClick}
            onEditFolder={onEditFolderClick}
            onDeleteFolder={onDeleteFolderClick}
            onMoveFolder={onMoveFolderClick}
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
            onFileClick={(arquivo, url) => setSelectedFile({ arquivo, url })}
            onDeleteFile={handleDeleteFile}
            onMoveFile={onMoveFileClick}
          />
        </motion.div>

      </div>

      {/* File Viewer & Chat Dialog */}
      <FileViewer 
        arquivo={selectedFile?.arquivo || null}
        url={selectedFile?.url || null}
        open={!!selectedFile}
        onOpenChange={(open) => !open && setSelectedFile(null)}
      />

      {/* Create Folder Dialog */}
      <CreateFolderDialog
        isOpen={isCreateFolderOpen}
        onOpenChange={setIsCreateFolderOpen}
        onSubmit={handleCreateFolder}
        isLoading={criarPasta.isPending}
      />

      {/* Edit Folder Dialog */}
      <EditFolderDialog
        pasta={selectedPasta}
        isOpen={isEditFolderOpen}
        onOpenChange={setIsEditFolderOpen}
        onSubmit={handleEditFolder}
        isLoading={atualizarPasta.isPending}
      />

      {/* Delete Folder Dialog */}
      <DeleteFolderDialog
        pasta={selectedPasta}
        isOpen={isDeleteFolderOpen}
        onOpenChange={setIsDeleteFolderOpen}
        onConfirm={handleDeleteFolder}
        isLoading={excluirPasta.isPending}
      />

      {/* Move Folder Dialog */}
      <MoveItemDialog
        itemType="pasta"
        itemName={selectedPasta?.nome || ""}
        currentPastaId={pastaAtualId}
        pastas={allPastas}
        isOpen={isMoveFolderOpen}
        onOpenChange={setIsMoveFolderOpen}
        onMove={handleMoveFolder}
        isLoading={moverPasta.isPending}
      />

      {/* Move File Dialog */}
      <MoveItemDialog
        itemType="arquivo"
        itemName={selectedArquivo?.nome_arquivo || ""}
        currentPastaId={pastaAtualId}
        pastas={allPastas}
        isOpen={isMoveFileOpen}
        onOpenChange={setIsMoveFileOpen}
        onMove={handleMoveFile}
        isLoading={moverArquivo.isPending}
      />

      {/* Delete File Dialog */}
      <DeleteFileDialog
        arquivo={selectedArquivo}
        isOpen={isDeleteFileOpen}
        onOpenChange={setIsDeleteFileOpen}
        onConfirm={confirmDeleteFile}
        isLoading={deleteArquivo.isPending}
      />
      
    </PageLayout>
  );
}
