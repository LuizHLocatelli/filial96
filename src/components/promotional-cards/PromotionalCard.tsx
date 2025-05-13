
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
import { cn } from "@/lib/utils";

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
  isMobile?: boolean;
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
  sector,
  isMobile
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
      <Card className={cn(isMobile && "border-[0.5px]")}>
        <CardContent className={cn("p-2", !isMobile && "p-3")}>
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
        <CardFooter className={cn("flex justify-between p-2 pt-0", !isMobile && "p-3 pt-0")}>
          <div className="truncate text-xs sm:text-sm font-medium max-w-[70%]">{title}</div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 ml-auto">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={cn(isMobile && "w-48")}>
              <DropdownMenuLabel className={cn(isMobile && "text-xs")}>Opções</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsDialogOpen(true)} className={cn(isMobile && "text-xs")}>
                Visualizar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownload} className={cn(isMobile && "text-xs")}>
                <Download className="mr-2 h-3.5 w-3.5" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setIsEditDialogOpen(true);
                setEditedTitle(title);
              }} className={cn(isMobile && "text-xs")}>
                <Pencil className="mr-2 h-3.5 w-3.5" />
                Editar
              </DropdownMenuItem>
              
              <DropdownMenuLabel className={cn(isMobile && "text-xs")}>Pastas</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {folderId && (
                <DropdownMenuItem onClick={() => onMoveToFolder(id, null)} className={cn(isMobile && "text-xs")}>
                  <X className="mr-2 h-3.5 w-3.5" />
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
                      className={cn(isMobile && "text-xs")}
                    >
                      <FolderOpen className="mr-2 h-3.5 w-3.5" />
                      Mover para {folder.name}
                    </DropdownMenuItem>
                  ))
              )}
              
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className={cn("text-red-600", isMobile && "text-xs")}
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardFooter>
      </Card>

      {/* Dialog de visualização */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md max-w-[90vw] p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">{title}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center">
            <div className="w-full max-h-[60vh] overflow-hidden rounded-md">
              <img 
                src={imageUrl} 
                alt={title}
                className="w-full h-full object-contain"
              />
            </div>
            
            <div className="w-full mt-4 space-y-2">
              {code && (
                <div className="text-xs sm:text-sm">
                  <span className="font-semibold">Código:</span> {code}
                </div>
              )}
              {promotionDate && (
                <div className="text-xs sm:text-sm">
                  <span className="font-semibold">Validade:</span> {new Date(promotionDate).toLocaleDateString('pt-BR')}
                </div>
              )}
              {currentFolder && (
                <div className="text-xs sm:text-sm">
                  <span className="font-semibold">Pasta:</span> {currentFolder.name}
                </div>
              )}
            </div>
            
            <div className="flex gap-2 mt-4 w-full justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownload}
                className="text-xs sm:text-sm h-8"
              >
                <Download className="mr-2 h-3.5 w-3.5" />
                Download
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md max-w-[90vw] p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Editar Card</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleUpdateTitle();
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="card-title" className="text-xs sm:text-sm">Título</Label>
              <Input
                id="card-title"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                placeholder="Digite o título do card"
                disabled={isLoading}
                className="text-xs sm:text-sm h-8 sm:h-10"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isLoading}
                className="text-xs sm:text-sm h-8 sm:h-10"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !editedTitle.trim()}
                className="text-xs sm:text-sm h-8 sm:h-10"
              >
                {isLoading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : "Salvar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-md p-4 sm:p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg">Excluir card promocional?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              Esta ação não pode ser desfeita. O card será permanentemente excluído do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs sm:text-sm h-8 sm:h-10">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="text-xs sm:text-sm h-8 sm:h-10">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
