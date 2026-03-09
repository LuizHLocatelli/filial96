import { useState } from "react";
import { MessageSquare, Trash2, Plus, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { motion, AnimatePresence } from "framer-motion";
import type { AIChatSession } from "../types";

interface SessionHistorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessions: AIChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onCreateSession: () => void;
  onDeleteSession: (id: string) => void;
}

export function SessionHistorySheet({
  open,
  onOpenChange,
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
}: SessionHistorySheetProps) {
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[70dvh] p-0 border-t">
          <SheetHeader className="px-5 pt-5 pb-3">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/20 mx-auto mb-3" />
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2 text-base">
                <History className="w-4 h-4 text-primary" />
                Conversas
              </SheetTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  onCreateSession();
                }}
                className="h-8 rounded-lg gap-1.5 text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Nova
              </Button>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1 max-h-[calc(70dvh-5rem)]">
            <div className="px-3 pb-5 space-y-1">
              <AnimatePresence>
                {sessions.length === 0 ? (
                  <div className="py-10 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                      <MessageSquare className="w-7 h-7 text-muted-foreground/40" />
                    </div>
                    <p className="text-sm text-muted-foreground">Nenhuma conversa ainda.</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Envie uma mensagem para começar.</p>
                  </div>
                ) : (
                  sessions.map((session, idx) => {
                    const isActive = activeSessionId === session.id;
                    const date = new Date(session.created_at);

                    return (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.025 }}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-150 ${
                          isActive
                            ? 'bg-primary/10 ring-1 ring-primary/20'
                            : 'hover:bg-muted/60 active:bg-muted'
                        }`}
                      >
                        <button
                          className="flex-1 flex items-center gap-3 text-left min-w-0"
                          onClick={() => {
                            onSelectSession(session.id);
                            onOpenChange(false);
                          }}
                        >
                          <div className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center ${
                            isActive ? 'bg-primary/15' : 'bg-muted/50'
                          }`}>
                            <MessageSquare className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground/50'}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className={`block truncate text-sm ${isActive ? 'font-semibold text-primary' : 'font-medium'}`}>
                              {session.title}
                            </span>
                            <span className="block text-[11px] text-muted-foreground/50 mt-0.5">
                              {date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} · {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 shrink-0 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSessionToDelete(session.id);
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!sessionToDelete} onOpenChange={(open) => !open && setSessionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar Conversa</AlertDialogTitle>
            <AlertDialogDescription>
              Todo o histórico de mensagens será perdido permanentemente.
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
    </>
  );
}
