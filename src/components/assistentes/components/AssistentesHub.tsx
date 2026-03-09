import { useState, useEffect, useRef } from "react";
import { AssistentesTopBar } from "./AssistentesTopBar";
import { AssistantPickerSheet } from "./AssistantPickerSheet";
import { SessionHistorySheet } from "./SessionHistorySheet";
import { AssistenteChat } from "./AssistenteChat";
import { AssistenteDialog } from "./AssistenteDialog";
import { useAssistants, useChatSessions } from "../hooks/useAssistants";
import { useGenerateTitle } from "../hooks/useGenerateTitle";
import type { AIAssistant } from "../types";
import type { ChatDocument } from "./ChatInput";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function AssistentesHub() {
  const { assistants = [], isLoading: isLoadingAssistants, createAssistant, updateAssistant, deleteAssistant } = useAssistants();
  const [activeAssistantId, setActiveAssistantId] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const { sessions = [], createSession, deleteSession } = useChatSessions(activeAssistantId || undefined);
  const { generateTitle } = useGenerateTitle();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAssistant, setEditingAssistant] = useState<AIAssistant | undefined>(undefined);
  const [isPickerOpen, setIsPickerOpen] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const pendingMessageRef = useRef<{ content: string; images: string[]; documents?: ChatDocument[] } | null>(null);

  useEffect(() => {
    if (!activeAssistantId && assistants.length > 0) {
      setActiveAssistantId(assistants[0].id);
    }
  }, [assistants, activeAssistantId]);

  const handleSaveAssistant = async (data: Omit<AIAssistant, "id" | "created_at" | "updated_at" | "user_id">) => {
    if (editingAssistant) {
      await updateAssistant.mutateAsync({ ...data, id: editingAssistant.id });
    } else {
      const newAssistant = await createAssistant.mutateAsync(data);
      if (newAssistant) setActiveAssistantId(newAssistant.id);
    }
    setIsDialogOpen(false);
  };

  const handleDeleteAssistant = async (id: string) => {
    await deleteAssistant.mutateAsync(id);
    if (activeAssistantId === id) { setActiveAssistantId(null); setActiveSessionId(null); }
    setIsDialogOpen(false);
  };

  const handleCreateSession = async () => {
    if (!activeAssistantId) return;
    const session = await createSession.mutateAsync({ assistant_id: activeAssistantId, title: `Conversa ${new Date().toLocaleDateString()}` });
    if (session) setActiveSessionId(session.id);
  };

  const handleSendWithoutSession = async (message: string, images: string[], documents?: ChatDocument[]) => {
    if (!activeAssistantId) return;
    const title = await generateTitle(message);
    const session = await createSession.mutateAsync({ assistant_id: activeAssistantId, title });
    if (session) {
      pendingMessageRef.current = { content: message, images, documents };
      setActiveSessionId(session.id);
    }
  };

  const activeAssistant = assistants.find(a => a.id === activeAssistantId) || null;
  const activeSession = sessions.find(s => s.id === activeSessionId) || null;

  return (
    <div className="flex flex-col h-[calc(100dvh-12rem)] min-h-[500px] border rounded-xl overflow-hidden bg-background mt-4 shadow-sm">
      {/* Top navigation bar */}
      <AssistentesTopBar
        assistant={activeAssistant}
        session={activeSession}
        sessionsCount={sessions.length}
        onOpenAssistantPicker={() => setIsPickerOpen(true)}
        onOpenSessionHistory={() => setIsHistoryOpen(true)}
        onEditAssistant={() => {
          if (activeAssistant) {
            setEditingAssistant(activeAssistant);
            setIsDialogOpen(true);
          }
        }}
        onNewSession={handleCreateSession}
      />

      {/* Chat area — full width */}
      <div className="flex-1 overflow-hidden">
        {activeAssistant ? (
          <AssistenteChatWithPending
            key={activeSessionId || activeAssistantId}
            assistant={activeAssistant}
            session={activeSession}
            onNewSession={handleCreateSession}
            onSendWithoutSession={handleSendWithoutSession}
            pendingMessageRef={pendingMessageRef}
          />
        ) : (
          <div className="flex-1 h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground bg-background/50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 shadow-lg shadow-primary/5"
            >
              <Sparkles className="w-8 h-8 text-primary" />
            </motion.div>
            <h3 className="text-lg font-semibold text-foreground">Bem-vindo aos Assistentes</h3>
            <p className="max-w-sm mt-2 text-sm">Toque no seletor acima para escolher ou criar um assistente.</p>
          </div>
        )}
      </div>

      {/* Bottom sheets */}
      <AssistantPickerSheet
        open={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        assistants={assistants}
        activeAssistantId={activeAssistantId}
        onSelectAssistant={(id) => { setActiveAssistantId(id); setActiveSessionId(null); }}
        onCreateAssistant={() => { setEditingAssistant(undefined); setIsDialogOpen(true); }}
        onEditAssistant={(assistant) => { setEditingAssistant(assistant); setIsDialogOpen(true); }}
      />

      <SessionHistorySheet
        open={isHistoryOpen}
        onOpenChange={setIsHistoryOpen}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => setActiveSessionId(id)}
        onCreateSession={handleCreateSession}
        onDeleteSession={async (id) => {
          await deleteSession.mutateAsync(id);
          if (activeSessionId === id) setActiveSessionId(null);
        }}
      />

      <AssistenteDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialData={editingAssistant}
        onSave={handleSaveAssistant}
        onDelete={handleDeleteAssistant}
        isSaving={createAssistant.isPending || updateAssistant.isPending}
      />
    </div>
  );
}

function AssistenteChatWithPending({
  assistant, session, onNewSession, onSendWithoutSession, pendingMessageRef,
}: {
  assistant: AIAssistant;
  session: import("../types").AIChatSession | null;
  onNewSession: () => void;
  onSendWithoutSession: (message: string, images: string[], documents?: ChatDocument[]) => void;
  pendingMessageRef: React.MutableRefObject<{ content: string; images: string[]; documents?: ChatDocument[] } | null>;
}) {
  const sentRef = useRef(false);

  useEffect(() => {
    if (session && pendingMessageRef.current && !sentRef.current) {
      sentRef.current = true;
      const { content, images, documents } = pendingMessageRef.current;
      pendingMessageRef.current = null;
      const timer = setTimeout(() => {
        const sendEvent = new CustomEvent('pending-message', { detail: { content, images, documents, sessionId: session.id } });
        window.dispatchEvent(sendEvent);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [session, pendingMessageRef]);

  return (
    <AssistenteChat
      assistant={assistant}
      session={session}
      onNewSession={onNewSession}
      onSendWithoutSession={onSendWithoutSession}
    />
  );
}
