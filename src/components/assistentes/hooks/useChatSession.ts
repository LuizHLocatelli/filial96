import { useState, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { AIChatMessage, AIAssistant } from "../types";
import type { ChatDocument } from "../components/ChatInput";

export function useChatSession(sessionId: string | null, assistant: AIAssistant | null) {
  const queryClient = useQueryClient();
  const [isSending, setIsSending] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [activeTools, setActiveTools] = useState<string[]>([]);
  const abortRef = useRef<AbortController | null>(null);

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
    mutationFn: async ({ content, images, documents }: { content: string; images: string[]; documents?: ChatDocument[] }) => {
      if (!sessionId || !assistant) throw new Error("Sessão ou assistente inválidos");
      setIsSending(true);
      setStreamingContent("");
      setActiveTools([]);

      // Save user message
      const { error: insertError } = await supabase
        .from("ai_chat_messages")
        .insert([{ session_id: sessionId, role: "user", content, image_urls: images }]);
      if (insertError) throw insertError;
      queryClient.invalidateQueries({ queryKey: ["ai_chat_messages", sessionId] });

      // Build history
      const history = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }));

      // Stream response via SSE
      const abortController = new AbortController();
      abortRef.current = abortController;

      const { data: { session: authSession } } = await supabase.auth.getSession();
      const token = authSession?.access_token;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini-assistant-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {}),
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            message: content,
            systemMessage: assistant.system_message,
            images,
            documents: documents || [],
            history,
            stream: true,
            webSearchEnabled: (assistant as any).web_search_enabled || false,
            assistantId: assistant.id,
          }),
          signal: abortController.signal,
        }
      );

      if (!response.ok || !response.body) {
        throw new Error("Falha ao iniciar stream");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let fullText = "";
      let finalImages: string[] = [];
      let toolsUsed: string[] = [];
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);

            // Handle tool activation events
            if (parsed.tool && parsed.status === "active") {
              setActiveTools(prev => prev.includes(parsed.tool) ? prev : [...prev, parsed.tool]);
              toolsUsed = [...new Set([...toolsUsed, parsed.tool])];
              continue;
            }

            // Handle final tools_used summary
            if (parsed.tools_used && Array.isArray(parsed.tools_used)) {
              toolsUsed = parsed.tools_used;
              continue;
            }

            if (parsed.replace) {
              fullText = parsed.text || "";
              finalImages = parsed.images || [];
              setStreamingContent(fullText);
            } else if (parsed.text) {
              fullText += parsed.text;
              setStreamingContent(fullText);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Save model message with tools_used
      const insertPayload: any = {
        session_id: sessionId,
        role: "model",
        content: fullText,
        image_urls: finalImages,
      };
      if (toolsUsed.length > 0) {
        insertPayload.tools_used = toolsUsed;
      }

      const { error: modelInsertError } = await supabase
        .from("ai_chat_messages")
        .insert([insertPayload]);
      if (modelInsertError) throw modelInsertError;

      setStreamingContent("");
      setActiveTools([]);
      return fullText;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai_chat_messages", sessionId] });
    },
    onError: (error) => {
      console.error("Erro ao enviar mensagem:", error);
      toast.error("Erro ao comunicar com o assistente");
      setStreamingContent("");
      setActiveTools([]);
    },
    onSettled: () => {
      setIsSending(false);
      abortRef.current = null;
    }
  });

  const cancelStream = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return {
    messages,
    isLoading,
    isSending,
    streamingContent,
    activeTools,
    sendMessage,
    cancelStream,
  };
}
