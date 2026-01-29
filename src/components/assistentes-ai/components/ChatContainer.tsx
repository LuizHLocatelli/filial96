import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatHeader } from './ChatHeader';
import { ChatInput } from './ChatInput';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { useChat } from '../hooks/useChat';
import type { ChatInterfaceProps } from '../types';

export function ChatContainer({ chatbot, onBack }: ChatInterfaceProps) {
  const { 
    messages, 
    loading, 
    error, 
    isTyping, 
    typingText,
    sendMessage, 
    retryMessage, 
    clearConversation 
  } = useChat(chatbot);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, typingText, isTyping]);

  const handleSend = (content: string, imageFile?: File) => {
    sendMessage(content, imageFile);
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-80px)] md:h-[calc(100vh-100px)] bg-background">
      <ChatHeader 
        chatbot={chatbot} 
        onBack={onBack} 
        onClear={clearConversation}
        messageCount={messages.length}
      />

      <div 
        ref={scrollAreaRef}
        className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4 md:space-y-6 scroll-smooth"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <AnimatePresence mode="popLayout">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center py-16 md:py-24 text-center px-4"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 border border-primary/20">
                <Bot className="h-10 w-10 md:h-12 md:w-12 text-primary/60" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">
                Olá! Eu sou o {chatbot.name}
              </h3>
              <p className="text-muted-foreground text-sm md:text-base max-w-sm">
                Como posso ajudar você hoje? Sinta-se à vontade para perguntar qualquer coisa.
              </p>
            </motion.div>
          )}

          {messages.map((message, index) => (
            <MessageBubble 
              key={message.id} 
              message={message} 
              isLast={index === messages.length - 1}
            />
          ))}

          {(loading || isTyping) && <TypingIndicator />}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-destructive/10 border border-destructive/20 rounded-2xl rounded-tl-none px-4 py-3 max-w-[85%] md:max-w-[75%]">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-destructive mb-2">{error}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={retryMessage}
                      className="h-8 text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
                    >
                      <RefreshCcw className="h-3.5 w-3.5 mr-1" />
                      Tentar novamente
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div ref={messagesEndRef} className="h-4 shrink-0" />
      </div>

      <ChatInput
        onSend={handleSend}
        disabled={loading || !chatbot.is_active}
        acceptImages={chatbot.accept_images}
        placeholder={chatbot.is_active ? 'Digite sua mensagem...' : 'Assistente offline'}
      />
    </div>
  );
}
