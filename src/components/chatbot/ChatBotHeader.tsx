import { X, Trash2, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface ChatBotHeaderProps {
  onClose: () => void;
  onClear: () => void;
}

export function ChatBotHeader({ onClose, onClear }: ChatBotHeaderProps) {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1, duration: 0.3 }}
      className="flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur-sm rounded-t-2xl"
    >
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
          <Bot className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-sm text-foreground">Assistente Virtual</h3>
          <p className="text-xs text-muted-foreground">Online</p>
        </div>
      </div>

      <div className="flex items-center space-x-1">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClear}
            className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
            aria-label="Limpar conversa"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-muted"
            aria-label="Fechar chat"
          >
            <X className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}