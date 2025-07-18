import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatBotMessage } from './ChatBotMessage';
import { ChatBotTyping } from './ChatBotTyping';
import { type ChatMessage } from './useChatBot';
import { motion } from 'framer-motion';

interface ChatBotMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
  isTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export function ChatBotMessages({ 
  messages, 
  isLoading, 
  isTyping, 
  messagesEndRef 
}: ChatBotMessagesProps) {
  return (
    <ScrollArea className="flex-1 p-4 bg-muted/20">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="space-y-5"
      >
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: index * 0.1,
              duration: 0.3,
              ease: "easeOut"
            }}
          >
            <ChatBotMessage message={message} />
          </motion.div>
        ))}

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ChatBotTyping />
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </motion.div>
    </ScrollArea>
  );
}