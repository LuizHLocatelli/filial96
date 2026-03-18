
import { Button } from "@/components/ui/button";
import { Folder, FileText } from "lucide-react";
import { CartazFolder } from "../hooks/useCartazFolders";
import { cn } from "@/lib/utils";

interface FoldersListProps {
  folders: CartazFolder[];
  isLoading: boolean;
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
}

export function FoldersList({ folders, isLoading, selectedFolderId, onSelectFolder }: FoldersListProps) {

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-9 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start text-left h-auto py-2 px-3",
          selectedFolderId === null && "bg-primary/10 text-primary"
        )}
        onClick={() => onSelectFolder(null)}
      >
        <FileText className="mr-2 h-4 w-4 flex-shrink-0" />
        <span className="truncate">Todos os Cartazes</span>
      </Button>
      
      {folders.map((folder) => (
        <Button
          key={folder.id}
          variant="ghost"
          className={cn(
            "w-full justify-start text-left h-auto py-2 px-3",
            selectedFolderId === folder.id && "bg-primary/10 text-primary"
          )}
          onClick={() => onSelectFolder(folder.id)}
        >
          <Folder className="mr-2 h-4 w-4 flex-shrink-0" />
          <span className="truncate">{folder.name}</span>
        </Button>
      ))}
      
      {folders.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Folder className="mx-auto h-12 w-12 mb-2 opacity-50" />
          <p className="text-sm">Nenhuma pasta criada</p>
        </div>
      )}
    </div>
  );
}
