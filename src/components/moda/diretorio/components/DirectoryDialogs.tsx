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
  return (
    <>
      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o arquivo "{selectedFile?.name}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
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
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedFile?.name}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {selectedFile?.file_type.startsWith('image/') ? (
              <img 
                src={selectedFile.file_url} 
                alt={selectedFile.name}
                className="max-w-full h-auto rounded-lg"
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
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