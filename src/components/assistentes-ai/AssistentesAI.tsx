import { useState, useEffect } from "react";
import { Plus, Bot, MessageCircle, Settings, Trash2, Image, Search, Filter, X } from "lucide-react";
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
import { motion, AnimatePresence } from "framer-motion";

interface Chatbot {
  id: string;
  name: string;
  webhook_url: string;
  is_active: boolean;
  accept_images: boolean;
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
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [showFilters, setShowFilters] = useState(false);

  const isManager = profile?.role === 'gerente';

  const filteredChatbots = chatbots.filter(chatbot => {
    const matchesSearch = chatbot.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" ||
      (filterStatus === "active" && chatbot.is_active) ||
      (filterStatus === "inactive" && !chatbot.is_active);
    return matchesSearch && matchesStatus;
  });

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
              <div key={i} className="h-48 bg-muted/50 rounded-lg glass-card"></div>
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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden min-h-[calc(100vh-80px)] bg-animated-gradient">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 w-full max-w-full"
      >
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight break-words bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Assistentes de IA
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base mt-1">
            Gerencie e interaja com seus assistentes inteligentes.
          </p>
        </div>
        {isManager && (
          <Button 
            onClick={() => setShowCreateDialog(true)} 
            className="gap-2 w-full sm:w-auto glass-button-primary shadow-lg"
          >
            <Plus className="h-4 w-4" />
            Novo Assistente
          </Button>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-3 w-full max-w-full"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar assistentes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-primary/20 bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterStatus === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("all")}
            className={`gap-2 ${filterStatus === "all" ? "glass-button-primary" : "glass-button-outline"}`}
          >
            <Filter className="h-4 w-4" />
            Todos
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-xs">
              {chatbots.length}
            </span>
          </Button>
          <Button
            variant={filterStatus === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("active")}
            className={`gap-2 ${filterStatus === "active" ? "bg-green-500/20 text-green-500 border-green-500/30 hover:bg-green-500/30" : "glass-button-outline"}`}
          >
            Ativos
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-green-500/10 text-xs">
              {chatbots.filter(c => c.is_active).length}
            </span>
          </Button>
          <Button
            variant={filterStatus === "inactive" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("inactive")}
            className={`gap-2 ${filterStatus === "inactive" ? "bg-red-500/20 text-red-500 border-red-500/30 hover:bg-red-500/30" : "glass-button-outline"}`}
          >
            Inativos
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-red-500/10 text-xs">
              {chatbots.filter(c => !c.is_active).length}
            </span>
          </Button>
        </div>
      </motion.div>

      {chatbots.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="glass-card border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 px-4">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Bot className="h-16 w-16 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">Nenhum assistente encontrado</h3>
              <p className="text-muted-foreground text-center mb-6 text-sm md:text-base max-w-md">
                {isManager
                  ? "Crie seu primeiro assistente de IA para começar a automatizar atendimentos e melhorar a produtividade."
                  : "Os assistentes de IA aparecerão aqui quando forem criados pelos gerentes."}
              </p>
              {isManager && (
                <Button onClick={() => setShowCreateDialog(true)} className="gap-2 w-full sm:w-auto glass-button-primary">
                  <Plus className="h-4 w-4" />
                  Criar Primeiro Assistente
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ) : filteredChatbots.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="glass-card border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 px-4">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Search className="h-16 w-16 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">Nenhum assistente encontrado</h3>
              <p className="text-muted-foreground text-center mb-6 text-sm md:text-base max-w-md">
                {searchQuery
                  ? "Tente ajustar sua busca ou remover os filtros aplicados."
                  : "Os assistentes de IA aparecerão aqui quando forem criados pelos gerentes."}
              </p>
              {searchQuery && (
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterStatus("all");
                  }}
                  className="gap-2 w-full sm:w-auto glass-button-primary"
                >
                  <X className="h-4 w-4" />
                  Limpar filtros
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full max-w-full"
        >
          {filteredChatbots.map((chatbot) => (
            <motion.div key={chatbot.id} variants={item}>
              <Card className="glass-card glass-hover h-full flex flex-col overflow-hidden border-primary/10">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2 w-full">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <Bot className="h-5 w-5 text-primary flex-shrink-0" />
                      </div>
                      <CardTitle className="text-lg truncate min-w-0">{chatbot.name}</CardTitle>
                    </div>
                    <Badge
                      variant={chatbot.is_active ? "default" : "secondary"}
                      className={`flex-shrink-0 whitespace-nowrap ${chatbot.is_active ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30 border-green-500/20' : ''}`}
                    >
                      {chatbot.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <CardDescription className="text-xs md:text-sm text-muted-foreground">
                      Criado em {new Date(chatbot.created_at).toLocaleDateString('pt-BR')}
                    </CardDescription>
                    {chatbot.accept_images && (
                      <Badge variant="outline" className="text-xs gap-1 border-primary/30 text-primary bg-primary/5">
                        <Image className="w-3 h-3" />
                        Imagens
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 mt-auto">
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => openChat(chatbot)}
                      className="w-full gap-2 glass-button-primary"
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
                          className="flex-1 gap-2 glass-button-outline"
                        >
                          <Settings className="h-4 w-4" />
                          <span className="hidden xs:inline">Editar</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDelete(chatbot)}
                          className="gap-2 glass-button-destructive text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="hidden xs:inline">Excluir</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Dialogs */}
      {isManager && (
        <AnimatePresence>
          {showCreateDialog && (
            <CreateChatbotDialog
              open={showCreateDialog}
              onOpenChange={setShowCreateDialog}
              onSuccess={handleChatbotCreated}
            />
          )}
          
          {showEditDialog && (
            <EditChatbotDialog
              open={showEditDialog}
              onOpenChange={setShowEditDialog}
              chatbot={selectedChatbot}
              onSuccess={handleChatbotUpdated}
            />
          )}
          
          {showDeleteDialog && (
            <DeleteChatbotDialog
              open={showDeleteDialog}
              onOpenChange={setShowDeleteDialog}
              chatbot={selectedChatbot}
              onSuccess={handleChatbotDeleted}
            />
          )}
        </AnimatePresence>
      )}
    </div>
  );
}