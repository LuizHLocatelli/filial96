import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { uploadArquivo, queryKeys } from "../lib/queries";
import { isAISupportedType } from "../lib/utils";
import { UploadItem, UploadStatus } from "../types";

interface UseUploadQueueOptions {
  onUploadComplete?: (fileId: string) => void;
}

export function useUploadQueue(options: UseUploadQueueOptions = {}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [uploads, setUploads] = useState<UploadItem[]>([]);

  const updateUpload = useCallback((id: string, updates: Partial<UploadItem>) => {
    setUploads((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  const removeUpload = useCallback((id: string) => {
    setUploads((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const uploadFile = useCallback(
    async (file: File, pastaId: string | null, customFileName?: string): Promise<string> => {
      if (!user) throw new Error("Usuário não autenticado");

      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      const uploadItem: UploadItem = {
        id,
        file,
        customName: customFileName || file.name,
        progress: 0,
        status: "pending",
      };

      setUploads((prev) => [...prev, uploadItem]);

      try {
        updateUpload(id, { status: "uploading", progress: 10 });

        const arquivo = await uploadArquivo(file, user.id, pastaId, customFileName);

        updateUpload(id, { progress: 80 });

        if (isAISupportedType(file.type)) {
          updateUpload(id, { status: "analyzing", progress: 90 });

          try {
            await supabase.functions.invoke("gemini-document-analyzer", {
              body: {
                action: "summarize",
                fileId: arquivo.id,
              },
            });
          } catch (aiError) {
            console.error("AI analysis failed:", aiError);
          }
        }

        updateUpload(id, { status: "completed", progress: 100 });
        queryClient.invalidateQueries({ queryKey: queryKeys.arquivos.all });

        options.onUploadComplete?.(arquivo.id);

        setTimeout(() => {
          removeUpload(id);
        }, 3000);

        return arquivo.id;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erro no upload";
        updateUpload(id, { status: "error", error: message });
        toast.error("Erro no upload", { description: message });
        throw error;
      }
    },
    [user, queryClient, updateUpload, removeUpload, options]
  );

  const uploadFiles = useCallback(
    async (files: { file: File; customName?: string }[], pastaId: string | null) => {
      const results: string[] = [];
      for (const { file, customName } of files) {
        try {
          const id = await uploadFile(file, pastaId, customName);
          results.push(id);
        } catch {
          // Error already handled in uploadFile
        }
      }
      return results;
    },
    [uploadFile]
  );

  const clearCompleted = useCallback(() => {
    setUploads((prev) => prev.filter((item) => item.status !== "completed"));
  }, []);

  const clearAll = useCallback(() => {
    setUploads([]);
  }, []);

  return {
    uploads,
    uploadFile,
    uploadFiles,
    clearCompleted,
    clearAll,
    removeUpload,
  };
}
