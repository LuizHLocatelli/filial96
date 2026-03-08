import { useState, useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AssistentesSidebar } from "./AssistentesSidebar";
import { AssistenteChat } from "./AssistenteChat";
import { AssistenteDialog } from "./AssistenteDialog";
import { useAssistants, useChatSessions } from "../hooks/useAssistants";
import { useGenerateTitle } from "../hooks/useGenerateTitle";
import type { AIAssistant } from "../types";

export function AssistentesHub() {
  const { assistants = [], isLoading: isLoadingAssistants, createAssistant, updateAssistant, deleteAssistant } = useAssistants();
  const [activeAssistantId, setActiveAssistantId] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(true);
  
  const { sessions = [], createSession, deleteSession } = useChatSessions(activeAssistantId || undefined);
  const { generateTitle } = useGenerateTitle();

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAssistant, setEditingAssistant] = useState<AIAssistant | undefined>(undefined);

  // Pending message to send after session creation
  const pendingMessageRef = useRef<{ content: string; images: string[] } | null>(null);

  // Auto-select first assistant if none selected
  useEffect(() => {
    if (!activeAssistantId && assistants.length > 0) {
      setActiveAssistantId(assistants[0].id);
    }
  }, [assistants, activeAssistantId]);

  // Handle assistant creation/update
  const handleSaveAssistant = async (data: Omit<AIAssistant, "id" | "created_at" | "updated_at" | "user_id">) => {
    if (editingAssistant) {
      await updateAssistant.mutateAsync({ ...data, id: editingAssistant.id });
    } else {
      const newAssistant = await createAssistant.mutateAsync(data);
      if (newAssistant) {
        setActiveAssistantId(newAssistant.id);
      }
    }
    setIsDialogOpen(false);
  };

  const handleDeleteAssistant = async (id: string) => {
    await deleteAssistant.mutateAsync(id);
    if (activeAssistantId === id) {
      setActiveAssistantId(null);
      setActiveSessionId(null);
    }
    setIsDialogOpen(false);
  };

  const handleCreateSession = async () => {
    if (!activeAssistantId) return;
    const session = await createSession.mutateAsync({
      assistant_id: activeAssistantId,
      title: `Conversa ${new Date().toLocaleDateString()}`
    });
    if (session) {
      setActiveSessionId(session.id);
    }
  };

  // Auto-create session when user sends first message without a session
  const handleSendWithoutSession = async (message: string, images: string[]) => {
    if (!activeAssistantId) return;

    // Generate a dynamic title from the message
    const title = await generateTitle(message);

    const session = await createSession.mutateAsync({
      assistant_id: activeAssistantId,
      title,
    });
    if (session) {
      pendingMessageRef.current = { content: message, images };
      setActiveSessionId(session.id);
    }
  };

  // Send pending message after session is active
  const activeAssistant = assistants.find(a => a.id === activeAssistantId) || null;
  const activeSession = sessions.find(s => s.id === activeSessionId) || null;

  return (
    <div className="flex flex-col sm:flex-row h-[calc(100vh-12rem)] min-h-[500px] border rounded-xl overflow-hidden bg-background mt-4 shadow-sm relative">
      <div className={`w-full sm:w-auto h-full shrink-0 ${showMobileSidebar ? 'block' : 'hidden sm:block'}`}>
        <AssistentesSidebar
          assistants={assistants}
          sessions={sessions}
          activeAssistantId={activeAssistantId}
          activeSessionId={activeSessionId}
          onSelectAssistant={(id) => {
            setActiveAssistantId(id);
            setActiveSessionId(null);
            setShowMobileSidebar(false);
          }}
          onSelectSession={(id) => {
            setActiveSessionId(id);
            setShowMobileSidebar(false);
          }}
          onCreateAssistant={() => {
            setEditingAssistant(undefined);
            setIsDialogOpen(true);
          }}
          onEditAssistant={(assistant) => {
            setEditingAssistant(assistant);
            setIsDialogOpen(true);
          }}
          onDeleteSession={async (id) => {
            await deleteSession.mutateAsync(id);
            if (activeSessionId === id) {
              setActiveSessionId(null);
            }
          }}
        />
      </div>
      
      <div className={`flex-1 bg-muted/10 relative h-full overflow-hidden ${showMobileSidebar ? 'hidden sm:flex flex-col' : 'flex flex-col'}`}>
        {activeAssistant ? (
          <AssistenteChatWithPending
            key={activeSessionId || activeAssistantId}
            assistant={activeAssistant}
            session={activeSession}
            onNewSession={handleCreateSession}
            onSendWithoutSession={handleSendWithoutSession}
            onBack={() => setShowMobileSidebar(true)}
            pendingMessageRef={pendingMessageRef}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-muted-foreground bg-background/50 relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="sm:hidden absolute top-4 left-4" 
              onClick={() => setShowMobileSidebar(true)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <span className="text-3xl">🤖</span>
            </div>
            <h3 className="text-lg font-medium text-foreground">Nenhum Assistente Selecionado</h3>
            <p className="max-w-md mt-2">
              Selecione um assistente na barra lateral ou crie um novo para começar a conversar.
            </p>
          </div>
        )}
      </div>

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

// Wrapper to handle sending pending message after session mounts
function AssistenteChatWithPending({
  assistant,
  session,
  onNewSession,
  onSendWithoutSession,
  onBack,
  pendingMessageRef,
}: {
  assistant: AIAssistant;
  session: import("../types").AIChatSession | null;
  onNewSession: () => void;
  onSendWithoutSession: (message: string, images: string[]) => void;
  onBack: () => void;
  pendingMessageRef: React.MutableRefObject<{ content: string; images: string[] } | null>;
}) {
  const sentRef = useRef(false);
  const chatRef = useRef<{ sendMessage: (content: string, images: string[]) => void }>(null);

  useEffect(() => {
    if (session && pendingMessageRef.current && !sentRef.current) {
      sentRef.current = true;
      const { content, images } = pendingMessageRef.current;
      pendingMessageRef.current = null;
      
      // Small delay to ensure chat component is mounted and ready
      const timer = setTimeout(() => {
        // Trigger send via the chat component's exposed method
        const sendEvent = new CustomEvent('pending-message', { detail: { content, images, sessionId: session.id } });
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
      onBack={onBack}
    />
  );
}
