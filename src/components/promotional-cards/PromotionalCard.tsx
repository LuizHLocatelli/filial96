
import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { useFolders } from "@/hooks/useFolders";
import { cn } from "@/lib/utils";
import {
  CardViewDialog,
  CardEditDialog,
  CardDeleteDialog,
  CardDropdownMenu
} from "./card";

interface PromotionalCardProps {
  id: string;
  title: string;
  code?: string;
  promotionDate?: string;
  imageUrl: string;
  folderId: string | null;
  onDelete: (id: string) => Promise<boolean>;
  onMoveToFolder: (cardId: string, folderId: string | null) => Promise<boolean>;
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

  const handleDeleteConfirm = async () => {
    setIsLoading(true);
    try {
      const success = await onDelete(id);
      if (success) {
        setIsDeleteDialogOpen(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveToFolder = async (newFolderId: string | null) => {
    setIsLoading(true);
    try {
      const success = await onMoveToFolder(id, newFolderId);
      if (success) {
        toast({
          title: "Sucesso",
          description: newFolderId ? "Card movido para a pasta com sucesso" : "Card removido da pasta com sucesso"
        });
      }
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
          <CardDropdownMenu 
            folderId={folderId}
            folders={folders}
            onView={() => setIsDialogOpen(true)}
            onDownload={handleDownload}
            onEdit={() => {
              setIsEditDialogOpen(true);
            }}
            onDelete={() => setIsDeleteDialogOpen(true)}
            onMoveToFolder={handleMoveToFolder}
            isLoading={isLoading}
            isMobile={isMobile}
          />
        </CardFooter>
      </Card>

      {/* Dialog de visualização */}
      <CardViewDialog 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={title}
        imageUrl={imageUrl}
        code={code}
        promotionDate={promotionDate}
        currentFolder={currentFolder}
        isMobile={isMobile}
      />

      {/* Dialog de edição */}
      <CardEditDialog 
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        id={id}
        title={title}
        isMobile={isMobile}
      />

      {/* Dialog de confirmação de exclusão */}
      <CardDeleteDialog 
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        isLoading={isLoading}
        isMobile={isMobile}
      />
    </>
  );
}
