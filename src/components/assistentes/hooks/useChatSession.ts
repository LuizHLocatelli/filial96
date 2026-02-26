import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { AIChatMessage, AIAssistant } from "../types";

export function useChatSession(sessionId: string | null, assistant: AIAssistant | null) {
  const queryClient = useQueryClient();
  const [isSending, setIsSending] = useState(false);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["ai_chat_messages", sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      
      const { data, error } = await supabase
        .from("ai_chat_messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as AIChatMessage[];
    },
    enabled: !!sessionId,
  });

  const sendMessage = useMutation({
    mutationFn: async ({ content, images }: { content: string; images: string[] }) => {
      if (!sessionId || !assistant) throw new Error("Sessão ou assistente inválidos");
      setIsSending(true);

      // Save user message to database
      const { error: insertError } = await supabase
        .from("ai_chat_messages")
        .insert([{ session_id: sessionId, role: "user", content, image_urls: images }]);

      if (insertError) throw insertError;

      // Invalidate to show user message immediately
      queryClient.invalidateQueries({ queryKey: ["ai_chat_messages", sessionId] });

      // Build history for API
      const history = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }));

      // Call Edge Function
      const { data, error: fnError } = await supabase.functions.invoke("gemini-assistant-chat", {
        body: {
          message: content,
          systemMessage: assistant.system_message,
          images: images,
          history: history,
        }
      });

      if (fnError || !data?.text) {
        throw new Error("Falha ao gerar resposta");
      }

      // Save model message to database
      const { error: modelInsertError } = await supabase
        .from("ai_chat_messages")
        .insert([{ 
          session_id: sessionId, 
          role: "model", 
          content: data.text, 
          image_urls: data.images || [] 
        }]);

      if (modelInsertError) throw modelInsertError;

      return data.text;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai_chat_messages", sessionId] });
    },
    onError: (error) => {
      console.error("Erro ao enviar mensagem:", error);
      toast.error("Erro ao comunicar com o assistente");
    },
    onSettled: () => {
      setIsSending(false);
    }
  });

  return {
    messages,
    isLoading,
    isSending,
    sendMessage,
  };
}
