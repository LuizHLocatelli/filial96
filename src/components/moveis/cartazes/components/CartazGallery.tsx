
import { useState } from "react";
import { CartazItem } from "../hooks/useCartazes";
import { useCartazOperations } from "../hooks/useCartazOperations";
import { CartazGrid } from "./CartazGrid";
import { CartazGalleryEmpty } from "./CartazGalleryEmpty";
import { CartazGalleryLoading } from "./CartazGalleryLoading";
import { CartazSearchBar } from "./CartazSearchBar";
import { useCartazSearch } from "../hooks/useCartazSearch";
import { toast } from "@/components/ui/use-toast";

interface CartazGalleryProps {
  folderId: string | null;
  cartazes: CartazItem[];
  setCartazes: React.Dispatch<React.SetStateAction<CartazItem[]>>;
  isLoading: boolean;
  onCreateCartaz: () => void;
}

export function CartazGallery({ 
  folderId, 
  cartazes, 
  setCartazes, 
  isLoading, 
  onCreateCartaz 
}: CartazGalleryProps) {
  const { deleteCartaz, moveCartazToFolder } = useCartazOperations();
  const { searchTerm, setSearchTerm, monthFilter, setMonthFilter, filteredCartazes, hasResults, isSearching } = useCartazSearch(cartazes);
  const [processingCartazIds, setProcessingCartazIds] = useState<Set<string>>(new Set());

  const handleDeleteCartaz = async (id: string) => {
    if (processingCartazIds.has(id)) return false;
    
    setProcessingCartazIds(prev => new Set(prev).add(id));
    try {
      const success = await deleteCartaz(id);
      
      if (success) {
        setCartazes(prevCartazes => prevCartazes.filter(cartaz => cartaz.id !== id));
        toast({
          title: "Sucesso",
          description: "Cartaz excluído com sucesso"
        });
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error deleting cartaz:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o cartaz",
        variant: "destructive"
      });
      return false;
    } finally {
      setProcessingCartazIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleMoveToFolder = async (cartazId: string, newFolderId: string | null) => {
    if (processingCartazIds.has(cartazId)) return false;
    
    setProcessingCartazIds(prev => new Set(prev).add(cartazId));
    try {
      const success = await moveCartazToFolder(cartazId, newFolderId);
      
      if (success) {
        if (folderId && !newFolderId) {
          setCartazes(prevCartazes => prevCartazes.filter(cartaz => cartaz.id !== cartazId));
        } else if (!folderId) {
          setCartazes(prevCartazes => prevCartazes.map(cartaz => 
            cartaz.id === cartazId 
              ? {...cartaz, folder_id: newFolderId}
              : cartaz
          ));
        }
        
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error moving cartaz to folder:', error);
      toast({
        title: "Erro",
        description: "Não foi possível mover o cartaz",
        variant: "destructive"
      });
      return false;
    } finally {
      setProcessingCartazIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(cartazId);
        return newSet;
      });
    }
  };

  const handleUpdateCartaz = (id: string, newTitle: string, newMonth: string) => {
    setCartazes(prevCartazes =>
      prevCartazes.map(cartaz =>
        cartaz.id === id ? { ...cartaz, title: newTitle, month: newMonth } : cartaz
      )
    );
  };

  if (isLoading) {
    return <CartazGalleryLoading />;
  }

  return (
    <div className="space-y-6">
      {cartazes.length > 0 && (
        <CartazSearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          resultsCount={filteredCartazes.length}
          totalCount={cartazes.length}
          isSearching={isSearching}
          monthFilter={monthFilter}
          onMonthFilterChange={setMonthFilter}
        />
      )}

      {cartazes.length === 0 ? (
        <CartazGalleryEmpty folderId={folderId} onCreateCartaz={onCreateCartaz} />
      ) : !hasResults && isSearching ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            <p className="text-lg font-medium mb-2">Nenhum cartaz encontrado</p>
            <p className="text-sm">
              Tente pesquisar com outros termos ou verifique a ortografia.
            </p>
          </div>
        </div>
      ) : (
        <CartazGrid 
          cartazes={filteredCartazes}
          onDelete={handleDeleteCartaz}
          onMoveToFolder={handleMoveToFolder}
          onUpdate={handleUpdateCartaz}
        />
      )}
    </div>
  );
}
