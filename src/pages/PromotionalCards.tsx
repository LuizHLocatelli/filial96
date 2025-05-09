
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FoldersList } from "@/components/promotional-cards/FoldersList";
import { CardGallery } from "@/components/promotional-cards/CardGallery";
import { CreateFolderDialog } from "@/components/promotional-cards/CreateFolderDialog";
import { UploadCardDialog } from "@/components/promotional-cards/UploadCardDialog";

export default function PromotionalCards() {
  const [selectedSector, setSelectedSector] = useState<"furniture" | "fashion">("furniture");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isUploadCardOpen, setIsUploadCardOpen] = useState(false);
  
  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Cards Promocionais</h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Gerencie cards promocionais para setores de Móveis e Moda
          </p>
        </div>
      </div>

      <Tabs 
        defaultValue="furniture" 
        onValueChange={(value) => setSelectedSector(value as "furniture" | "fashion")}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="furniture">Móveis</TabsTrigger>
          <TabsTrigger value="fashion">Moda</TabsTrigger>
        </TabsList>

        {/* Conteúdo para ambos os setores */}
        {["furniture", "fashion"].map((sector) => (
          <TabsContent key={sector} value={sector} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Sidebar com pastas */}
              <Card className="w-full md:w-64 h-fit">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Pastas</h3>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setIsCreateFolderOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Nova
                    </Button>
                  </div>
                  
                  <FoldersList 
                    sector={sector as "furniture" | "fashion"}
                    selectedFolderId={selectedFolderId}
                    onSelectFolder={setSelectedFolderId}
                  />
                </CardContent>
              </Card>

              {/* Galeria principal */}
              <div className="flex-1">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Cards Promocionais</h3>
                  <Button
                    onClick={() => setIsUploadCardOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Novo Card
                  </Button>
                </div>

                <CardGallery 
                  sector={sector as "furniture" | "fashion"}
                  folderId={selectedFolderId}
                />
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>

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
