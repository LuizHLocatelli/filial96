import { useState } from "react";
import { Plus, Wand2, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { FoldersList } from "@/components/promotional-cards/FoldersList";
import { CardGallery } from "@/components/promotional-cards/CardGallery";
import { CreateFolderDialog } from "@/components/promotional-cards/CreateFolderDialog";
import { UploadCardDialog } from "@/components/promotional-cards/UploadCardDialog";
import { CreateCardWithAIDialog } from "@/components/promotional-cards/CreateCardWithAIDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageNavigation } from "@/components/layout/PageNavigation";
import { useCards } from "@/hooks/useCards";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Armchair, Shirt, Banknote, Settings } from "lucide-react";

type Sector = "furniture" | "fashion" | "loan" | "service";

const SectorGallery = ({ 
  sector,
  folderId,
  onUploadClick
}: { 
  sector: Sector;
  folderId: string | null;
  onUploadClick: () => void;
}) => {
  const { cards, setCards, isLoading, refetch } = useCards(sector, folderId);
  
  return (
    <CardGallery 
      sector={sector}
      folderId={folderId}
      cards={cards}
      setCards={setCards}
      isLoading={isLoading}
      onCreateCard={onUploadClick}
    />
  );
};

export default function PromotionalCards() {
  const [selectedSector, setSelectedSector] = useState<Sector>("furniture");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isUploadCardOpen, setIsUploadCardOpen] = useState(false);
  const [isAICardOpen, setIsAICardOpen] = useState(false);
  const [foldersRefreshKey, setFoldersRefreshKey] = useState(0);
  const [isFolderPanelOpen, setIsFolderPanelOpen] = useState(false);
  const isMobile = useIsMobile();

  const tabsConfig = [
    {
      value: "furniture",
      label: "Móveis",
      icon: Armchair,
      mobileLabel: "Móveis",
      component: (
        <SectorGallery 
          sector="furniture" 
          folderId={selectedFolderId}
          onUploadClick={() => setIsUploadCardOpen(true)}
        />
      )
    },
    {
      value: "fashion",
      label: "Moda",
      icon: Shirt,
      mobileLabel: "Moda",
      component: (
        <SectorGallery 
          sector="fashion" 
          folderId={selectedFolderId}
          onUploadClick={() => setIsUploadCardOpen(true)}
        />
      )
    },
    {
      value: "loan",
      label: "Empréstimo",
      icon: Banknote,
      mobileLabel: "Emp.",
      component: (
        <SectorGallery 
          sector="loan" 
          folderId={selectedFolderId}
          onUploadClick={() => setIsUploadCardOpen(true)}
        />
      )
    },
    {
      value: "service",
      label: "Geral",
      icon: Settings,
      mobileLabel: "Geral",
      component: (
        <SectorGallery 
          sector="service" 
          folderId={selectedFolderId}
          onUploadClick={() => setIsUploadCardOpen(true)}
        />
      )
    }
  ];

  const FoldersPanel = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm">
          <span className="text-base">📁</span>
          Pastas
        </h3>
        <Button 
          size="sm"
          variant="ghost"
          onClick={() => setIsCreateFolderOpen(true)}
          className="h-8 px-2 text-primary hover:bg-primary/10"
        >
          <Plus className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Nova</span>
        </Button>
      </div>
      
      <FoldersList 
        key={`${foldersRefreshKey}-${selectedSector}`}
        sector={selectedSector}
        selectedFolderId={selectedFolderId}
        onSelectFolder={(folderId) => {
          setSelectedFolderId(folderId);
          if (isMobile) setIsFolderPanelOpen(false);
        }}
      />
    </div>
  );

  return (
    <PageLayout spacing="normal" maxWidth="full">
      <PageHeader
        title="Cards Promocionais"
        description="Gestão completa dos materiais promocionais"
        icon="🖼️"
        iconColor="text-primary"
        variant="default"
        breadcrumbs={[
          { label: "Hub", href: "/" },
          { label: "Cards Promocionais" }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsAICardOpen(true)}
              variant="outline"
              size="sm"
              className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/30 hover:border-primary/50 hover:from-primary/20 hover:to-purple-500/20 gap-1.5"
            >
              <Wand2 className="h-3.5 w-3.5 text-primary" />
              <span className="hidden sm:inline">Criar com IA</span>
              <span className="sm:hidden">IA</span>
            </Button>
            <Button
              onClick={() => setIsUploadCardOpen(true)}
              variant="success"
              size="sm"
              className="gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Novo Card</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          </div>
        }
      />

      <div className="space-y-4">
        {isMobile && (
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFolderPanelOpen(true)}
              className="gap-2"
            >
              <PanelLeft className="h-4 w-4" />
              <span>Pastas</span>
            </Button>
          </div>
        )}

        <div className={cn(
          "flex gap-4",
          isMobile ? "flex-col" : "flex-row"
        )}>
          {!isMobile && (
            <motion.aside 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-shrink-0 w-72"
            >
              <div className="glass-card p-4 sticky top-4">
                <FoldersPanel />
              </div>
            </motion.aside>
          )}

          <div className="flex-1 min-w-0">
            <PageNavigation
              tabs={tabsConfig}
              activeTab={selectedSector}
              onTabChange={(value) => {
                setSelectedSector(value as Sector);
                setSelectedFolderId(null);
              }}
              variant="cards"
              maxColumns={4}
            />
          </div>
        </div>
      </div>

      <Sheet open={isFolderPanelOpen} onOpenChange={setIsFolderPanelOpen}>
        <SheetContent side="left" className="w-[300px] p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="text-base font-semibold">
              Selecionar Pasta
            </SheetTitle>
          </SheetHeader>
          <div className="p-4">
            <FoldersPanel />
          </div>
        </SheetContent>
      </Sheet>

      <CreateFolderDialog
        isOpen={isCreateFolderOpen}
        onOpenChange={setIsCreateFolderOpen}
        sector={selectedSector}
        onSuccess={() => setFoldersRefreshKey(prev => prev + 1)}
      />

      <UploadCardDialog
        open={isUploadCardOpen}
        onOpenChange={setIsUploadCardOpen}
        sector={selectedSector}
        folderId={selectedFolderId}
        onUploadSuccess={() => {}}
      />

      <CreateCardWithAIDialog
        open={isAICardOpen}
        onOpenChange={setIsAICardOpen}
        sector={selectedSector}
        folderId={selectedFolderId}
        onSuccess={() => {}}
      />
    </PageLayout>
  );
}
