import { useState } from "react";
import { Plus, Settings, MessageSquare, Bot, Trash2, Sparkles } from "lucide-react";
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
    <div className="w-full sm:w-64 md:w-80 flex flex-col h-full bg-card/50 border-r">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-primary/5 to-transparent">
        <h2 className="font-semibold flex items-center gap-2.5 text-sm">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          Assistentes IA
        </h2>
        <Button 
          size="icon" 
          variant="ghost" 
          onClick={onCreateAssistant} 
          title="Criar Assistente"
          className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2.5 space-y-5">
          {/* Assistants section */}
          <div>
            <h3 className="px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-widest">Assistentes</h3>
            {assistants.length === 0 ? (
              <div className="px-3 py-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                  <Bot className="w-6 h-6 text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground">Nenhum assistente criado.</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Clique em + para criar um.</p>
              </div>
            ) : (
              <div className="space-y-0.5 mt-1">
                {assistants.map(assistant => (
                  <div 
                    key={assistant.id}
                    className={`flex items-center justify-between group rounded-xl transition-all duration-150 ${
                      activeAssistantId === assistant.id 
                        ? 'bg-primary/10 text-primary shadow-sm' 
                        : 'hover:bg-muted/60 text-foreground'
                    }`}
                  >
                    <button
                      className="flex-1 flex items-center gap-2.5 p-2.5 text-left truncate text-sm"
                      onClick={() => onSelectAssistant(assistant.id)}
                    >
                      <span className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-sm shadow-sm transition-colors ${
                        activeAssistantId === assistant.id
                          ? 'bg-primary/20 border border-primary/20'
                          : 'bg-card border border-border/50'
                      }`}>
                        {assistant.avatar_icon}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="truncate font-medium text-[13px]">{assistant.name}</span>
                        {assistant.description && (
                          <span className="truncate text-[11px] text-muted-foreground/60">{assistant.description}</span>
                        )}
                      </div>
                    </button>
                    {(assistant.user_id === profile?.id || profile?.role === 'gerente') && (
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 h-7 w-7 mr-1.5 transition-opacity rounded-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditAssistant(assistant);
                        }}
                        title="Editar Assistente"
                      >
                        <Settings className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sessions section */}
          {activeAssistantId && (
            <div>
              <h3 className="px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-widest">Conversas</h3>
              <div className="space-y-0.5 mt-1">
                {sessions.length === 0 ? (
                  <div className="px-3 py-4 text-center">
                    <p className="text-xs text-muted-foreground/60 italic">Nenhuma conversa ainda.</p>
                  </div>
                ) : (
                  sessions.map(session => (
                    <div 
                      key={session.id}
                      className={`flex items-center justify-between group rounded-xl transition-all duration-150 ${
                        activeSessionId === session.id 
                          ? 'bg-secondary text-secondary-foreground font-medium shadow-sm' 
                          : 'hover:bg-muted/60 text-foreground'
                      }`}
                    >
                      <button
                        className="flex-1 flex items-center gap-2.5 p-2.5 rounded-xl text-left text-[13px]"
                        onClick={() => onSelectSession(session.id)}
                      >
                        <MessageSquare className={`w-4 h-4 shrink-0 ${
                          activeSessionId === session.id ? 'opacity-100' : 'opacity-40'
                        }`} />
                        <span className="truncate">{session.title}</span>
                      </button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 h-7 w-7 mr-1.5 transition-opacity rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
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
