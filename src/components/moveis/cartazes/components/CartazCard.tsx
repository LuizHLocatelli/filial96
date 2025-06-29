
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, FileImage, MoreVertical } from "lucide-react";
import { CartazItem } from "../hooks/useCartazes";
import { CartazDropdownMenu } from "./CartazDropdownMenu";
import { CartazViewDialog } from "./CartazViewDialog";

interface CartazCardProps {
  cartaz: CartazItem;
  onDelete: (id: string) => Promise<boolean>;
  onMoveToFolder: (cartazId: string, folderId: string | null) => Promise<boolean>;
  onUpdate: (id: string, newTitle: string) => void;
}

export function CartazCard({ cartaz, onDelete, onMoveToFolder, onUpdate }: CartazCardProps) {
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleCardClick = () => {
    setShowViewDialog(true);
  };

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  return (
    <>
      <Card 
        className="group cursor-pointer hover:shadow-md transition-all duration-200 border border-border hover:border-primary/20"
        onClick={handleCardClick}
      >
        <CardContent className="p-4">
          <div className="relative">
            {/* Preview */}
            <div className="aspect-[4/3] bg-muted rounded-lg mb-3 flex items-center justify-center overflow-hidden">
              {cartaz.file_type === 'image' ? (
                <img 
                  src={cartaz.file_url} 
                  alt={cartaz.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <FileText className="h-12 w-12 text-muted-foreground" />
              )}
            </div>

            {/* Actions */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <CartazDropdownMenu
                cartaz={cartaz}
                onDelete={onDelete}
                onMoveToFolder={onMoveToFolder}
                onUpdate={onUpdate}
                trigger={
                  <button
                    onClick={handleDropdownClick}
                    className="p-1 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background border border-border/50"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                }
              />
            </div>

            {/* Type badge */}
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="text-xs">
                {cartaz.file_type === 'pdf' ? (
                  <>
                    <FileText className="h-3 w-3 mr-1" />
                    PDF
                  </>
                ) : (
                  <>
                    <FileImage className="h-3 w-3 mr-1" />
                    Imagem
                  </>
                )}
              </Badge>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-medium text-sm line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {cartaz.title}
          </h3>
        </CardContent>
      </Card>

      <CartazViewDialog
        cartaz={cartaz}
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
      />
    </>
  );
}
