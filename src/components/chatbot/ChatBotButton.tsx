import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatBotButtonProps {
  isOpen: boolean;
  onClick: () => void;
  hasUnreadMessages?: boolean;
}

export function ChatBotButton({ isOpen, onClick, hasUnreadMessages = false }: ChatBotButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="relative"
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={onClick}
        className={cn(
          "h-full w-full relative",
          "transition-all duration-200",
          "hover:bg-transparent",
          isOpen && "text-primary"
        )}
        aria-label={isOpen ? "Fechar chat" : "Abrir chat"}
      >
        <MessageCircle className="h-5 w-5" />
        
        {/* Indicador de mensagens não lidas */}
        {hasUnreadMessages && !isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full"
          />
        )}
      </Button>
    </motion.div>
  );
}