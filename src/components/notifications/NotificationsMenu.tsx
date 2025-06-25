import { useState } from "react";
import { 
  Bell, 
  Check, 
  CheckCheck, 
  CalendarClock,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Notification, useNotifications } from "@/hooks/useNotifications";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

export function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    isLoading, 
    refreshNotifications 
  } = useNotifications();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleMarkAllRead = () => {
    markAllAsRead();
  };
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshNotifications();
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: ptBR
      });
    } catch (error) {
      console.error("Erro ao formatar data:", error, dateString);
      return "data desconhecida";
    }
  };
  
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    // Navegar para a página de entregas e retiradas se a notificação tiver um task_id
    if (notification.task_id) {
      setOpen(false);
      
      // Navegar para a página de entregas com os parâmetros necessários para abrir o diálogo de detalhes
      navigate(`/entregas?taskId=${notification.task_id}&action=view`);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notificações"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs font-medium">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <div className="flex justify-between items-center p-2">
          <DropdownMenuLabel className="flex items-center gap-2">
            Notificações
            {unreadCount > 0 && (
              <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                {unreadCount} nova{unreadCount !== 1 ? 's' : ''}
              </span>
            )}
          </DropdownMenuLabel>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="sm"
              className="touch-friendly p-0" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Atualizar notificações"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 px-2 text-xs" 
                onClick={handleMarkAllRead}
                title="Marcar todas como lidas"
              >
                <CheckCheck className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        
        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Carregando notificações...
            </div>
          </div>
        ) : notifications.length > 0 ? (
          <ScrollArea className="h-[400px]">
            <div className="space-y-1">
              {notifications.map((notification) => (
                <DropdownMenuItem 
                  key={notification.id}
                  className={`p-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                    !notification.isRead ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className={`p-2 rounded-full flex-shrink-0 ${
                      !notification.isRead ? 'bg-primary/20' : 'bg-muted'
                    }`}>
                      <CalendarClock className={`h-4 w-4 ${
                        !notification.isRead ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <p className={`text-sm font-medium leading-none truncate ${
                        !notification.isRead ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(notification.created_at)}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <span className="h-2.5 w-2.5 rounded-full bg-primary flex-shrink-0 mt-1" />
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
              <div>
                <p className="font-medium">Nenhuma notificação</p>
                <p className="text-xs">Você está em dia!</p>
              </div>
            </div>
          </div>
        )}
        

      </DropdownMenuContent>
    </DropdownMenu>
  );
}
