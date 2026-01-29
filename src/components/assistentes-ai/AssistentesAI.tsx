import { useState, useEffect } from 'react';
import { Plus, Bot, Search, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ChatContainer } from './components/ChatContainer';
import { ChatbotCard } from './components/ChatbotCard';
import { CreateChatbotDialog } from './dialogs/CreateChatbotDialog';
import { EditChatbotDialog } from './dialogs/EditChatbotDialog';
import { DeleteChatbotDialog } from './dialogs/DeleteChatbotDialog';
import type { Chatbot, FilterStatus } from './types';
import { motion, AnimatePresence } from 'framer-motion';

export default function AssistentesAI() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [selectedChatbot, setSelectedChatbot] = useState<Chatbot | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  const isManager = profile?.role === 'gerente';

  const filteredChatbots = chatbots.filter(chatbot => {
    const matchesSearch = chatbot.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && chatbot.is_active) ||
      (filterStatus === 'inactive' && !chatbot.is_active);
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    fetchChatbots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        title: 'Erro',
        description: 'Não foi possível carregar os assistentes.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChatbotCreated = () => {
    setShowCreateDialog(false);
    fetchChatbots();
    toast({
      title: 'Sucesso',
      description: 'Assistente criado com sucesso!',
    });
  };

  const handleChatbotUpdated = () => {
    setShowEditDialog(false);
    setSelectedChatbot(null);
    fetchChatbots();
    toast({
      title: 'Sucesso',
      description: 'Assistente atualizado com sucesso!',
    });
  };

  const handleChatbotDeleted = () => {
    setShowDeleteDialog(false);
    setSelectedChatbot(null);
    fetchChatbots();
    toast({
      title: 'Sucesso',
      description: 'Assistente excluído com sucesso!',
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
      <div className="p-4 md:p-6 space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-muted/50 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (showChat && selectedChatbot) {
    return (
      <ChatContainer
        chatbot={selectedChatbot}
        onBack={() => setShowChat(false)}
      />
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 min-h-[calc(100vh-80px)]">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Assistentes de IA
        </h1>
        <p className="text-muted-foreground">
          Gerencie e interaja com seus assistentes inteligentes
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar assistentes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'active', 'inactive'] as FilterStatus[]).map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus(status)}
              className={`gap-2 whitespace-nowrap ${
                filterStatus === status && status === 'active'
                  ? 'bg-green-500 hover:bg-green-600'
                  : filterStatus === status && status === 'inactive'
                  ? 'bg-red-500 hover:bg-red-600'
                  : ''
              }`}
            >
              <Filter className="h-3.5 w-3.5" />
              {status === 'all' && 'Todos'}
              {status === 'active' && 'Ativos'}
              {status === 'inactive' && 'Inativos'}
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-background/20 text-xs">
                {status === 'all' && chatbots.length}
                {status === 'active' && chatbots.filter(c => c.is_active).length}
                {status === 'inactive' && chatbots.filter(c => !c.is_active).length}
              </span>
            </Button>
          ))}
        </div>
      </motion.div>

      {isManager && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-end"
        >
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="gap-2 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Novo Assistente
          </Button>
        </motion.div>
      )}

      {chatbots.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-16 md:py-24 text-center"
        >
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 border border-primary/20">
            <Bot className="h-10 w-10 md:h-12 md:w-12 text-primary/60" />
          </div>
          <h3 className="text-lg md:text-xl font-semibold mb-2">
            Nenhum assistente encontrado
          </h3>
          <p className="text-muted-foreground text-sm md:text-base max-w-md mb-6">
            {isManager
              ? 'Crie seu primeiro assistente de IA para começar a automatizar atendimentos.'
              : 'Os assistentes de IA aparecerão aqui quando forem criados pelos gerentes.'}
          </p>
          {isManager && (
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Criar Primeiro Assistente
            </Button>
          )}
        </motion.div>
      ) : filteredChatbots.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-16 md:py-24 text-center"
        >
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 border border-primary/20">
            <Search className="h-10 w-10 md:h-12 md:w-12 text-primary/60" />
          </div>
          <h3 className="text-lg md:text-xl font-semibold mb-2">
            Nenhum assistente encontrado
          </h3>
          <p className="text-muted-foreground text-sm md:text-base max-w-md">
            Tente ajustar sua busca ou remover os filtros aplicados.
          </p>
          <Button
            onClick={() => {
              setSearchQuery('');
              setFilterStatus('all');
            }}
            variant="outline"
            className="gap-2 mt-4"
          >
            <X className="h-4 w-4" />
            Limpar filtros
          </Button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
        >
          <AnimatePresence>
            {filteredChatbots.map((chatbot, index) => (
              <motion.div
                key={chatbot.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <ChatbotCard
                  chatbot={chatbot}
                  onChat={() => openChat(chatbot)}
                  onEdit={isManager ? () => openEdit(chatbot) : undefined}
                  onDelete={isManager ? () => openDelete(chatbot) : undefined}
                  isManager={isManager}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {isManager && showCreateDialog && (
          <CreateChatbotDialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            onSuccess={handleChatbotCreated}
          />
        )}
        
        {isManager && showEditDialog && selectedChatbot && (
          <EditChatbotDialog
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            chatbot={selectedChatbot}
            onSuccess={handleChatbotUpdated}
          />
        )}
        
        {isManager && showDeleteDialog && selectedChatbot && (
          <DeleteChatbotDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            chatbot={selectedChatbot}
            onSuccess={handleChatbotDeleted}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
