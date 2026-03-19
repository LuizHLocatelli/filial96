import { createContext, useContext } from "react";
import type { PastaComCounts, ArquivoGerencial, BreadcrumbItem, FileWithUrl, DialogState, FolderFormData, UploadItem } from "../types";
import type { ViewTab } from "../constants";

export interface DiretorioContextValue {
  currentFolderId: string | null;
  setCurrentFolderId: (id: string | null) => void;

  pastas: PastaComCounts[] | undefined;
  isLoadingPastas: boolean;

  arquivos: ArquivoGerencial[] | undefined;
  isLoadingArquivos: boolean;

  allPastas: PastaComCounts[] | undefined;

  breadcrumb: BreadcrumbItem[];
  setBreadcrumb: (path: BreadcrumbItem[]) => void;

  uploads: UploadItem[];
  uploadFiles: (files: { file: File; customName?: string }[], pastaId: string | null) => Promise<string[]>;
  clearUploads: () => void;

  dialogState: DialogState;
  openCreateFolderDialog: () => void;
  openEditFolderDialog: (pasta: PastaComCounts) => void;
  openDeleteFolderDialog: (pasta: PastaComCounts) => void;
  openMoveFolderDialog: (pasta: PastaComCounts) => void;
  openMoveFileDialog: (arquivo: ArquivoGerencial) => void;
  closeDialog: () => void;

  selectedFile: FileWithUrl | null;
  setSelectedFile: (file: FileWithUrl | null) => void;

  viewTab: ViewTab;
  setViewTab: (tab: ViewTab) => void;

  handleCreateFolder: (data: FolderFormData) => Promise<void>;
  handleUpdateFolder: (id: string, data: FolderFormData) => Promise<void>;
  handleDeleteFolder: (id: string) => Promise<void>;
  handleMoveFolder: (pastaId: string, targetPastaId: string | null) => Promise<void>;
  handleDeleteFile: (arquivo: ArquivoGerencial) => Promise<void>;
  handleMoveFile: (arquivoId: string, targetPastaId: string | null) => Promise<void>;

  isCreatingFolder: boolean;
  isUpdatingFolder: boolean;
  isDeletingFolder: boolean;
  isMovingFolder: boolean;
  isMovingFile: boolean;
  isDeletingFile: boolean;
}

export const DiretorioContext = createContext<DiretorioContextValue | null>(null);

export function useDiretorio() {
  const context = useContext(DiretorioContext);
  if (!context) {
    throw new Error("useDiretorio must be used within a DiretorioProvider");
  }
  return context;
}
