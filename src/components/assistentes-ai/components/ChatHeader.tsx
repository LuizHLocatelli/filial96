import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCcw, MoreVertical, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ChatHeaderProps } from '../types';

export function ChatHeader({ chatbot, onBack, onClear, messageCount }: ChatHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 bg-background/80 dark:bg-background/60 backdrop-blur-xl border-b border-border/50 px-3 py-3 md:px-4 md:py-4"
    >
      <div className="flex items-center gap-3 max-w-5xl mx-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="shrink-0 h-10 w-10 rounded-xl hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="relative shrink-0">
          <div className="h-10 w-10 md:h-11 md:w-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
            <Bot className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          </div>
          <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${
            chatbot.is_active ? 'bg-green-500' : 'bg-red-500'
          }`}>
            {chatbot.is_active && (
              <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
            )}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-base md:text-lg font-semibold truncate">
            {chatbot.name}
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            {chatbot.is_active ? 'Online' : 'Offline'}
            {messageCount > 0 && ` • ${messageCount} mensagens`}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-10 w-10 rounded-xl hover:bg-muted"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onClear} className="gap-2">
              <RefreshCcw className="h-4 w-4" />
              Nova conversa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}
