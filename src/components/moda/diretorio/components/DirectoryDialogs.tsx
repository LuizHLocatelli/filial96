
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
  const { getMobileDialogProps, getMobileButtonProps } = useMobileDialog();
  
  return (
    <>
      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="w-[calc(100%-2rem)] max-w-[calc(100%-2rem)] sm:max-w-[500px] mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg">Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Tem certeza que deseja excluir o arquivo "{selectedFile?.name}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col gap-2 sm:flex-row sm:gap-0">
            <AlertDialogCancel {...getMobileButtonProps()}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={onDeleteFile}
              className="bg-red-600 hover:bg-red-700"
              {...getMobileButtonProps()}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de visualização */}
      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent {...getMobileDialogProps("6xl")} className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">{selectedFile?.name}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 max-h-[70vh] overflow-y-auto">
            {selectedFile?.file_type.startsWith('image/') ? (
              <img 
                src={selectedFile.file_url} 
                alt={selectedFile.name}
                className="max-w-full h-auto rounded-lg object-contain"
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">
                  Visualização não disponível para este tipo de arquivo.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
