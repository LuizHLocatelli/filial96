import { useState, useEffect } from "react";
import { Plus, Bot, MessageCircle, Settings, Trash2, Image, Search, Filter, X, Sparkles, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CreateChatbotDialog } from "./CreateChatbotDialog";
import { ChatInterface } from "./ChatInterface";
import { EditChatbotDialog } from "./EditChatbotDialog";
import { DeleteChatbotDialog } from "./DeleteChatbotDialog";
import { motion, AnimatePresence } from "framer-motion";
import AgenteMultimodalCreate from "@/pages/agente-multimodal/AgenteMultimodalCreate";
import AgenteMultimodal from "@/pages/agente-multimodal/AgenteMultimodal";

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

interface AgentConfig {
  id: string;
  name: string;
  bias: string;
  objective: string;
  is_active: boolean;
  created_at: string;
}

export default function AssistentesAI() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [agentConfigs, setAgentConfigs] = useState<AgentConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [selectedChatbot, setSelectedChatbot] = useState<Chatbot | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentConfig | null>(null);
  const [showAgentChat, setShowAgentChat] = useState(false);
  const [showAgentCreate, setShowAgentCreate] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [activeTab, setActiveTab] = useState("webhook");

  const isManager = profile?.role === 'gerente';

  const filteredChatbots = chatbots.filter(chatbot => {
    const matchesSearch = chatbot.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" ||
      (filterStatus === "active" && chatbot.is_active) ||
      (filterStatus === "inactive" && !chatbot.is_active);
    return matchesSearch && matchesStatus;
  });

  const filteredAgents = agentConfigs.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" ||
      (filterStatus === "active" && agent.is_active) ||
      (filterStatus === "inactive" && !agent.is_active);
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    fetchChatbots();
    fetchAgentConfigs();
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

  const fetchAgentConfigs = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("agente_multimodal_config")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAgentConfigs(data || []);
    } catch (error) {
      console.error("Error fetching agent configs:", error);
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

  const handleAgentCreated = () => {
    setShowAgentCreate(false);
    fetchAgentConfigs();
    toast({
      title: "Sucesso",
      description: "Agente multimodal criado com sucesso!",
    });
  };

  const openChat = (chatbot: Chatbot) => {
    setSelectedChatbot(chatbot);
    setShowChat(true);
  };

  const openAgentChat = (agent: AgentConfig) => {
    setSelectedAgent(agent);
    setShowAgentChat(true);
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

  if (showAgentChat && selectedAgent) {
    return (
      <AgenteMultimodal
        initialConfig={selectedAgent}
        onBack={() => {
          setShowAgentChat(false);
          setSelectedAgent(null);
          fetchAgentConfigs();
        }}
      />
    );
  }

  if (showAgentCreate) {
    return (
      <AgenteMultimodalCreate
        onBack={() => {
          setShowAgentCreate(false);
          fetchAgentConfigs();
        }}
        onSuccess={handleAgentCreated}
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
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="webhook" className="gap-2">
            <Bot className="h-4 w-4" />
            Assistentes Webhook
          </TabsTrigger>
          <TabsTrigger value="multimodal" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Agentes Multimodais
            <Badge variant="secondary" className="ml-1 text-xs">
              {agentConfigs.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="webhook" className="mt-4">
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

          <div className="flex justify-end mt-4">
            {isManager && (
              <Button 
                onClick={() => setShowCreateDialog(true)} 
                className="gap-2 w-full sm:w-auto glass-button-primary shadow-lg"
              >
                <Plus className="h-4 w-4" />
                Novo Assistente
              </Button>
            )}
          </div>

          {chatbots.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="glass-card border-dashed mt-4">
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
              className="mt-4"
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
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full max-w-full mt-4"
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
        </TabsContent>

        <TabsContent value="multimodal" className="mt-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row gap-3 w-full max-w-full"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar agentes multimodais..."
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
                  {agentConfigs.length}
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
                  {agentConfigs.filter(a => a.is_active).length}
                </span>
              </Button>
            </div>
          </motion.div>

          <div className="flex justify-end mt-4">
            <Button 
              onClick={() => setShowAgentCreate(true)} 
              className="gap-2 w-full sm:w-auto glass-button-primary shadow-lg"
            >
              <Plus className="h-4 w-4" />
              Novo Agente Multimodal
            </Button>
          </div>

          <Card className="glass-card mt-4">
            <CardContent className="py-8">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-4 rounded-full mb-4">
                  <Sparkles className="h-12 w-12 text-purple-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Agentes Multimodais</h3>
                <p className="text-muted-foreground text-sm max-w-md mb-4">
                  Assistentes avançados alimentados por Gemini 3 Flash e Veo 3.1 Fast.
                  Capazes de entender texto, analisar imagens e gerar vídeos.
                </p>
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  <Badge variant="outline" className="gap-1 border-purple-500/30 text-purple-500 bg-purple-500/5">
                    <Image className="w-3 h-3" />
                    Análise de Imagens
                  </Badge>
                  <Badge variant="outline" className="gap-1 border-purple-500/30 text-purple-500 bg-purple-500/5">
                    <Video className="w-3 h-3" />
                    Geração de Vídeos
                  </Badge>
                  <Badge variant="outline" className="gap-1 border-purple-500/30 text-purple-500 bg-purple-500/5">
                    <MessageCircle className="w-3 h-3" />
                    Conversação
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {filteredAgents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="glass-card border-dashed mt-4">
                <CardContent className="flex flex-col items-center justify-center py-16 px-4">
                  <div className="bg-primary/10 p-4 rounded-full mb-4">
                    <Sparkles className="h-16 w-16 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-center">Nenhum agente multimodal encontrado</h3>
                  <p className="text-muted-foreground text-center mb-6 text-sm md:text-base max-w-md">
                    Crie seu primeiro agente multimodal para aproveitar o poder do Gemini para texto e imagens, e do Veo 3.1 Fast para geração de vídeos.
                  </p>
                  <Button onClick={() => setShowAgentCreate(true)} className="gap-2 w-full sm:w-auto glass-button-primary">
                    <Plus className="h-4 w-4" />
                    Criar Primeiro Agente
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full max-w-full mt-4"
            >
              {filteredAgents.map((agent) => (
                <motion.div key={agent.id} variants={item}>
                  <Card className="glass-card glass-hover h-full flex flex-col overflow-hidden border-purple-500/20">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2 w-full">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-2 rounded-lg">
                            <Sparkles className="h-5 w-5 text-purple-500 flex-shrink-0" />
                          </div>
                          <CardTitle className="text-lg truncate min-w-0">{agent.name}</CardTitle>
                        </div>
                        <Badge
                          variant={agent.is_active ? "default" : "secondary"}
                          className={`flex-shrink-0 whitespace-nowrap ${agent.is_active ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30 border-green-500/20' : ''}`}
                        >
                          {agent.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <CardDescription className="text-xs md:text-sm text-muted-foreground">
                          Criado em {new Date(agent.created_at).toLocaleDateString('pt-BR')}
                        </CardDescription>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <Badge variant="outline" className="text-xs gap-1 border-purple-500/30 text-purple-500 bg-purple-500/5">
                          <Image className="w-3 h-3" />
                          Imagens
                        </Badge>
                        <Badge variant="outline" className="text-xs gap-1 border-purple-500/30 text-purple-500 bg-purple-500/5">
                          <Video className="w-3 h-3" />
                          Vídeos
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 mt-auto">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {agent.objective}
                      </p>
                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => openAgentChat(agent)}
                          className="w-full gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                          disabled={!agent.is_active}
                          size="sm"
                        >
                          <MessageCircle className="h-4 w-4" />
                          Conversar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>
      </Tabs>

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