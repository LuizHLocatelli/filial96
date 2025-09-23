import { useState, useEffect } from "react";
import { Plus, Bot, MessageCircle, Settings, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CreateChatbotDialog } from "./CreateChatbotDialog";
import { ChatInterface } from "./ChatInterface";
import { EditChatbotDialog } from "./EditChatbotDialog";
import { DeleteChatbotDialog } from "./DeleteChatbotDialog";

interface Chatbot {
  id: string;
  name: string;
  webhook_url: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export default function AssistentesAI() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [selectedChatbot, setSelectedChatbot] = useState<Chatbot | null>(null);

  const isManager = profile?.role === 'gerente';

  useEffect(() => {
    fetchChatbots();
  }, []);

  const fetchChatbots = async () => {
    try {
      const { data, error } = await supabase
        .from('assistentes_chatbots')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChatbots(data || []);
    } catch (error) {
      console.error('Error fetching chatbots:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os assistentes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChatbotCreated = () => {
    setShowCreateDialog(false);
    fetchChatbots();
    toast({
      title: "Sucesso",
      description: "Assistente criado com sucesso!",
    });
  };

  const handleChatbotUpdated = () => {
    setShowEditDialog(false);
    setSelectedChatbot(null);
    fetchChatbots();
    toast({
      title: "Sucesso",
      description: "Assistente atualizado com sucesso!",
    });
  };

  const handleChatbotDeleted = () => {
    setShowDeleteDialog(false);
    setSelectedChatbot(null);
    fetchChatbots();
    toast({
      title: "Sucesso",
      description: "Assistente excluído com sucesso!",
    });
  };

  const openChat = (chatbot: Chatbot) => {
    setSelectedChatbot(chatbot);
    setShowChat(true);
  };

  const openEdit = (chatbot: Chatbot) => {
    setSelectedChatbot(chatbot);
    setShowEditDialog(true);
  };

  const openDelete = (chatbot: Chatbot) => {
    setSelectedChatbot(chatbot);
    setShowDeleteDialog(true);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (showChat && selectedChatbot) {
    return (
      <ChatInterface
        chatbot={selectedChatbot}
        onBack={() => setShowChat(false)}
      />
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 w-full max-w-full">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight break-words">Assistentes de IA</h2>
        </div>
        {isManager && (
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Novo Assistente
          </Button>
        )}
      </div>

      {chatbots.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 px-4">
            <Bot className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-center">Nenhum assistente encontrado</h3>
            <p className="text-muted-foreground text-center mb-4 text-sm md:text-base">
              {isManager
                ? "Crie seu primeiro assistente de IA para começar a automatizar atendimentos."
                : "Os assistentes de IA aparecerão aqui quando forem criados pelos gerentes."}
            </p>
            {isManager && (
              <Button onClick={() => setShowCreateDialog(true)} className="gap-2 w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                Criar Primeiro Assistente
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 w-full max-w-full">
          {chatbots.map((chatbot) => (
            <Card key={chatbot.id} className="hover:shadow-md transition-shadow w-full max-w-full overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2 w-full">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Bot className="h-5 w-5 text-primary flex-shrink-0" />
                    <CardTitle className="text-lg truncate min-w-0">{chatbot.name}</CardTitle>
                  </div>
                  <Badge
                    variant={chatbot.is_active ? "default" : "secondary"}
                    className="flex-shrink-0 whitespace-nowrap"
                  >
                    {chatbot.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <CardDescription className="text-xs md:text-sm text-muted-foreground">
                  Criado em {new Date(chatbot.created_at).toLocaleDateString('pt-BR')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => openChat(chatbot)}
                    className="w-full gap-2"
                    disabled={!chatbot.is_active}
                    size="sm"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Conversar
                  </Button>
                  
                  {isManager && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(chatbot)}
                        className="flex-1 gap-2"
                      >
                        <Settings className="h-4 w-4" />
                        <span className="hidden xs:inline">Editar</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDelete(chatbot)}
                        className="gap-2 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden xs:inline">Excluir</span>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialogs */}
      {isManager && (
        <>
          <CreateChatbotDialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            onSuccess={handleChatbotCreated}
          />
          
          <EditChatbotDialog
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            chatbot={selectedChatbot}
            onSuccess={handleChatbotUpdated}
          />
          
          <DeleteChatbotDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            chatbot={selectedChatbot}
            onSuccess={handleChatbotDeleted}
          />
        </>
      )}
    </div>
  );
}