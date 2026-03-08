import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useGenerateTitle() {
  const generateTitle = useCallback(async (firstMessage: string): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke("gemini-assistant-chat", {
        body: {
          message: firstMessage,
          systemMessage: "",
          generateTitle: true,
        }
      });

      if (error || !data?.title) {
        return `Conversa ${new Date().toLocaleDateString()}`;
      }

      return data.title.slice(0, 50);
    } catch {
      return `Conversa ${new Date().toLocaleDateString()}`;
    }
  }, []);

  return { generateTitle };
}
