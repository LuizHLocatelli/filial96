
import { supabase } from "@/integrations/supabase/client";

export function useCartazOperations() {
  const deleteCartaz = async (id: string) => {
    try {
      const { data: cartazData, error: cartazError } = await supabase
        .from('cartazes')
        .select('file_url')
        .eq('id', id)
        .single();
      
      if (cartazError) throw cartazError;
      
      const { error: deleteError } = await supabase
        .from('cartazes')
        .delete()
        .eq('id', id);
      
      if (deleteError) throw deleteError;
      
      const fileUrl = cartazData.file_url;
      const filePath = fileUrl.split('/').slice(-2).join('/');
      
      if (filePath) {
        const { error: storageError } = await supabase
          .storage
          .from('cartazes')
          .remove([filePath]);
        
        if (storageError) {
          console.error('Error removing file from storage:', storageError);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting cartaz:', error);
      return false;
    }
  };

  const moveCartazToFolder = async (cartazId: string, newFolderId: string | null) => {
    try {
      const { error } = await supabase
        .from('cartazes')
        .update({ folder_id: newFolderId })
        .eq('id', cartazId);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error moving cartaz to folder:', error);
      return false;
    }
  };

  return { deleteCartaz, moveCartazToFolder };
}
