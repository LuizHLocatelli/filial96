import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMobileDialog } from '@/hooks/useMobileDialog';
import { ChatBotHeader } from './ChatBotHeader';
import { ChatBotMessages } from './ChatBotMessages';
import { ChatBotInput } from './ChatBotInput';
import { useChatBot } from './useChatBot';
import { cn } from '@/lib/utils';

interface ChatBotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatBotModal({ isOpen, onClose }: ChatBotModalProps) {
  const isMobile = useIsMobile();
  const { getMobileDialogProps } = useMobileDialog();
  const chatBot = useChatBot();

  // Sincronizar estado do chatbot com o modal
  useEffect(() => {
    if (isOpen && !chatBot.isOpen) {
      chatBot.openChat();
    } else if (!isOpen && chatBot.isOpen) {
      chatBot.closeChat();
    }
  }, [isOpen, chatBot]);

  // Fechar com Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: isMobile ? 50 : 0,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: isMobile ? 50 : 0,
    },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
              duration: 0.4,
            }}
            className={cn(
              "fixed z-[101] bg-background border border-border shadow-2xl overflow-hidden",
              isMobile
                ? "bottom-4 right-4 w-[calc(100%-2rem)] h-[70vh] max-h-[500px] rounded-2xl"
                : "bottom-8 right-8 w-[420px] h-[650px] max-h-[85vh] rounded-2xl"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              <ChatBotHeader onClose={onClose} onClear={chatBot.clearConversation} />
              
              <ChatBotMessages
                messages={chatBot.messages}
                isLoading={chatBot.isLoading}
                isTyping={chatBot.isTyping}
                messagesEndRef={chatBot.messagesEndRef}
              />
              
              <ChatBotInput
                onSendMessage={chatBot.sendMessage}
                isLoading={chatBot.isLoading}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}