
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useFileUpload } from "@/hooks/crediario/useFileUpload";
import { VendaO, VendaOProduct, VendaOAttachment } from "@/types/vendaO";

// Helper function to ensure produtos is always an array of VendaOProduct
const ensureProductsArray = (produtos: any): VendaOProduct[] => {
  if (Array.isArray(produtos)) {
    return produtos;
  }
  
  try {
    if (typeof produtos === 'string') {
      return JSON.parse(produtos);
    }
    return JSON.parse(JSON.stringify(produtos));
  } catch (e) {
    console.error("Error parsing produtos:", e);
    return [];
  }
};

export function useVendaO() {
  const [sales, setSales] = useState<VendaO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { uploadFile, isUploading, progress } = useFileUpload();

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('venda_o_sales')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch attachments for each sale
      const salesWithAttachments = await Promise.all(
        data.map(async (sale) => {
          const { data: attachments, error: attachmentsError } = await supabase
            .from('venda_o_attachments')
            .select('*')
            .eq('sale_id', sale.id);

          if (attachmentsError) {
            console.error("Error fetching attachments:", attachmentsError);
            return { 
              ...sale, 
              produtos: ensureProductsArray(sale.produtos),
              attachments: [] 
            };
          }

          return { 
            ...sale, 
            produtos: ensureProductsArray(sale.produtos),
            attachments: attachments || [] 
          };
        })
      );

      setSales(salesWithAttachments as VendaO[]);
    } catch (error) {
      console.error("Error loading Venda O sales:", error);
      toast({
        title: "Erro ao carregar as vendas",
        description: "Ocorreu um erro ao carregar as vendas de outras filiais.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addSale = async (
    saleData: {
      filial: string;
      data_venda: string;
      nome_cliente: string;
      telefone?: string;
      produtos: VendaOProduct[];
      previsao_chegada?: string;
      tipo_entrega: 'frete' | 'retirada';
      status: 'aguardando_produto' | 'aguardando_cliente' | 'pendente' | 'concluida';
    },
    file: File
  ): Promise<boolean> => {
    try {
      // Insert sale record
      const { data: sale, error: saleError } = await supabase
        .from('venda_o_sales')
        .insert({
          filial: saleData.filial,
          data_venda: saleData.data_venda,
          nome_cliente: saleData.nome_cliente,
          telefone: saleData.telefone,
          produtos: JSON.stringify(saleData.produtos),
          previsao_chegada: saleData.previsao_chegada,
          tipo_entrega: saleData.tipo_entrega,
          status: saleData.status,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select('*')
        .single();

      if (saleError) throw saleError;

      // Upload file to storage
      const result = await uploadFile(file, {
        bucketName: 'venda_o_cupons',
        folder: 'cupons',
        generateUniqueName: true
      });

      if (!result) {
        throw new Error("Falha ao enviar o cupom fiscal.");
      }

      // Save attachment record
      const { error: attachmentError } = await supabase
        .from('venda_o_attachments')
        .insert({
          sale_id: sale.id,
          file_name: file.name,
          file_type: file.type,
          file_url: result.file_url,
          file_size: file.size,
          created_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (attachmentError) throw attachmentError;

      toast({
        title: "Venda adicionada",
        description: "A venda foi adicionada com sucesso.",
      });

      await fetchSales();
      return true;
    } catch (error: any) {
      console.error("Erro ao adicionar venda:", error);
      toast({
        title: "Erro ao adicionar venda",
        description: error.message || "Ocorreu um erro ao adicionar a venda.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateSaleStatus = async (id: string, status: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('venda_o_sales')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Status atualizado",
        description: "O status da venda foi atualizado com sucesso.",
      });

      await fetchSales();
      return true;
    } catch (error: any) {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro ao atualizar status",
        description: error.message || "Ocorreu um erro ao atualizar o status.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteSale = async (id: string): Promise<boolean> => {
    try {
      // Get attachments to delete from storage later
      const { data: attachments, error: fetchError } = await supabase
        .from('venda_o_attachments')
        .select('file_url')
        .eq('sale_id', id);

      if (fetchError) throw fetchError;

      // Delete sale (cascade will delete attachments)
      const { error: deleteError } = await supabase
        .from('venda_o_sales')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Delete files from storage
      if (attachments && attachments.length > 0) {
        for (const attachment of attachments) {
          try {
            const url = new URL(attachment.file_url);
            const pathParts = url.pathname.split('/');
            const filePath = pathParts.slice(pathParts.indexOf('cupons')).join('/');

            await supabase.storage
              .from('venda_o_cupons')
              .remove([filePath]);
          } catch (storageError) {
            console.warn("Erro ao excluir arquivo:", storageError);
          }
        }
      }

      toast({
        title: "Venda excluída",
        description: "A venda foi excluída com sucesso.",
      });

      await fetchSales();
      return true;
    } catch (error: any) {
      console.error("Erro ao excluir venda:", error);
      toast({
        title: "Erro ao excluir venda",
        description: error.message || "Ocorreu um erro ao excluir a venda.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    sales,
    isLoading,
    isUploading,
    progress,
    addSale,
    updateSaleStatus,
    deleteSale,
    fetchSales
  };
}
