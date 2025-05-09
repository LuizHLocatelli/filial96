
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FolderIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface Folder {
  id: string;
  name: string;
  sector: "furniture" | "fashion";
}

interface FoldersListProps {
  sector: "furniture" | "fashion";
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
}

export function FoldersList({ sector, selectedFolderId, onSelectFolder }: FoldersListProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Tradução dos setores para português
  const sectorTranslation = {
    furniture: "Móveis",
    fashion: "Moda"
  };

  useEffect(() => {
    const fetchFolders = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('card_folders')
          .select('*')
          .eq('sector', sector)
          .order('name');
        
        if (error) throw error;
        
        setFolders(data as Folder[]);
      } catch (error) {
        console.error('Error fetching folders:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as pastas",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFolders();
    
    // Setup real-time subscription for folder updates
    const channel = supabase
      .channel('card-folders-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'card_folders',
        filter: `sector=eq.${sector}`
      }, () => {
        fetchFolders();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [sector]);

  return (
    <ScrollArea className="h-[300px]">
      {isLoading ? (
        <div className="flex items-center justify-center h-20">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : folders.length === 0 ? (
        <div className="text-center py-4 text-sm text-muted-foreground">
          Nenhuma pasta criada para {sectorTranslation[sector]}.
        </div>
      ) : (
        <div className="space-y-1">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-left font-normal",
              selectedFolderId === null && "bg-accent text-accent-foreground"
            )}
            onClick={() => onSelectFolder(null)}
          >
            <FolderIcon className="h-4 w-4 mr-2" />
            Todos os Cards
          </Button>
          
          {folders.map((folder) => (
            <Button
              key={folder.id}
              variant="ghost"
              className={cn(
                "w-full justify-start text-left font-normal",
                selectedFolderId === folder.id && "bg-accent text-accent-foreground"
              )}
              onClick={() => onSelectFolder(folder.id)}
            >
              <FolderIcon className="h-4 w-4 mr-2" />
              {folder.name}
            </Button>
          ))}
        </div>
      )}
    </ScrollArea>
  );
}
