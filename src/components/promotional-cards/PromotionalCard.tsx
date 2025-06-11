import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { toast } from "@/components/ui/use-toast";
import { useFolders } from "@/hooks/useFolders";
import { cn } from "@/lib/utils";
import {
  CardViewDialog,
  CardEditDialog,
  CardDeleteDialog,
  CardDropdownMenu
} from "./card";
import { Calendar, Hash, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CountdownTimer } from "./CountdownTimer";

interface PromotionalCardProps {
  id: string;
  title: string;
  code?: string;
  startDate?: string | null;
  endDate?: string | null;
  imageUrl: string;
  folderId: string | null;
  onDelete: (id: string) => Promise<boolean>;
  onMoveToFolder: (cardId: string, folderId: string | null) => Promise<boolean>;
  onUpdate: (id: string, newTitle: string) => void;
  sector: "furniture" | "fashion" | "loan" | "service";
  isMobile?: boolean;
}

export function PromotionalCard({ 
  id, 
  title, 
  code,
  startDate,
  endDate,
  imageUrl, 
  folderId, 
  onDelete,
  onMoveToFolder,
  onUpdate,
  sector,
  isMobile
}: PromotionalCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { folders } = useFolders(sector);
  
  const currentFolder = folders.find(f => f.id === folderId);

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
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

  const getStatus = (): { text: string; color: string; icon: React.ElementType } => {
    const now = new Date();
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (end && end < now) {
      return { text: "Expirado", color: "bg-red-500 dark:bg-red-800 text-white dark:text-red-100", icon: Clock };
    }
    if (start && start > now) {
      return { text: "Agendado", color: "bg-blue-500 dark:bg-blue-800 text-white dark:text-blue-100", icon: Clock };
    }
    if (start && end && start <= now && end >= now) {
      return { text: "Ativo", color: "bg-green-500 dark:bg-green-800 text-white dark:text-green-100", icon: Clock };
    }
    return { text: "Válido", color: "bg-gray-500 dark:bg-gray-700 text-white dark:text-gray-200", icon: Clock }; // Default/fallback
  };

  const status = getStatus();
  const formattedEndDate = endDate ? new Date(endDate).toLocaleDateString('pt-BR') : null;

  return (
    <>
      <Card className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 group bg-gradient-to-br from-background to-muted/30 border-2 border-border/50 hover:border-primary/30",
        isMobile && "border-[1px]"
      )}>
        <CardContent className="p-0">
          <AspectRatio ratio={4/5}>
            <div 
              className="relative w-full h-full rounded-t-lg overflow-hidden bg-gradient-to-br from-muted to-muted/50 cursor-pointer group"
              onClick={() => setIsDialogOpen(true)}
            >
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/80 to-muted/60 animate-pulse" />
              )}
              
              <img 
                src={imageUrl} 
                alt={title}
                onLoad={() => setImageLoaded(true)}
                className={cn(
                  "w-full h-full object-cover transition-all duration-500 group-hover:scale-110",
                  !imageLoaded && "opacity-0"
                )}
              />
              
              {/* Overlay com informações */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-between p-2">
                {/* Top Section */}
                <div className="flex justify-start">
                  {code && (
                    <div className="flex items-center gap-1 bg-black/40 rounded-full px-2 py-1 backdrop-blur-sm min-w-0 text-white">
                      <Hash className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate font-medium block text-xs">{code}</span>
                    </div>
                  )}
                </div>

                {/* Bottom Section */}
                <div className="flex w-full flex-wrap items-end justify-between gap-2 text-xs text-white">
                  {/* Status Badge */}
                  <div className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur-sm", status.color)}>
                    <status.icon className="h-3.5 w-3.5" />
                    <span>{status.text}</span>
                  </div>
                  
                  {/* Timer/End Date Badge */}
                  <div className="flex flex-wrap justify-end gap-2">
                    {status.text === "Ativo" && endDate ? (
                      <CountdownTimer endDate={endDate} isMobile={isMobile} />
                    ) : (
                      formattedEndDate && (
                        <div className="flex items-center gap-1 bg-black/40 rounded-full px-2 py-1 backdrop-blur-sm min-w-0">
                          <Calendar className="h-3 w-3 flex-shrink-0" />
                          <span className="text-xs truncate block">{formattedEndDate}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </AspectRatio>
        </CardContent>
        
        <CardFooter className={cn(
          "flex justify-between items-center p-3 bg-gradient-to-r from-background to-muted/20 border-t border-border/50",
          !isMobile && "p-4"
        )}>
          <div className="flex flex-col gap-1.5 truncate flex-1 min-w-0">
            <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
              {title}
            </p>
            {currentFolder && (
              <Badge 
                variant="outline" 
                className="text-[10px] w-fit px-2 py-0.5 h-5 bg-primary/10 text-primary border-primary/20"
              >
                {currentFolder.name}
              </Badge>
            )}
          </div>
          
          <CardDropdownMenu 
            folderId={folderId}
            folders={folders}
            onView={() => setIsDialogOpen(true)}
            onDownload={handleDownload}
            onEdit={() => setIsEditDialogOpen(true)}
            onDelete={() => setIsDeleteDialogOpen(true)}
            onMoveToFolder={handleMoveToFolder}
            isLoading={isLoading}
            isMobile={isMobile}
          />
        </CardFooter>
      </Card>

      {/* Dialogs permanecem iguais */}
      <CardViewDialog 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={title}
        imageUrl={imageUrl}
        code={code}
        startDate={startDate}
        endDate={endDate}
        currentFolder={currentFolder}
        isMobile={isMobile}
      />

      <CardEditDialog 
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        id={id}
        title={title}
        isMobile={isMobile}
        onSuccess={(newTitle) => onUpdate(id, newTitle)}
      />

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
