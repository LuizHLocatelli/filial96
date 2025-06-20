import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle 
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Eye, Trash2 } from 'lucide-react';
import { DirectoryFile, DirectoryCategory } from '../types';
import { useMobileDialog } from '@/hooks/useMobileDialog';

interface DirectoryDialogsProps {
  categoryDialogOpen: boolean;
  setCategoryDialogOpen: (open: boolean) => void;
  onAddCategory: (name: string, color: string, description?: string) => void;
  
  editCategoryDialogOpen: boolean;
  setEditCategoryDialogOpen: (open: boolean) => void;
  onUpdateCategory: (id: string, name: string, color: string, description?: string) => void;
  selectedCategory: DirectoryCategory | null;
  
  fileDialogOpen: boolean;
  setFileDialogOpen: (open: boolean) => void;
  onUpdateFile: (id: string, name: string, description?: string, categoryId?: string) => void;
  
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
  onDeleteFile: () => void;
  
  viewerOpen: boolean;
  setViewerOpen: (open: boolean) => void;
  
  selectedFile: DirectoryFile | null;
  categories: DirectoryCategory[];
}

export function DirectoryDialogs({
  deleteDialogOpen,
  setDeleteDialogOpen,
  onDeleteFile,
  viewerOpen,
  setViewerOpen,
  selectedFile
}: DirectoryDialogsProps) {
  const { getMobileDialogProps, getMobileAlertDialogProps, getMobileFooterProps } = useMobileDialog();
  
  return (
    <>
      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent {...getMobileAlertDialogProps()}>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Trash2 className="h-4 w-4 text-red-500" />
              Confirmar exclusão
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Tem certeza que deseja excluir o arquivo "{selectedFile?.name}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter {...getMobileFooterProps()}>
            <AlertDialogCancel>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={onDeleteFile}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de visualização */}
      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent {...getMobileDialogProps("default")}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center">
                <Eye className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              {selectedFile?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedFile?.file_type.startsWith('image/') ? (
              <div className="w-full border rounded-lg bg-muted/10 p-4">
                <img 
                  src={selectedFile.file_url} 
                  alt={selectedFile.name}
                  className="max-w-full max-h-[60vh] object-contain rounded-lg mx-auto"
                />
              </div>
            ) : (
              <div className="text-center py-16 border-2 border-dashed border-muted rounded-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-muted-foreground mb-2">
                  Visualização não disponível para este tipo de arquivo.
                </p>
                <p className="text-sm text-muted-foreground">
                  Faça o download para visualizar o arquivo.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
