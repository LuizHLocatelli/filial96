import { cn } from '@/lib/utils';
import { Bot, User, AlertCircle } from 'lucide-react';
import { type ChatMessage } from './useChatBot';
import ReactMarkdown from 'react-markdown';

interface ChatBotMessageProps {
  message: ChatMessage;
}

export function ChatBotMessage({ message }: ChatBotMessageProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className={cn(
        "flex items-start space-x-3 max-w-full",
        message.isUser ? "flex-row-reverse space-x-reverse" : ""
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0",
          message.isUser
            ? "bg-primary text-primary-foreground"
            : message.isError
            ? "bg-destructive/10 text-destructive"
            : "bg-muted text-muted-foreground"
        )}
      >
        {message.isUser ? (
          <User className="h-4 w-4" />
        ) : message.isError ? (
          <AlertCircle className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          "flex flex-col max-w-[calc(100%-3rem)]",
          message.isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "px-3 py-2 rounded-2xl text-sm break-words",
            message.isUser
              ? "bg-primary text-primary-foreground rounded-br-md"
              : message.isError
              ? "bg-destructive/10 text-destructive border border-destructive/20 rounded-bl-md"
              : "bg-muted text-foreground rounded-bl-md"
          )}
        >
          {message.isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                code: ({ children }) => (
                  <code className="bg-background/50 px-1 py-0.5 rounded text-xs font-mono">
                    {children}
                  </code>
                ),
                ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {/* Timestamp */}
        <span className="text-xs text-muted-foreground mt-1 px-1">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}