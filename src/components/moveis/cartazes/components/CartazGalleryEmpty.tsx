
import { Button } from "@/components/ui/button";
import { Plus, FileImage } from "lucide-react";

interface CartazGalleryEmptyProps {
  folderId: string | null;
  onCreateCartaz: () => void;
}

export function CartazGalleryEmpty({ folderId, onCreateCartaz }: CartazGalleryEmptyProps) {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
        <FileImage className="h-12 w-12 text-muted-foreground" />
      </div>
      
      <h3 className="text-lg font-medium text-foreground mb-2">
        {folderId ? "Pasta vazia" : "Nenhum cartaz encontrado"}
      </h3>
      
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        {folderId 
          ? "Esta pasta ainda não possui cartazes. Comece fazendo o upload do primeiro cartaz."
          : "Comece criando sua primeira pasta ou fazendo upload de um cartaz."
        }
      </p>
      
      <Button onClick={onCreateCartaz} className="gap-2">
        <Plus className="h-4 w-4" />
        Adicionar Primeiro Cartaz
      </Button>
    </div>
  );
}
