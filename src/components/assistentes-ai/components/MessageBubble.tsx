import { motion } from 'framer-motion';
import { Bot, User, Check, CheckCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { MessageBubbleProps } from '../types';

export function MessageBubble({ message, isLast }: MessageBubbleProps) {
  const isUser = message.type === 'user';
  
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStatus = () => {
    if (!isUser || !isLast) return null;
    
    const status = message.status || 'sent';
    
    return (
      <span className="ml-1 inline-flex items-center">
        {status === 'sent' && <Check className="h-3 w-3 text-primary-foreground/60" />}
        {status === 'delivered' && <CheckCheck className="h-3 w-3 text-primary-foreground/60" />}
        {status === 'read' && <CheckCheck className="h-3 w-3 text-blue-400" />}
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        type: 'spring',
        stiffness: 300,
        damping: 25,
        duration: 0.3 
      }}
      className={`flex gap-2 md:gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}

      <div
        className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-tr-sm'
            : 'bg-muted/50 dark:bg-muted/30 border border-border/50 rounded-tl-sm'
        }`}
      >
        {!isUser ? (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                code: ({ children }) => <code className="bg-primary/10 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>,
                blockquote: ({ children }) => <blockquote className="border-l-4 border-primary/20 pl-3 italic my-2">{children}</blockquote>,
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="leading-relaxed">{message.content}</p>
        )}

        {message.imageUrl && (
          <div className="mt-2 rounded-lg overflow-hidden border border-primary/20">
            <img
              src={message.imageUrl}
              alt="Imagem enviada"
              className="max-w-full h-auto max-h-48 object-contain"
            />
          </div>
        )}

        <div className={`text-[10px] mt-1.5 flex items-center gap-1 ${
          isUser ? 'text-primary-foreground/70 justify-end' : 'text-muted-foreground'
        }`}>
          {formatTime(message.timestamp)}
          {renderStatus()}
        </div>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0 mt-1">
          <User className="h-4 w-4 text-primary" />
        </div>
      )}
    </motion.div>
  );
}
