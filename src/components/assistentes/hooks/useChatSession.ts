import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { AIChatMessage, AIAssistant, ThoughtStep, RAGReference, WebSource, StreamStatus } from "../types";
import type { ChatDocument } from "../components/ChatInput";

interface ModelInsertPayload {
  session_id: string;
  role: "model";
  content: string;
  image_urls: string[];
  tools_used?: string[];
}

function cleanGeminiOutput(text: string): string {
  if (!text) return text;
  
  let cleaned = text;
  
  // Remove tool calls pattern: google:search{...} or google:search{... return:X>]}
  cleaned = cleaned.replace(/google:[a-zA-Z0-9_]+\{[^}]*\}(?:\s*return:\d+>\]\})?/g, "");
  
  // Remove partial tool calls at the end of the text if still streaming
  const partialMatch = cleaned.match(/google:[a-zA-Z0-9_]+\{[^}]*$/s);
  if (partialMatch) {
    cleaned = cleaned.slice(0, partialMatch.index);
  }
  
  // Remove any leftover bracket characters at the end
  cleaned = cleaned.replace(/[{}[\]]+$/g, "");
  
  // Clean up multiple spaces/tabs, preserve newlines for markdown formatting
  cleaned = cleaned.replace(/[ \t]+/g, " ").trim();
  
  return cleaned;
}

export function useChatSession(sessionId: string | null, assistant: AIAssistant | null) {
  const queryClient = useQueryClient();
  const [isSending, setIsSending] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [activeTools, setActiveTools] = useState<string[]>([]);
  const [streamStatus, setStreamStatus] = useState<StreamStatus>('idle');
  const [thoughtSteps, setThoughtSteps] = useState<ThoughtStep[]>([]);
  const [ragReferences, setRAGReferences] = useState<RAGReference[]>([]);
  const [webSources, setWebSources] = useState<WebSource[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  // Cleanup on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
    };
  }, []);

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
      setStreamStatus('thinking');
      setThoughtSteps([]);
      setRAGReferences([]);
      setWebSources([]);

      const optimisticUserMessage = {
        id: `optimistic-user-${Date.now()}`,
        session_id: sessionId,
        role: "user" as const,
        content,
        image_urls: images,
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData(["ai_chat_messages", sessionId], (currentData: AIChatMessage[] | undefined) => {
        if (!currentData) return [optimisticUserMessage];
        return [...currentData, optimisticUserMessage];
      });

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
            webSearchEnabled: assistant.web_search_enabled || false,
            assistantId: assistant.id,
            temperatureLevel: assistant.temperature_level || 'medium',
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

            // Handle thought process events
            if (parsed.thought) {
              const thought: ThoughtStep = {
                id: `thought-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                text: parsed.thought.text || parsed.thought,
                timestamp: Date.now(),
                type: parsed.thought.type || 'reasoning',
              };
              setThoughtSteps(prev => [...prev, thought]);
              continue;
            }

            // Handle RAG references
            if (parsed.rag_documents && Array.isArray(parsed.rag_documents)) {
              const refs: RAGReference[] = parsed.rag_documents.map((doc: Record<string, unknown>) => ({
                fileName: doc.file_name || doc.fileName || 'Documento',
                fileUrl: doc.file_url || doc.fileUrl || '',
                relevanceScore: doc.relevance_score || doc.relevanceScore || 0,
                excerpt: doc.excerpt || doc.content_text || '',
              }));
              setRAGReferences(refs);
              continue;
            }

            // Handle web sources
            if (parsed.web_sources && Array.isArray(parsed.web_sources)) {
              const sources: WebSource[] = parsed.web_sources.map((src: Record<string, unknown>) => ({
                title: src.title || 'Fonte',
                uri: src.uri || src.url || '',
                domain: (src.domain as string) || (() => { try { return new URL(String(src.uri || src.url || 'http://example.com')).hostname; } catch { return 'web'; } })(),
              }));
              setWebSources(sources);
              continue;
            }

            // Handle tool activation events
            if (parsed.tool) {
              if (parsed.status === "active") {
                setActiveTools(prev => prev.includes(parsed.tool) ? prev : [...prev, parsed.tool]);
                toolsUsed = [...new Set([...toolsUsed, parsed.tool])];
                
                // Update stream status based on tool type
                if (parsed.tool === 'web_search' || parsed.tool === 'rag' || parsed.tool === 'document_analysis') {
                  setStreamStatus('using_tools');
                }
              } else if (parsed.status === "removed") {
                setActiveTools(prev => prev.filter(t => t !== parsed.tool));
                toolsUsed = toolsUsed.filter(t => t !== parsed.tool);
              }
              continue;
            }

            // Handle final tools_used summary
            if (parsed.tools_used && Array.isArray(parsed.tools_used)) {
              toolsUsed = parsed.tools_used;
              setActiveTools(parsed.tools_used);
              setStreamStatus('generating');
              continue;
            }

            if (parsed.replace) {
              fullText = parsed.text || "";
              finalImages = parsed.images || [];
              setStreamingContent(cleanGeminiOutput(fullText));
            } else if (parsed.text) {
              fullText += parsed.text;
              setStreamingContent(cleanGeminiOutput(fullText));
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      const cleanedFinalText = cleanGeminiOutput(fullText);

      // Save model message with tools_used
      const insertPayload: ModelInsertPayload = {
        session_id: sessionId,
        role: "model",
        content: cleanedFinalText,
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
      setStreamStatus('done');
      return cleanedFinalText;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai_chat_messages", sessionId] });
    },
    onError: (error) => {
      console.error("Erro ao enviar mensagem:", error);
      toast.error("Erro ao comunicar com o assistente");
      queryClient.invalidateQueries({ queryKey: ["ai_chat_messages", sessionId] });
      setStreamingContent("");
      setActiveTools([]);
      setStreamStatus('idle');
    },
    onSettled: () => {
      setIsSending(false);
      abortRef.current = null;
      setTimeout(() => setStreamStatus('idle'), 1000);
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
    streamStatus,
    thoughtSteps,
    ragReferences,
    webSources,
    sendMessage,
    cancelStream,
  };
}
