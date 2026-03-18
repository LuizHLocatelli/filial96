import { Plus, Upload, FolderOpen, Image } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CardGalleryEmptyProps {
  folderId: string | null;
  onCreateCard: () => void;
}

export function CardGalleryEmpty({ folderId, onCreateCard }: CardGalleryEmptyProps) {
  return (
    <div className="text-center py-16 px-4">
      <div className="flex flex-col items-center space-y-6 max-w-md mx-auto">
        {/* Ícone ilustrativo */}
        <div className="relative">
          <div className="w-24 h-24 bg-primary/10 rounded-2xl flex items-center justify-center border-2 border-primary/20">
            {folderId ? (
              <FolderOpen className="h-12 w-12 text-primary" />
            ) : (
              <Image className="h-12 w-12 text-primary" />
            )}
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-sm">
            <Plus className="h-4 w-4 text-primary-foreground" />
          </div>
        </div>
        
        {/* Texto */}
        <div className="space-y-2">
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
        
        {/* Botão de ação */}
        <Button 
          onClick={onCreateCard}
          variant="success"
        >
          <Plus className="h-5 w-5 mr-2" />
          Criar Primeiro Card
        </Button>
      </div>
    </div>
  );
}
