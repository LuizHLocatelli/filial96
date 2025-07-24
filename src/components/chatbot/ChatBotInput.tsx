import { useState, useRef, useCallback } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ChatBotInputProps {
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
}

export function ChatBotInput({ onSendMessage, isLoading }: ChatBotInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isLoading) return;

    setMessage('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    await onSendMessage(trimmedMessage);
  }, [message, isLoading, onSendMessage]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setMessage(value);

    // Auto-resize textarea
    const textarea = event.target;
    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    const maxHeight = 120; // ~4 lines
    textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
  }, []);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.3 }}
      className="p-4 border-t border-border bg-background/95 backdrop-blur-sm rounded-b-2xl"
    >
      <div className="flex items-end space-x-2">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem..."
            disabled={isLoading}
            className={cn(
              "min-h-[40px] max-h-[120px] resize-none",
              "border-2 rounded-xl transition-all duration-200",
              "focus:border-primary/50 focus:ring-0",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          />
        </div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={handleSend}
            disabled={!message.trim() || isLoading}
            size="icon"
            className={cn(
              "h-10 w-10 rounded-xl",
              "transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            aria-label="Enviar mensagem"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </motion.div>
      </div>

      {/* Character counter and hints */}
      {message.length > 0 && (
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>Enter para enviar, Shift+Enter para nova linha</span>
          <span className={cn(
            message.length > 1000 && "text-orange-500",
            message.length > 1500 && "text-destructive"
          )}>
            {message.length}/2000
          </span>
        </div>
      )}
    </motion.div>
  );
}