import { ChevronDown, History, Plus, Settings } from "@/components/ui/emoji-icons";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
import type { AIAssistant, AIChatSession } from "../types";

interface AssistentesTopBarProps {
  assistant: AIAssistant | null;
  session: AIChatSession | null;
  sessionsCount: number;
  onOpenAssistantPicker: () => void;
  onOpenSessionHistory: () => void;
  onEditAssistant: () => void;
  onNewSession: () => void;
}

export function AssistentesTopBar({
  assistant,
  session,
  sessionsCount,
  onOpenAssistantPicker,
  onOpenSessionHistory,
  onEditAssistant,
  onNewSession,
}: AssistentesTopBarProps) {
  const { profile } = useAuth();
  const canEdit = assistant && (assistant.user_id === profile?.id || profile?.role === 'gerente');

  return (
    <div className="flex items-center gap-2 px-3 py-2.5 border-b bg-card/80 backdrop-blur-sm shrink-0">
      {/* Assistant selector */}
      <button
        onClick={onOpenAssistantPicker}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-muted/60 active:bg-muted transition-colors min-w-0 flex-shrink"
      >
        {assistant ? (
          <>
            <span className="w-8 h-8 shrink-0 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center text-sm shadow-sm">
              {assistant.avatar_icon}
            </span>
            <div className="min-w-0 text-left hidden sm:block">
              <span className="block text-sm font-semibold truncate max-w-[140px]">{assistant.name}</span>
            </div>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">Selecionar assistente</span>
        )}
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      </button>

      {/* Divider */}
      {assistant && <div className="w-px h-5 bg-border/60 shrink-0" />}

      {/* Session info / history */}
      {assistant && (
        <button
          onClick={onOpenSessionHistory}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-muted/60 active:bg-muted transition-colors min-w-0 flex-1"
        >
          <History className="w-4 h-4 text-muted-foreground/60 shrink-0" />
          <span className="text-sm truncate text-muted-foreground">
            {session ? session.title : `${sessionsCount} conversa${sessionsCount !== 1 ? 's' : ''}`}
          </span>
        </button>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0 ml-auto">
        {assistant && (
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-lg"
            onClick={onNewSession}
            title="Nova Conversa"
          >
            <Plus className="w-4 h-4" />
          </Button>
        )}
        {canEdit && (
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-lg"
            onClick={onEditAssistant}
            title="Editar Assistente"
          >
            <Settings className="w-4 h-4 text-muted-foreground" />
          </Button>
        )}
      </div>
    </div>
  );
}
