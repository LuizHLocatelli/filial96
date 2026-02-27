import { useState } from "react";
import { Plus, Settings, MessageSquare, Bot, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { AIAssistant, AIChatSession } from "../types";

import { useAuth } from "@/contexts/auth";

interface AssistentesSidebarProps {
  assistants: AIAssistant[];
  sessions: AIChatSession[];
  activeAssistantId: string | null;
  activeSessionId: string | null;
  onSelectAssistant: (id: string) => void;
  onSelectSession: (id: string) => void;
  onCreateAssistant: () => void;
  onEditAssistant: (assistant: AIAssistant) => void;
  onDeleteSession: (id: string) => void;
}

export function AssistentesSidebar({
  assistants,
  sessions,
  activeAssistantId,
  activeSessionId,
  onSelectAssistant,
  onSelectSession,
  onCreateAssistant,
  onEditAssistant,
  onDeleteSession
}: AssistentesSidebarProps) {
  const { profile } = useAuth();
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  return (
    <div className="w-full sm:w-64 md:w-80 flex flex-col h-full bg-background border-r">
      <div className="p-4 border-b flex justify-between items-center bg-muted/20">
        <h2 className="font-semibold flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          Assistentes IA
        </h2>
        <Button size="icon" variant="ghost" onClick={onCreateAssistant} title="Criar Assistente">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-4">
          <div>
            <h3 className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">Assistentes Disponíveis</h3>
            {assistants.length === 0 ? (
              <p className="px-2 py-4 text-sm text-muted-foreground text-center">
                Nenhum assistente criado ainda.
              </p>
            ) : (
              <div className="space-y-1 mt-1">
                {assistants.map(assistant => (
                  <div 
                    key={assistant.id}
                    className={`flex items-center justify-between group rounded-md transition-colors ${
                      activeAssistantId === assistant.id 
                        ? 'bg-primary/10 text-primary' 
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    <button
                      className="flex-1 flex items-center gap-2 p-2 text-left truncate text-sm"
                      onClick={() => onSelectAssistant(assistant.id)}
                    >
                      <span className="w-6 h-6 shrink-0 rounded bg-background flex items-center justify-center border shadow-sm text-xs">
                        {assistant.avatar_icon}
                      </span>
                      <span className="truncate font-medium">{assistant.name}</span>
                    </button>
                    {(assistant.user_id === profile?.id || profile?.role === 'gerente') && (
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="opacity-0 group-hover:opacity-100 h-8 w-8 mr-1 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditAssistant(assistant);
                        }}
                        title="Editar Assistente"
                      >
                        <Settings className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {activeAssistantId && (
            <div>
              <h3 className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">Conversas Recentes</h3>
              <div className="space-y-1 mt-1">
                {sessions.length === 0 ? (
                  <p className="px-2 py-2 text-sm text-muted-foreground italic">Nenhuma conversa encontrada.</p>
                ) : (
                  sessions.map(session => (
                    <div 
                      key={session.id}
                      className={`flex items-center justify-between group rounded-md transition-colors ${
                        activeSessionId === session.id 
                          ? 'bg-secondary text-secondary-foreground font-medium' 
                          : 'hover:bg-muted text-foreground'
                      }`}
                    >
                      <button
                        className="flex-1 flex items-center gap-2 p-2 rounded-md text-left text-sm"
                        onClick={() => onSelectSession(session.id)}
                      >
                        <MessageSquare className="w-4 h-4 shrink-0 opacity-70" />
                        <span className="truncate">{session.title}</span>
                      </button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="opacity-0 group-hover:opacity-100 h-8 w-8 mr-1 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSessionToDelete(session.id);
                        }}
                        title="Apagar Conversa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <AlertDialog open={!!sessionToDelete} onOpenChange={(open) => !open && setSessionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar Conversa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja apagar esta conversa? Todo o histórico de mensagens será perdido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (sessionToDelete) {
                  onDeleteSession(sessionToDelete);
                  setSessionToDelete(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Apagar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
