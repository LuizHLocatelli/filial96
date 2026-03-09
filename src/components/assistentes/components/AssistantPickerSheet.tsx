import { useState } from "react";
import { Bot, Plus, Settings, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAuth } from "@/contexts/auth";
import { motion, AnimatePresence } from "framer-motion";
import type { AIAssistant } from "../types";

interface AssistantPickerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assistants: AIAssistant[];
  activeAssistantId: string | null;
  onSelectAssistant: (id: string) => void;
  onCreateAssistant: () => void;
  onEditAssistant: (assistant: AIAssistant) => void;
}

export function AssistantPickerSheet({
  open,
  onOpenChange,
  assistants,
  activeAssistantId,
  onSelectAssistant,
  onCreateAssistant,
  onEditAssistant,
}: AssistantPickerSheetProps) {
  const { profile } = useAuth();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[55dvh] p-0 border-t overflow-hidden w-full max-w-full">
        <SheetHeader className="px-5 pt-5 pb-3">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/20 mx-auto mb-3" />
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-base">
              <Sparkles className="w-4 h-4 text-primary" />
              Assistentes
            </SheetTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                onCreateAssistant();
              }}
              className="h-8 rounded-lg gap-1.5 text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Novo
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 max-h-[calc(55dvh-5rem)]">
          <div className="px-3 pb-5 space-y-1 w-full overflow-hidden">
            <AnimatePresence>
              {assistants.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                    <Bot className="w-7 h-7 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm text-muted-foreground">Nenhum assistente criado.</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Toque em "Novo" para criar.</p>
                </div>
              ) : (
                assistants.map((assistant, idx) => {
                  const isActive = activeAssistantId === assistant.id;
                  const canEdit = assistant.user_id === profile?.id || profile?.role === 'gerente';

                  return (
                    <motion.button
                      key={assistant.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-150 overflow-hidden ${
                        isActive
                          ? 'bg-primary/10 ring-1 ring-primary/20'
                          : 'hover:bg-muted/60 active:bg-muted'
                      }`}
                      onClick={() => {
                        onSelectAssistant(assistant.id);
                        onOpenChange(false);
                      }}
                    >
                      <span className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-lg shadow-sm transition-colors ${
                        isActive
                          ? 'bg-primary/15 border border-primary/20'
                          : 'bg-card border border-border/50'
                      }`}>
                        {assistant.avatar_icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className={`block truncate text-sm ${isActive ? 'font-semibold text-primary' : 'font-medium'}`}>
                          {assistant.name}
                        </span>
                        {assistant.description && (
                          <span className="block truncate text-xs text-muted-foreground/70 mt-0.5">
                            {assistant.description}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {isActive && (
                          <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-primary" />
                          </div>
                        )}
                        {canEdit && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 rounded-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenChange(false);
                              onEditAssistant(assistant);
                            }}
                          >
                            <Settings className="w-3.5 h-3.5 text-muted-foreground" />
                          </Button>
                        )}
                      </div>
                    </motion.button>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
