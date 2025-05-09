
import { Card, CardContent } from "@/components/ui/card";

interface CardGalleryEmptyProps {
  folderId: string | null;
}

export function CardGalleryEmpty({ folderId }: CardGalleryEmptyProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center h-40 text-center p-6">
        <p className="text-muted-foreground mb-4">
          {folderId 
            ? "Nenhum card promocional nesta pasta." 
            : "Nenhum card promocional encontrado para este setor."}
        </p>
      </CardContent>
    </Card>
  );
}
