import { useState } from "react";
import { CardItem } from "@/hooks/useCardOperations";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Copy, Edit3, Trash2, Download, Smartphone, ExternalLink, QrCode } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CardViewDialog } from "./CardViewDialog";
import { CardEditDialog } from "./CardEditDialog";
import { CardDeleteDialog } from "./CardDeleteDialog";
import { getAspectRatioClass, downloadCardImage, shareCardWhatsApp } from "@/utils/cardUtils";
import { motion } from "framer-motion";

interface PromotionalCardProps {
  id: string;
  title: string;
  code?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  imageUrl: string;
  folderId: string | null;
  folderName?: string | null;
  aspectRatio?: "1:1" | "3:4" | "4:5";
  onDelete: (id: string) => Promise<boolean>;
  onMoveToFolder: (cardId: string, folderId: string | null) => Promise<boolean>;
  onUpdate: (id: string, updates: Partial<CardItem>) => Promise<boolean>;
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
  folderName,
  aspectRatio = "4:5",
  onDelete,
  onMoveToFolder,
  onUpdate,
  sector,
  isMobile: isMobileProp
}: PromotionalCardProps) {
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeletingCard, setIsDeletingCard] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const isMobile = useIsMobile();

  const aspectClass = getAspectRatioClass(aspectRatio);

  const formatDateForDisplay = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      console.error("Error formatting date:", error);
      return '';
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(code || '')
      .then(() => {
        toast.success("Copiado!", { description: "Código copiado para a área de transferência." });
      })
      .catch(err => {
        console.error("Failed to copy text: ", err);
        toast.error("Erro", { description: "Falha ao copiar o código." });
      });
  };

  const handleDeleteCard = async () => {
    setIsDeletingCard(true);
    try {
      await onDelete(id);
    } catch (error) {
      console.error("Error deleting card:", error);
    } finally {
      setIsDeletingCard(false);
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await downloadCardImage(imageUrl, title);
      toast.success("Download iniciado!", { description: "A imagem do card está sendo baixada." });
    } catch (error) {
      console.error("Erro ao baixar imagem:", error);
      toast.error("Erro no download", { description: "Não foi possível baixar a imagem." });
    }
  };

  const handleShareWhatsApp = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await shareCardWhatsApp(imageUrl, title, code);
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
      const message = encodeURIComponent(
        `*${title}*\n\n` +
        (code ? `Código: ${code}\n\n` : '') +
        `Veja o card: ${imageUrl}`
      );
      window.open(`https://wa.me/?text=${message}`, '_blank');
    }
  };

  const handleCardClick = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsViewDialogOpen(true);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const isExpired = endDate ? new Date(endDate) < new Date() : false;
  const isUpcoming = startDate ? new Date(startDate) > new Date() : false;

  return (
    <>
      <Card 
        className={cn(
          "group relative overflow-hidden bg-card border-border",
          "transition-all duration-300",
          "hover:shadow-lg hover:border-primary/20",
          isMobile ? "rounded-2xl" : "rounded-xl"
        )}
      >
        <div 
          className={cn(
            "relative overflow-hidden cursor-pointer",
            aspectClass
          )}
          onClick={(e) => handleCardClick(e)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleCardClick();
            }
          }}
          aria-label={`Visualizar card ${title}`}
        >
          {!isImageLoaded && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}
          <img
            src={imageUrl}
            alt={title}
            className={cn(
              "object-cover w-full h-full transition-all duration-500",
              "group-hover:scale-110",
              isImageLoaded ? "opacity-100" : "opacity-0"
            )}
            width={500}
            height={300}
            style={{ objectFit: "cover" }}
            onLoad={() => setIsImageLoaded(true)}
          />
          
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
              isMobile && "opacity-100"
            )}
          >
            <div className="absolute inset-0 flex flex-col justify-between p-3">
              <div className="flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={handleMenuClick}>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-white/90 hover:bg-white text-gray-900 shadow-lg border-0"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Abrir menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => setIsViewDialogOpen(true)}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      <span>Visualizar</span>
                    </DropdownMenuItem>
                    {code && (
                      <DropdownMenuItem onClick={handleCopyToClipboard}>
                        <Copy className="mr-2 h-4 w-4" />
                        <span>Copiar Código</span>
                      </DropdownMenuItem>
                    )}
                    {code && (
                      <DropdownMenuItem onClick={handleCopyToClipboard}>
                        <QrCode className="mr-2 h-4 w-4" />
                        <span>Ver QR Code</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                      <Edit3 className="mr-2 h-4 w-4" />
                      <span>Editar</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive focus:text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Excluir</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="flex gap-2 justify-center">
                <Button
                  size="icon"
                  className="h-10 w-10 rounded-full bg-white/90 hover:bg-white text-gray-900 shadow-lg border-0 transition-transform hover:scale-110"
                  onClick={handleDownload}
                  title="Baixar imagem"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  className="h-10 w-10 rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white shadow-lg border-0 transition-transform hover:scale-110"
                  onClick={handleShareWhatsApp}
                  title="Compartilhar no WhatsApp"
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {(isExpired || isUpcoming) && (
            <div className="absolute top-2 left-2">
              <span className={cn(
                "px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide",
                isExpired 
                  ? "bg-red-500/90 text-white" 
                  : "bg-amber-500/90 text-white"
              )}>
                {isExpired ? "Expirado" : "Em breve"}
              </span>
            </div>
          )}
        </div>

        <div 
          className="p-3 space-y-2 cursor-pointer"
          onClick={(e) => handleCardClick(e)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleCardClick();
            }
          }}
          aria-label={`Visualizar card ${title}`}
        >
          <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          
          <div className="space-y-1.5">
            {code && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Código:</span>
                <span className="font-mono bg-muted px-2 py-0.5 rounded text-xs text-foreground flex-1 truncate">
                  {code}
                </span>
              </div>
            )}
            
            {(startDate || endDate) && (
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className="shrink-0">
                  {startDate && formatDateForDisplay(startDate)}
                  {startDate && endDate && ' - '}
                  {endDate && formatDateForDisplay(endDate)}
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>

      <CardViewDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        title={title}
        imageUrl={imageUrl}
        code={code || ''}
        startDate={startDate ? formatDateForDisplay(startDate) : ''}
        endDate={endDate ? formatDateForDisplay(endDate) : ''}
        currentFolder={{
          id: folderId || '',
          name: folderName || 'Sem Pasta'
        }}
        aspectRatio={aspectRatio}
        isMobile={isMobileProp || false}
      />

      <CardEditDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        id={id}
        title={title}
        code={code}
        startDate={startDate}
        endDate={endDate}
        isMobile={isMobileProp || false}
        onSuccess={async (updates) => {
          const result = await onUpdate(id, updates);
          return result;
        }}
      />

      <CardDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteCard}
        isLoading={isDeletingCard}
      />
    </>
  );
}
