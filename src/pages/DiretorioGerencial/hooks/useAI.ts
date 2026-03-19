import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArquivoGerencial } from "../types";

export interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

export interface AIAnalysisResult {
  resumo: string;
  tags: string[];
}

export function useAISummarize() {
  return useMutation({
    mutationFn: async (fileId: string): Promise<AIAnalysisResult> => {
      const { data, error } = await supabase.functions.invoke("gemini-document-analyzer", {
        body: {
          action: "summarize",
          fileId,
        },
      });

      if (error) throw error;
      if (!data?.data) throw new Error("Resposta inválida da IA");

      return data.data as AIAnalysisResult;
    },
  });
}

export function useAIChat() {
  return useMutation({
    mutationFn: async ({
      fileId,
      message,
      history,
    }: {
      fileId: string;
      message: string;
      history?: ChatMessage[];
    }): Promise<string> => {
      const { data, error } = await supabase.functions.invoke("gemini-document-analyzer", {
        body: {
          action: "chat",
          fileId,
          message,
          history,
        },
      });

      if (error) throw error;
      if (!data?.text) throw new Error("Resposta inválida da IA");

      return data.text as string;
    },
  });
}
