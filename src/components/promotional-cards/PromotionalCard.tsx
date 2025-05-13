
import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Trash2, 
  FolderOpen, 
  X, 
  MoreHorizontal, 
  Download,
  Pencil
} from "lucide-react";
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
import { useFolders } from "@/hooks/useFolders";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PromotionalCardProps {
  id: string;
  title: string;
  code?: string;
  promotionDate?: string;
  imageUrl: string;
  folderId: string | null;
  onDelete: () => void;
  onMoveToFolder: (cardId: string, folderId: string | null) => void;
  sector: "furniture" | "fashion";
}

export function PromotionalCard({ 
  id, 
  title, 
  code,
  promotionDate,
  imageUrl, 
  folderId, 
  onDelete,
  onMoveToFolder,
  sector
}: PromotionalCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [isLoading, setIsLoading] = useState(false);
  const { folders } = useFolders(sector);
  
  const currentFolder = folders.find(f => f.id === folderId);

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Create a download link
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${title.replace(/\s+/g, '_')}.${blob.type.split('/')[1]}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Sucesso",
        description: "Download iniciado"
      });
    } catch (error) {
      console.error('Error downloading image:', error);
      toast({
        title: "Erro",
        description: "Não foi possível fazer o download",
        variant: "destructive"
      });
    }
  };

  const handleUpdateTitle = async () => {
    if (!editedTitle.trim()) {
      toast({
        title: "Erro",
        description: "O título não pode ficar vazio",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('promotional_cards')
        .update({ title: editedTitle.trim() })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Título atualizado com sucesso"
      });
      
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating card title:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o título",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardContent className="p-3">
          <div 
            className="aspect-[3/2] relative rounded-md overflow-hidden bg-muted cursor-pointer"
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
              <DropdownMenuItem onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setIsEditDialogOpen(true);
                setEditedTitle(title);
              }}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
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
            
            <div className="w-full mt-4 space-y-2">
              {code && (
                <div className="text-sm">
                  <span className="font-semibold">Código:</span> {code}
                </div>
              )}
              {promotionDate && (
                <div className="text-sm">
                  <span className="font-semibold">Validade:</span> {new Date(promotionDate).toLocaleDateString('pt-BR')}
                </div>
              )}
              {currentFolder && (
                <div className="text-sm">
                  <span className="font-semibold">Pasta:</span> {currentFolder.name}
                </div>
              )}
            </div>
            
            <div className="flex gap-2 mt-4 w-full justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownload}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Card</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleUpdateTitle();
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="card-title">Título</Label>
              <Input
                id="card-title"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                placeholder="Digite o título do card"
                disabled={isLoading}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !editedTitle.trim()}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Salvar"}
              </Button>
            </div>
          </form>
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
