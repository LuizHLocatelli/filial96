
import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, FolderOpen, X, MoreHorizontal } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useFolders } from "@/hooks/useFolders";

interface PromotionalCardProps {
  id: string;
  title: string;
  imageUrl: string;
  folderId: string | null;
  onDelete: () => void;
  onMoveToFolder: (cardId: string, folderId: string | null) => void;
  sector: "furniture" | "fashion";
}

export function PromotionalCard({ 
  id, 
  title, 
  imageUrl, 
  folderId, 
  onDelete,
  onMoveToFolder,
  sector
}: PromotionalCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const { folders } = useFolders(sector);
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const currentFolder = folders.find(f => f.id === folderId);

  return (
    <>
      <Card 
        ref={setNodeRef} 
        style={style} 
        className="cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <CardContent className="p-3">
          <div 
            className="aspect-[3/2] relative rounded-md overflow-hidden bg-muted"
            onClick={() => setIsDialogOpen(true)}
          >
            <img 
              src={imageUrl} 
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between p-3 pt-0">
          <div className="truncate text-sm font-medium">{title}</div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Opções</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
                Visualizar
              </DropdownMenuItem>
              
              <DropdownMenuLabel>Pastas</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {folderId && (
                <DropdownMenuItem onClick={() => onMoveToFolder(id, null)}>
                  <X className="mr-2 h-4 w-4" />
                  Remover da pasta
                </DropdownMenuItem>
              )}
              
              {folders.length > 0 && (
                folders
                  .filter(folder => folder.id !== folderId)
                  .map(folder => (
                    <DropdownMenuItem 
                      key={folder.id}
                      onClick={() => onMoveToFolder(id, folder.id)}
                    >
                      <FolderOpen className="mr-2 h-4 w-4" />
                      Mover para {folder.name}
                    </DropdownMenuItem>
                  ))
              )}
              
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardFooter>
      </Card>

      {/* Dialog de visualização */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center">
            <div className="w-full max-h-[70vh] overflow-hidden rounded-md">
              <img 
                src={imageUrl} 
                alt={title}
                className="w-full h-full object-contain"
              />
            </div>
            {currentFolder && (
              <div className="mt-2 text-sm text-muted-foreground">
                Pasta: {currentFolder.name}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir card promocional?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O card será permanentemente excluído do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
