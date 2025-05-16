
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
import { Calendar, Hash } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PromotionalCardProps {
  id: string;
  title: string;
  code?: string;
  promotionDate?: string;
  imageUrl: string;
  folderId: string | null;
  onDelete: (id: string) => Promise<boolean>;
  onMoveToFolder: (cardId: string, folderId: string | null) => Promise<boolean>;
  sector: "furniture" | "fashion" | "loan" | "service";
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

  // Format date for display
  const formattedDate = promotionDate ? new Date(promotionDate).toLocaleDateString('pt-BR') : null;

  return (
    <>
      <Card className={cn(
        "overflow-hidden transition-all duration-200 hover:shadow-md group",
        isMobile && "border-[0.5px]"
      )}>
        <CardContent className={cn("p-0")}>
          <div 
            className="aspect-[3/2] relative rounded-t-md overflow-hidden bg-muted cursor-pointer"
            onClick={() => setIsDialogOpen(true)}
          >
            <img 
              src={imageUrl} 
              alt={title}
              className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
            />
            {(code || promotionDate) && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white p-2 text-xs">
                <div className="flex items-center gap-2">
                  {code && (
                    <div className="flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      <span className="truncate">{code}</span>
                    </div>
                  )}
                  {formattedDate && (
                    <div className="flex items-center gap-1 ml-auto">
                      <Calendar className="h-3 w-3" />
                      <span>{formattedDate}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className={cn(
          "flex justify-between p-2 bg-card border-t border-border",
          !isMobile && "p-3"
        )}>
          <div className="flex flex-col gap-1 truncate max-w-[70%]">
            <p className="truncate text-xs sm:text-sm font-medium">{title}</p>
            {currentFolder && (
              <Badge variant="outline" className="text-[10px] w-fit px-1 py-0 h-5">
                {currentFolder.name}
              </Badge>
            )}
          </div>
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
