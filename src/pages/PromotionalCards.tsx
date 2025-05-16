
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FoldersList } from "@/components/promotional-cards/FoldersList";
import { CardGallery } from "@/components/promotional-cards/CardGallery";
import { CreateFolderDialog } from "@/components/promotional-cards/CreateFolderDialog";
import { UploadCardDialog } from "@/components/promotional-cards/UploadCardDialog";
import { SectorSelector } from "@/components/promotional-cards/SectorSelector";
import { useIsMobile } from "@/hooks/use-mobile";

export default function PromotionalCards() {
  const [selectedSector, setSelectedSector] = useState<"furniture" | "fashion" | "loan" | "service">("furniture");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isUploadCardOpen, setIsUploadCardOpen] = useState(false);
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-4 pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Cards Promocionais</h2>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Gerencie cards promocionais para diferentes setores
          </p>
        </div>
      </div>

      <SectorSelector 
        selectedSector={selectedSector} 
        onSectorChange={(value) => {
          setSelectedSector(value as "furniture" | "fashion" | "loan" | "service");
          setSelectedFolderId(null); // Reset folder selection when changing sector
        }} 
      />

      {/* Conteúdo para o setor selecionado */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Sidebar com pastas */}
          <Card className="w-full md:w-60 h-fit">
            <CardContent className={cn("p-3", !isMobile && "p-4")}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-sm sm:text-base">Pastas</h3>
                <Button 
                  size={isMobile ? "sm" : "default"} 
                  variant="outline"
                  onClick={() => setIsCreateFolderOpen(true)}
                  className="h-8 text-xs sm:text-sm px-2 sm:px-3"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Nova
                </Button>
              </div>
              
              <FoldersList 
                sector={selectedSector}
                selectedFolderId={selectedFolderId}
                onSelectFolder={setSelectedFolderId}
              />
            </CardContent>
          </Card>

          {/* Galeria principal */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-sm sm:text-base">Cards Promocionais</h3>
              <Button
                onClick={() => setIsUploadCardOpen(true)}
                className="h-8 text-xs sm:text-sm px-2 sm:px-3"
                size={isMobile ? "sm" : "default"}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
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

// Import cn at the top
import { cn } from "@/lib/utils";
