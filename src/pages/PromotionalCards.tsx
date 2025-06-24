
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
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { useCards } from "@/hooks/useCards";

export default function PromotionalCards() {
  const [selectedSector, setSelectedSector] = useState<"furniture" | "fashion" | "loan" | "service">("furniture");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isUploadCardOpen, setIsUploadCardOpen] = useState(false);
  const isMobile = useIsMobile();
  const { cards, setCards, isLoading, refetch } = useCards(selectedSector, selectedFolderId);
  
  return (
    <PageLayout spacing="normal" maxWidth="full">
      <PageHeader
        title="Cards Promocionais"
        description="Gestão completa dos materiais promocionais"
        icon={Sparkles}
        iconColor="text-primary"
        variant="default"
        breadcrumbs={[
          { label: "Hub de Produtividade", href: "/" },
          { label: "Cards Promocionais" }
        ]}
      />

      {/* Container principal com melhor organização */}
      <div className="space-y-6">
        {/* Seletor de setor */}
        <SectorSelector 
          selectedSector={selectedSector} 
          onSectorChange={(value) => {
            setSelectedSector(value as "furniture" | "fashion" | "loan" | "service");
            setSelectedFolderId(null);
          }} 
        />

        {/* Layout principal melhorado */}
        <div className={cn(
          "flex gap-6",
          isMobile ? "flex-col" : "flex-row"
        )}>
          {/* Painel de pastas */}
          <div className={cn(
            "flex-shrink-0",
            isMobile ? "w-full" : "w-80"
          )}>
            <Card className="bg-card border border-border shadow-sm">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className={cn(
                      "font-semibold text-foreground flex items-center gap-2",
                      isMobile ? "text-base" : "text-lg"
                    )}>
                      <span>📁</span>
                      Pastas
                    </h3>
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => setIsCreateFolderOpen(true)}
                      className="bg-primary/5 hover:bg-primary/10 border-primary/20 hover:border-primary/30"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Nova Pasta
                    </Button>
                  </div>
                  
                  <FoldersList 
                    sector={selectedSector}
                    selectedFolderId={selectedFolderId}
                    onSelectFolder={setSelectedFolderId}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Área principal dos cards */}
          <div className="flex-1 min-w-0">
            <Card className="bg-card border border-border shadow-sm h-full">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className={cn(
                      "font-semibold text-foreground flex items-center gap-2",
                      isMobile ? "text-base" : "text-lg"
                    )}>
                      <span>🎨</span>
                      Galeria de Cards
                    </h3>
                    <Button
                      onClick={() => setIsUploadCardOpen(true)}
                      variant="success"
                      size={isMobile ? "sm" : "default"}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Card
                    </Button>
                  </div>

                  <CardGallery 
                    sector={selectedSector}
                    folderId={selectedFolderId}
                    cards={cards}
                    setCards={setCards}
                    isLoading={isLoading}
                    onCreateCard={() => setIsUploadCardOpen(true)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Diálogos */}
      <CreateFolderDialog
        isOpen={isCreateFolderOpen}
        onOpenChange={setIsCreateFolderOpen}
        sector={selectedSector}
      />

      <UploadCardDialog
        open={isUploadCardOpen}
        onOpenChange={setIsUploadCardOpen}
        sector={selectedSector}
        folderId={selectedFolderId}
        onUploadSuccess={refetch}
      />
    </PageLayout>
  );
}
