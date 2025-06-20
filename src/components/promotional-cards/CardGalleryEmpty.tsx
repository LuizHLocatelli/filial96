import { Plus, Upload, FolderOpen, Image } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CardGalleryEmptyProps {
  folderId: string | null;
}

export function CardGalleryEmpty({ folderId }: CardGalleryEmptyProps) {
  return (
    <div className="text-center py-16 px-4">
      <div className="stack-lg items-center">
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center">
            {folderId ? (
              <FolderOpen className="h-12 w-12 text-primary/60" />
            ) : (
              <Image className="h-12 w-12 text-primary/60" />
            )}
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
            <Plus className="touch-friendly text-white" />
          </div>
        </div>
        
        <div className="stack-sm max-w-md">
          <h3 className="text-responsive-xl font-semibold text-foreground">
            {folderId ? "Pasta vazia" : "Nenhum card encontrado"}
          </h3>
          <p className="text-muted-foreground text-responsive-sm leading-relaxed">
            {folderId 
              ? "Esta pasta ainda não possui cards promocionais. Adicione o primeiro card para começar!"
              : "Você ainda não criou nenhum card promocional. Comece criando seu primeiro card agora!"
            }
          </p>
        </div>
        
        <div className="button-group-responsive">
          <Button className="button-responsive inline-sm">
            <Upload className="touch-friendly" />
            Adicionar Card
          </Button>
        </div>
      </div>
    </div>
  );
}
