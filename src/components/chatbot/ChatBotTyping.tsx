import { Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function ChatBotTyping() {
  return (
    <div className="flex items-start space-x-3 max-w-full">
      {/* Avatar */}
      <div className="flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 bg-muted text-muted-foreground">
        <Bot className="h-4 w-4" />
      </div>

      {/* Typing Indicator */}
      <div className="flex flex-col items-start">
        <div className="px-3 py-2 rounded-2xl rounded-bl-md bg-muted">
          <div className="flex items-center space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-muted-foreground/50 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </div>
        
        <span className="text-xs text-muted-foreground mt-1 px-1">
          Digitando...
        </span>
      </div>
    </div>
  );
}