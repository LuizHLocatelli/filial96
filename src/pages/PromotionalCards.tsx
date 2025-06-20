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

      {/* Seletor de setor */}
      <SectorSelector 
        selectedSector={selectedSector} 
        onSectorChange={(value) => {
          setSelectedSector(value as "furniture" | "fashion" | "loan" | "service");
          setSelectedFolderId(null);
        }} 
      />

      {/* Layout principal */}
      <div className="stack-lg">
        <div className="grid-responsive-wide">
          {/* Painel de pastas - mais compacto */}
          <Card className="w-full lg:w-72 card-responsive bg-gradient-to-br from-background to-muted/20 border border-border/50 shadow-sm">
            <CardContent className={cn("card-responsive", !isMobile && "p-4")}>
              <div className="stack-sm">
                <div className="header-responsive">
                  <h3 className="font-semibold text-responsive-sm inline-sm">
                    📁 Pastas
                  </h3>
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => setIsCreateFolderOpen(true)}
                    className="button-responsive-sm inline-sm bg-primary/5 hover:bg-primary/10 border-primary/20"
                  >
                    <Plus className="touch-friendly" />
                    Nova
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

          {/* Área principal dos cards - mais espaço */}
          <div className="flex-1 stack-md">
            <div className="header-responsive">
              <h3 className="font-semibold text-responsive-lg inline-sm">
                🎨 Galeria de Cards
              </h3>
              <Button
                onClick={() => setIsUploadCardOpen(true)}
                className="button-responsive inline-sm"
                size={isMobile ? "sm" : "default"}
              >
                <Plus className="touch-friendly" />
                Novo Card
              </Button>
            </div>

            <CardGallery 
              sector={selectedSector}
              folderId={selectedFolderId}
              cards={cards}
              setCards={setCards}
              isLoading={isLoading}
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
        onUploadSuccess={refetch}
      />
    </PageLayout>
  );
}
