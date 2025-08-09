
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileImage } from "lucide-react";
import { FoldersList } from "./components/FoldersList";
import { CartazGallery } from "./components/CartazGallery";
import { CreateFolderDialog } from "./components/CreateFolderDialog";
import { UploadCartazDialog } from "./components/UploadCartazDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { useCartazes } from "./hooks/useCartazes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GeradorDeCartaz from "./gerador/GeradorDeCartaz";

export default function Cartazes() {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isUploadCartazOpen, setIsUploadCartazOpen] = useState(false);
  const isMobile = useIsMobile();
  const { cartazes, setCartazes, isLoading, refetch } = useCartazes(selectedFolderId);
  
  return (
    <PageLayout spacing="normal" maxWidth="full">
      <PageHeader
        title="Cartazes da Loja"
        description="Gestão completa dos cartazes em PDF e imagem"
        icon={FileImage}
        iconColor="text-primary"
        variant="default"
        breadcrumbs={[
          { label: "Hub de Produtividade", href: "/" },
          { label: "Cartazes" }
        ]}
      />

      {/* Container principal */}
      <div className="space-y-6">
        {/* Layout principal */}
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
                      isMobile ? "text-sm" : "text-lg"
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
                    selectedFolderId={selectedFolderId}
                    onSelectFolder={setSelectedFolderId}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Área principal dos cartazes */}
          <div className="flex-1 min-w-0">
            <Card className="bg-card border border-border shadow-sm h-full">
              <CardContent className="p-6">
                <Tabs defaultValue="galeria" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="galeria">Galeria</TabsTrigger>
                    <TabsTrigger value="gerar">Gerar Cartaz</TabsTrigger>
                  </TabsList>

                  <TabsContent value="galeria">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className={cn(
                          "font-semibold text-foreground flex items-center gap-2",
                          isMobile ? "text-sm" : "text-lg"
                        )}>
                          <span>🎨</span>
                          Galeria de Cartazes
                        </h3>
                        <Button
                          onClick={() => setIsUploadCartazOpen(true)}
                          variant="success"
                          size={isMobile ? "sm" : "default"}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Novo Cartaz
                        </Button>
                      </div>

                      <CartazGallery 
                        folderId={selectedFolderId}
                        cartazes={cartazes}
                        setCartazes={setCartazes}
                        isLoading={isLoading}
                        onCreateCartaz={() => setIsUploadCartazOpen(true)}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="gerar">
                    <div className="space-y-4">
                      <h3 className={cn(
                        "font-semibold text-foreground flex items-center gap-2",
                        isMobile ? "text-sm" : "text-lg"
                      )}>
                        <span>🖨️</span>
                        Gerar Cartaz
                      </h3>
                      <GeradorDeCartaz />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Diálogos */}
      <CreateFolderDialog
        isOpen={isCreateFolderOpen}
        onOpenChange={setIsCreateFolderOpen}
      />

      <UploadCartazDialog
        open={isUploadCartazOpen}
        onOpenChange={setIsUploadCartazOpen}
        folderId={selectedFolderId}
        onUploadSuccess={refetch}
      />
    </PageLayout>
  );
}
