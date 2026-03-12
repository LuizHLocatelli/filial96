import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

export interface AssistantDocument {
  id: string;
  assistant_id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  content_text: string;
  chunk_index: number;
  created_at: string;
}

export function useAssistantDocuments(assistantId?: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["ai_assistant_documents", assistantId],
    queryFn: async () => {
      if (!assistantId) return [];
      const { data, error } = await supabase
        .from("ai_assistant_documents")
        .select("id, assistant_id, user_id, file_name, file_url, chunk_index, created_at")
        .eq("assistant_id", assistantId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AssistantDocument[];
    },
    enabled: !!assistantId && !!profile?.id,
  });

  // Get unique files (group by file_name + file_url)
  const uniqueFiles = documents.reduce((acc, doc) => {
    const key = doc.file_url;
    if (!acc.find(d => d.file_url === key)) {
      acc.push(doc);
    }
    return acc;
  }, [] as AssistantDocument[]);

  const uploadDocument = useMutation({
    mutationFn: async ({ file, assistantId: aId }: { file: File; assistantId: string }) => {
      if (!profile?.id) throw new Error("Usuário não autenticado");

      // Upload file to storage
      const fileName = `rag/${aId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("ai-chat-attachments")
        .upload(fileName, file, { contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("ai-chat-attachments")
        .getPublicUrl(fileName);

      // Call edge function — send only the URL, not the file content
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini-embed-document`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(session?.access_token ? { "Authorization": `Bearer ${session.access_token}` } : {}),
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            assistantId: aId,
            userId: profile.id,
            fileName: file.name,
            fileUrl: publicUrl,
            mimeType: file.type,
            fileSize: file.size,
          }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Erro ao processar documento");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai_assistant_documents", assistantId] });
      toast.success("Documento adicionado à base de conhecimento!");
    },
    onError: (error) => {
      console.error("Erro ao enviar documento:", error);
      toast.error("Erro ao processar documento");
    },
  });

  const deleteDocument = useMutation({
    mutationFn: async (fileUrl: string) => {
      // Delete all chunks with this file_url
      const { error } = await supabase
        .from("ai_assistant_documents")
        .delete()
        .eq("file_url", fileUrl)
        .eq("assistant_id", assistantId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai_assistant_documents", assistantId] });
      toast.success("Documento removido da base de conhecimento!");
    },
    onError: (error) => {
      console.error("Erro ao remover documento:", error);
      toast.error("Erro ao remover documento");
    },
  });

  const renameDocument = useMutation({
    mutationFn: async ({ fileUrl, newName }: { fileUrl: string; newName: string }) => {
      const { error } = await supabase
        .from("ai_assistant_documents")
        .update({ file_name: newName })
        .eq("file_url", fileUrl)
        .eq("assistant_id", assistantId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai_assistant_documents", assistantId] });
      toast.success("Documento renomeado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao renomear documento:", error);
      toast.error("Erro ao renomear documento");
    },
  });

  return {
    documents: uniqueFiles,
    isLoading,
    uploadDocument,
    deleteDocument,
    renameDocument,
  };
}
