import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import type { AIAssistant, AIChatSession } from "../types";

export function useAssistants() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: assistants, isLoading } = useQuery({
    queryKey: ["ai_assistants", profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_assistants")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AIAssistant[];
    },
    enabled: !!profile?.id,
  });

  const createAssistant = useMutation({
    mutationFn: async (newAssistant: Omit<AIAssistant, "id" | "created_at" | "updated_at" | "user_id">) => {
      if (!profile?.id) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("ai_assistants")
        .insert([{ ...newAssistant, user_id: profile.id }])
        .select()
        .single();

      if (error) throw error;
      return data as AIAssistant;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai_assistants"] });
      toast.success("Assistente criado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar assistente:", error);
      toast.error("Erro ao criar assistente");
    },
  });

  const updateAssistant = useMutation({
    mutationFn: async (assistant: Partial<AIAssistant> & { id: string }) => {
      const { data, error } = await supabase
        .from("ai_assistants")
        .update(assistant)
        .eq("id", assistant.id)
        .select()
        .single();

      if (error) throw error;
      return data as AIAssistant;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai_assistants"] });
      toast.success("Assistente atualizado!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar assistente:", error);
      toast.error("Erro ao atualizar assistente");
    },
  });

  const deleteAssistant = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("ai_assistants")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai_assistants"] });
      toast.success("Assistente removido!");
    },
    onError: (error) => {
      console.error("Erro ao remover assistente:", error);
      toast.error("Erro ao remover assistente");
    },
  });

  return {
    assistants,
    isLoading,
    createAssistant,
    updateAssistant,
    deleteAssistant,
  };
}

export function useChatSessions(assistantId?: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: sessions, isLoading: isLoadingSessions } = useQuery({
    queryKey: ["ai_chat_sessions", profile?.id, assistantId],
    queryFn: async () => {
      if (!assistantId) return [];
      
      const { data, error } = await supabase
        .from("ai_chat_sessions")
        .select("*")
        .eq("assistant_id", assistantId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AIChatSession[];
    },
    enabled: !!profile?.id && !!assistantId,
  });

  const createSession = useMutation({
    mutationFn: async ({ assistant_id, title }: { assistant_id: string; title: string }) => {
      if (!profile?.id) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("ai_chat_sessions")
        .insert([{ assistant_id, title, user_id: profile.id }])
        .select()
        .single();

      if (error) throw error;
      return data as AIChatSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai_chat_sessions"] });
    },
  });

  const deleteSession = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("ai_chat_sessions")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai_chat_sessions"] });
      toast.success("Conversa removida!");
    },
    onError: (error) => {
      console.error("Erro ao remover conversa:", error);
      toast.error("Erro ao remover conversa");
    },
  });

  return {
    sessions,
    isLoadingSessions,
    createSession,
    deleteSession,
  };
}
