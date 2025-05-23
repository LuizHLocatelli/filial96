
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";
import { FoldersList } from "@/components/promotional-cards/FoldersList";
import { CardGallery } from "@/components/promotional-cards/CardGallery";
import { CreateFolderDialog } from "@/components/promotional-cards/CreateFolderDialog";
import { UploadCardDialog } from "@/components/promotional-cards/UploadCardDialog";
import { SectorSelector } from "@/components/promotional-cards/SectorSelector";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export default function PromotionalCards() {
  const [selectedSector, setSelectedSector] = useState<"furniture" | "fashion" | "loan" | "service">("furniture");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isUploadCardOpen, setIsUploadCardOpen] = useState(false);
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-6 pb-6">
      {/* Header com gradiente */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 sm:p-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Cards Promocionais
              </h1>
            </div>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl">
              Gerencie e organize seus materiais promocionais de forma inteligente e eficiente
            </p>
          </div>
        </div>
      </div>

      {/* Seletor de setor */}
      <SectorSelector 
        selectedSector={selectedSector} 
        onSectorChange={(value) => {
          setSelectedSector(value as "furniture" | "fashion" | "loan" | "service");
          setSelectedFolderId(null);
        }} 
      />

      {/* Layout principal */}
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar de pastas */}
          <Card className="w-full lg:w-80 bg-gradient-to-br from-background to-muted/30 border-2 border-border/50">
            <CardContent className={cn("p-4", !isMobile && "p-6")}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2">
                  📁 Pastas
                </h3>
                <Button 
                  size={isMobile ? "sm" : "default"} 
                  variant="outline"
                  onClick={() => setIsCreateFolderOpen(true)}
                  className="h-8 sm:h-10 text-xs sm:text-sm px-3 sm:px-4 bg-primary/5 hover:bg-primary/10 border-primary/20"
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Nova Pasta
                </Button>
              </div>
              
              <FoldersList 
                sector={selectedSector}
                selectedFolderId={selectedFolderId}
                onSelectFolder={setSelectedFolderId}
              />
            </CardContent>
          </Card>

          {/* Área principal dos cards */}
          <div className="flex-1 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2">
                🎨 Galeria de Cards
              </h3>
              <Button
                onClick={() => setIsUploadCardOpen(true)}
                className="h-8 sm:h-10 text-xs sm:text-sm px-3 sm:px-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25"
                size={isMobile ? "sm" : "default"}
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Novo Card
              </Button>
            </div>

            <CardGallery 
              sector={selectedSector}
              folderId={selectedFolderId}
            />
          </div>
        </div>
      </div>

      {/* Diálogos */}
      <CreateFolderDialog
        open={isCreateFolderOpen}
        onOpenChange={setIsCreateFolderOpen}
        sector={selectedSector}
      />

      <UploadCardDialog
        open={isUploadCardOpen}
        onOpenChange={setIsUploadCardOpen}
        sector={selectedSector}
        folderId={selectedFolderId}
      />
    </div>
  );
}
