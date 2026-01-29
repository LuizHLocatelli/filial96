import { motion } from 'framer-motion';
import { Bot, MessageCircle, Settings, Trash2, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ChatbotCardProps } from '../types';

export function ChatbotCard({ chatbot, onChat, onEdit, onDelete, isManager }: ChatbotCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="group relative bg-card border border-border/50 rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300"
    >
      <div className="flex items-start gap-3 md:gap-4">
        <div className="relative shrink-0">
          <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center ${
            chatbot.is_active 
              ? 'bg-gradient-to-br from-primary/20 to-primary/5' 
              : 'bg-muted'
          }`}>
            <Bot className={`h-6 w-6 md:h-7 md:w-7 ${
              chatbot.is_active ? 'text-primary' : 'text-muted-foreground'
            }`} />
          </div>
          <span className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-card ${
            chatbot.is_active ? 'bg-green-500' : 'bg-red-500'
          }`}>
            {chatbot.is_active && (
              <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
            )}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-base md:text-lg truncate">
              {chatbot.name}
            </h3>
            <Badge 
              variant={chatbot.is_active ? 'default' : 'secondary'}
              className={`shrink-0 text-xs ${
                chatbot.is_active 
                  ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' 
                  : ''
              }`}
            >
              {chatbot.is_active ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs md:text-sm text-muted-foreground">
              Criado em {formatDate(chatbot.created_at)}
            </p>
            
            {chatbot.accept_images && (
              <Badge variant="outline" className="text-xs gap-1">
                <Image className="h-3 w-3" />
                Imagens
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-4 pt-4 border-t border-border/50">
        <Button
          onClick={onChat}
          className="flex-1 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
          disabled={!chatbot.is_active}
          size="sm"
        >
          <MessageCircle className="h-4 w-4" />
          Conversar
        </Button>

        {isManager && (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={onEdit}
              className="h-9 w-9"
            >
              <Settings className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={onDelete}
              className="h-9 w-9 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </motion.div>
  );
}
