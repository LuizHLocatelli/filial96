import { useState } from "react";
import { CardItem } from "@/hooks/useCardOperations";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Copy, Edit3, Trash2, Image, Download, Smartphone, ExternalLink } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CardViewDialog } from "./CardViewDialog";
import { CardEditDialog } from "./CardEditDialog";
import { CardDeleteDialog } from "./CardDeleteDialog";

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
  const isMobile = useIsMobile();

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case "1:1":
        return "aspect-square";
      case "3:4":
        return "aspect-[3/4]";
      case "4:5":
        return "aspect-[4/5]";
      default:
        return "aspect-[4/5]";
    }
  };

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
        toast({
          title: "Copiado!",
          description: "Código copiado para a área de transferência.",
        });
      })
      .catch(err => {
        console.error("Failed to copy text: ", err);
        toast({
          title: "Erro",
          description: "Falha ao copiar o código.",
          variant: "destructive"
        });
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
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_card.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download iniciado!",
        description: "A imagem do card está sendo baixada.",
      });
    } catch (error) {
      console.error("Erro ao baixar imagem:", error);
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar a imagem.",
        variant: "destructive",
      });
    }
  };

  const handleShareWhatsApp = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      // Faz download da imagem primeiro
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      const messageText = code 
        ? `*${title}*\n\nCódigo: ${code}`
        : `*${title}*`;
      
      // Verifica se é mobile
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobileDevice && navigator.share && navigator.canShare) {
        const file = new File([blob], `${title.replace(/[^a-zA-Z0-9]/g, '_')}_card.jpg`, { type: blob.type || 'image/jpeg' });
        
        if (navigator.canShare({ files: [file] })) {
          // Mobile: usa Web Share API nativa
          await navigator.share({
            files: [file],
            title: title,
            text: messageText,
          });
          
          toast({
            title: "Compartilhado!",
            description: "Card compartilhado com sucesso.",
          });
          return;
        }
      }
      
      // Desktop: faz download automático e abre WhatsApp Web
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_card.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Abre WhatsApp Web com mensagem preparada
      const encodedMessage = encodeURIComponent(messageText);
      const whatsappUrl = `https://web.whatsapp.com/send?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');
      
      toast({
        title: "Imagem baixada!",
        description: "A imagem foi salva. Anexe-a manualmente no WhatsApp Web.",
        duration: 5000,
      });
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
      // Fallback: apenas abre WhatsApp com link
      const message = encodeURIComponent(
        `*${title}*\n\n` +
        (code ? `Código: ${code}\n\n` : '') +
        `Veja o card: ${imageUrl}`
      );
      const whatsappUrl = `https://wa.me/?text=${message}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleCardClick = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('[PromotionalCard] Card clicked, opening view dialog for:', id);
    setIsViewDialogOpen(true);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <>
      <Card 
        className="group relative overflow-hidden bg-card border border-border shadow-sm hover:shadow-lg transition-all duration-300"
      >
        {/* Imagem do card - clicável para visualização */}
        <div 
          className={`${getAspectRatioClass()} relative overflow-hidden cursor-pointer`}
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
          <img
            src={imageUrl}
            alt={title}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            width={500}
            height={300}
            style={{ objectFit: "cover" }}
          />
          
          {/* Overlay com ações - sempre visível em mobile, hover em desktop */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 transition-all duration-300 flex flex-col justify-between p-2",
              isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botão de menu no topo */}
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={handleMenuClick}>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-white hover:bg-gray-100 text-gray-900 shadow-md border-0"
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
            
            {/* Botões de ação rápida na parte inferior */}
            <div className={cn(
              "flex gap-2 justify-center",
              isMobile ? "flex-row" : "flex-row"
            )}>
              <Button
                size="icon"
                className="h-9 w-9 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md border-0"
                onClick={handleDownload}
                title="Baixar imagem"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                className="h-9 w-9 rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white shadow-md border-0"
                onClick={handleShareWhatsApp}
                title="Compartilhar no WhatsApp"
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Indicador de clique para visualização */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-0 pointer-events-none">
            <div className="bg-black/50 rounded-full p-3">
              <ExternalLink className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Informações do card - clicável para visualização */}
        <div 
          className="p-4 space-y-2 cursor-pointer hover:bg-accent/50 transition-colors"
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
          <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2">
            {title}
          </h3>
          
          <div className="space-y-1.5 text-xs">
            {code && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Código:</span>
                <span className="font-mono bg-muted px-2 py-0.5 rounded text-foreground">
                  {code}
                </span>
              </div>
            )}
            
            {(startDate || endDate) && (
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Período:</span>
                <span className="text-foreground">
                  {startDate && formatDateForDisplay(startDate)}
                  {startDate && endDate && ' - '}
                  {endDate && formatDateForDisplay(endDate)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Dialogs */}
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
      </Card>
    </>
  );
}
