
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, Trash2, FolderOpen, Download } from "lucide-react";
import { CartazItem } from "../hooks/useCartazes";
import { useCartazFolders } from "../hooks/useCartazFolders";
import { useState } from "react";
import { CartazEditDialog } from "./CartazEditDialog";
import { CartazDeleteDialog } from "./CartazDeleteDialog";

interface CartazDropdownMenuProps {
  cartaz: CartazItem;
  onDelete: (id: string) => Promise<boolean>;
  onMoveToFolder: (cartazId: string, folderId: string | null) => Promise<boolean>;
  onUpdate: (id: string, newTitle: string) => void;
  trigger: React.ReactNode;
}

export function CartazDropdownMenu({
  cartaz,
  onDelete,
  onMoveToFolder,
  onUpdate,
  trigger
}: CartazDropdownMenuProps) {
  const { folders } = useCartazFolders();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = cartaz.file_url;
    link.download = cartaz.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {trigger}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <FolderOpen className="mr-2 h-4 w-4" />
              Mover para pasta
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onClick={() => onMoveToFolder(cartaz.id, null)}
                disabled={cartaz.folder_id === null}
              >
                Sem pasta
              </DropdownMenuItem>
              {folders.map((folder) => (
                <DropdownMenuItem
                  key={folder.id}
                  onClick={() => onMoveToFolder(cartaz.id, folder.id)}
                  disabled={cartaz.folder_id === folder.id}
                >
                  {folder.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CartazEditDialog
        cartaz={cartaz}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onUpdate={onUpdate}
      />

      <CartazDeleteDialog
        cartaz={cartaz}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onDelete={onDelete}
      />
    </>
  );
}
