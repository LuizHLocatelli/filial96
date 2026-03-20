import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EnhanceResult {
  system_message: string;
  suggested_emoji: string;
}

export function useEnhanceSystemMessageWithRAG() {
  const [isEnhancing, setIsEnhancing] = useState(false);

  const enhance = async (
    currentSystemMessage: string,
    assistantId: string
  ): Promise<EnhanceResult | null> => {
    setIsEnhancing(true);
    try {
      // Fetch all documents for this assistant
      const { data: documents, error: docsError } = await supabase
        .from("ai_assistant_documents")
        .select("id, file_name, content_text")
        .eq("assistant_id", assistantId);

      if (docsError) throw docsError;

      if (!documents || documents.length === 0) {
        toast.warning("Nenhum documento encontrado na base de conhecimento");
        return null;
      }

      // Call edge function to enhance system message with RAG documents
      const { data, error } = await supabase.functions.invoke("gemini-assistant-chat", {
        body: {
          message: "Aprimorar system message com RAG",
          systemMessage: currentSystemMessage,
          enhanceSystemMessage: true,
          ragDocuments: documents.map(d => ({
            id: d.id,
            file_name: d.file_name,
            content_text: d.content_text
          }))
        }
      });

      if (error) throw error;

      if (data?.error) {
        toast.error(data.error);
        return null;
      }

      return {
        system_message: data?.system_message || currentSystemMessage,
        suggested_emoji: data?.suggested_emoji || "🧠"
      };

    } catch (error) {
      console.error("Erro ao aprimorar system message com RAG:", error);
      toast.error("Erro ao aprimorar as instruções com a base de conhecimento");
      return null;
    } finally {
      setIsEnhancing(false);
    }
  };

  return { enhance, isEnhancing };
}