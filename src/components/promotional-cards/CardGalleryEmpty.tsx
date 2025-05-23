
import { Plus, Upload, FolderOpen, Image } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CardGalleryEmptyProps {
  folderId: string | null;
}

export function CardGalleryEmpty({ folderId }: CardGalleryEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center">
          {folderId ? (
            <FolderOpen className="h-12 w-12 text-primary/60" />
          ) : (
            <Image className="h-12 w-12 text-primary/60" />
          )}
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
          <Plus className="h-4 w-4 text-white" />
        </div>
      </div>
      
      <div className="space-y-3 max-w-md">
        <h3 className="text-xl font-semibold text-foreground">
          {folderId ? "Pasta vazia" : "Nenhum card encontrado"}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {folderId 
            ? "Esta pasta ainda não possui cards promocionais. Adicione o primeiro card para começar!"
            : "Você ainda não criou nenhum card promocional. Comece criando seu primeiro card agora!"
          }
        </p>
      </div>
      
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25">
          <Upload className="h-4 w-4 mr-2" />
          Adicionar Card
        </Button>
      </div>
    </div>
  );
}
