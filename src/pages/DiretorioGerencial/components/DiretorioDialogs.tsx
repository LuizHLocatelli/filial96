import { CreateFolderDialog } from "./CreateFolderDialog";
import { EditFolderDialog } from "./EditFolderDialog";
import { DeleteFolderDialog } from "./DeleteFolderDialog";
import { DeleteFileDialog } from "./DeleteFileDialog";
import { MoveItemDialog } from "./MoveItemDialog";
import { FileViewer } from "./FileViewer";
import { ArquivoGerencial, PastaGerencial } from "../types";

interface DiretorioDialogsProps {
  // File viewer
  selectedFile: { arquivo: ArquivoGerencial; url: string } | null;
  setSelectedFile: (file: { arquivo: ArquivoGerencial; url: string } | null) => void;

  // Create folder
  isCreateFolderOpen: boolean;
  setIsCreateFolderOpen: (open: boolean) => void;
  handleCreateFolder: (nome: string) => Promise<void>;
  isCreatingFolder: boolean;

  // Edit folder
  isEditFolderOpen: boolean;
  setIsEditFolderOpen: (open: boolean) => void;
  handleEditFolder: (id: string, nome: string) => Promise<void>;
  isEditingFolder: boolean;
  selectedPasta: PastaGerencial | null;

  // Delete folder
  isDeleteFolderOpen: boolean;
  setIsDeleteFolderOpen: (open: boolean) => void;
  handleDeleteFolder: (id: string) => Promise<void>;
  isDeletingFolder: boolean;

  // Move folder
  isMoveFolderOpen: boolean;
  setIsMoveFolderOpen: (open: boolean) => void;
  handleMoveFolder: (pastaDestinoId: string | null) => Promise<void>;
  isMovingFolder: boolean;

  // Move file
  isMoveFileOpen: boolean;
  setIsMoveFileOpen: (open: boolean) => void;
  handleMoveFile: (pastaDestinoId: string | null) => Promise<void>;
  isMovingFile: boolean;
  selectedArquivo: ArquivoGerencial | null;

  // Delete file
  isDeleteFileOpen: boolean;
  setIsDeleteFileOpen: (open: boolean) => void;
  confirmDeleteFile: (arquivo: ArquivoGerencial) => Promise<void>;
  isDeletingFile: boolean;

  // Shared
  pastaAtualId: string | null;
  allPastas: PastaGerencial[] | undefined;
}

export function DiretorioDialogs(props: DiretorioDialogsProps) {
  return (
    <>
      <FileViewer
        arquivo={props.selectedFile?.arquivo || null}
        url={props.selectedFile?.url || null}
        open={!!props.selectedFile}
        onOpenChange={(open) => !open && props.setSelectedFile(null)}
      />

      <CreateFolderDialog
        isOpen={props.isCreateFolderOpen}
        onOpenChange={props.setIsCreateFolderOpen}
        onSubmit={props.handleCreateFolder}
        isLoading={props.isCreatingFolder}
      />

      <EditFolderDialog
        pasta={props.selectedPasta}
        isOpen={props.isEditFolderOpen}
        onOpenChange={props.setIsEditFolderOpen}
        onSubmit={props.handleEditFolder}
        isLoading={props.isEditingFolder}
      />

      <DeleteFolderDialog
        pasta={props.selectedPasta}
        isOpen={props.isDeleteFolderOpen}
        onOpenChange={props.setIsDeleteFolderOpen}
        onConfirm={props.handleDeleteFolder}
        isLoading={props.isDeletingFolder}
      />

      <MoveItemDialog
        itemType="pasta"
        itemName={props.selectedPasta?.nome || ""}
        currentPastaId={props.pastaAtualId}
        pastas={props.allPastas}
        isOpen={props.isMoveFolderOpen}
        onOpenChange={props.setIsMoveFolderOpen}
        onMove={props.handleMoveFolder}
        isLoading={props.isMovingFolder}
      />

      <MoveItemDialog
        itemType="arquivo"
        itemName={props.selectedArquivo?.nome_arquivo || ""}
        currentPastaId={props.pastaAtualId}
        pastas={props.allPastas}
        isOpen={props.isMoveFileOpen}
        onOpenChange={props.setIsMoveFileOpen}
        onMove={props.handleMoveFile}
        isLoading={props.isMovingFile}
      />

      <DeleteFileDialog
        arquivo={props.selectedArquivo}
        isOpen={props.isDeleteFileOpen}
        onOpenChange={props.setIsDeleteFileOpen}
        onConfirm={props.confirmDeleteFile}
        isLoading={props.isDeletingFile}
      />
    </>
  );
}
