import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrientacoesList } from "./OrientacoesList";
import { OrientacaoUploader } from "./OrientacaoUploader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { Badge } from "@/components/ui/badge";
import { FileText, PlusCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";

export function VmTarefas() {
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTab, setSelectedTab] = useState("listar");
  const [refreshKey, setRefreshKey] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  
  // Verificar parâmetros de URL para abrir dialogs automaticamente
  useEffect(() => {
    const action = searchParams.get('action');
    
    if (action === 'new') {
      setSelectedTab('adicionar');
      // Limpar o parâmetro da URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('action');
      setSearchParams(newParams);
    } else if (action === 'new-task') {
      // Para nova tarefa, você pode implementar lógica específica
      // Por enquanto, vai para a aba de adicionar
      setSelectedTab('adicionar');
      // Limpar o parâmetro da URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('action');
      setSearchParams(newParams);
    }
  }, [searchParams, setSearchParams]);
  
  const handleUploadSuccess = () => {
    // Increment refresh key to trigger a refresh of the list
    setRefreshKey(prev => prev + 1);
    // Switch to list view after upload
    setSelectedTab("listar");
  };

  const handleNovaOrientacao = () => {
    setSelectedTab("adicionar");
  };
  
  // Função para buscar o número de orientações não lidas
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!user) return;
      
      try {
        // Primeiro, buscamos todas as orientações recentes (últimos 30 dias)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data: orientacoes, error: orientacoesError } = await supabase
          .from('moveis_orientacoes')
          .select('id')
          .gte('data_criacao', thirtyDaysAgo.toISOString());
          
        if (orientacoesError) throw orientacoesError;
        
        if (!orientacoes || orientacoes.length === 0) {
          setUnreadCount(0);
          return;
        }
        
        // Agora verificamos quais dessas orientações o usuário já leu
        const orientacaoIds = orientacoes.map(o => o.id);
        
        const { data: readStatus, error: readError } = await supabase
          .from('notification_read_status')
          .select('activity_id')
          .eq('user_id', user.id)
          .in('activity_id', orientacaoIds);
          
        if (readError) throw readError;
        
        // O número de não lidas é a diferença entre todas e as lidas
        const readIds = readStatus?.map(s => s.activity_id) || [];
        const unreadCount = orientacaoIds.filter(id => !readIds.includes(id)).length;
        
        setUnreadCount(unreadCount);
      } catch (error) {
        console.error("Erro ao buscar notificações não lidas:", error);
      }
    };
    
    fetchUnreadCount();
    
    // Configurar um intervalo para verificar periodicamente
    const interval = setInterval(fetchUnreadCount, 60000); // Verificar a cada minuto
    
    return () => clearInterval(interval);
  }, [user, refreshKey]);
  
  // Quando o usuário clica na aba de listagem, marcamos as orientações como lidas
  const handleTabChange = async (value: string) => {
    setSelectedTab(value);
    
    if (value === "listar" && unreadCount > 0 && user) {
      // Marcar todas as orientações como lidas no sistema antigo e novo
      const markAsRead = async () => {
        try {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          
          const { data: orientacoes } = await supabase
            .from('moveis_orientacoes')
            .select('id')
            .gte('data_criacao', thirtyDaysAgo.toISOString());
            
          if (!orientacoes || orientacoes.length === 0) return;
          
          // Sistema antigo - notification_read_status
          const orientacaoIds = orientacoes.map(o => o.id);
          
          // Primeiro, verificar quais já estão marcadas como lidas
          const { data: readStatus } = await supabase
            .from('notification_read_status')
            .select('activity_id')
            .eq('user_id', user.id)
            .in('activity_id', orientacaoIds);
            
          const readIds = readStatus?.map(s => s.activity_id) || [];
          const unreadIds = orientacaoIds.filter(id => !readIds.includes(id));
          
          // Para cada orientação não lida, inserir um registro no sistema antigo
          for (const id of unreadIds) {
            await supabase
              .from('notification_read_status')
              .insert({
                user_id: user.id,
                activity_id: id,
                read: true
              });
          }
          
          // Sistema novo - registrar visualizações no monitoramento
          for (const id of unreadIds) {
            await supabase.rpc('register_orientacao_view', {
              p_orientacao_id: id,
              p_user_id: user.id
            });
          }
          
          // Atualizar o contador
          setUnreadCount(0);
          console.log('✅ Orientações marcadas como lidas em ambos os sistemas');
        } catch (error) {
          console.error("Erro ao marcar orientações como lidas:", error);
        }
      };
      
      await markAsRead();
    }
  };
  
  return (
    <div className="w-full max-w-full">
      <Tabs 
        value={selectedTab} 
        onValueChange={handleTabChange} 
        className="space-y-6 w-full"
      >
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border/40">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-foreground">Informativos e VM</h2>
            <p className="text-sm text-muted-foreground">Gerencie informativos e visual merchandising para a equipe</p>
          </div>
          
          <TabsList className="grid grid-cols-2 w-full bg-muted/50 p-1 rounded-lg">
            <TabsTrigger 
              value="listar" 
              className="flex items-center gap-2 relative transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/90 data-[state=active]:to-primary"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{isMobile ? "Lista" : "Visualizar"}</span>
              </motion.div>
              <AnimatePresence>
                {unreadCount > 0 && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -top-2 -right-2"
                  >
                    <Badge 
                      className="h-5 w-5 p-0 flex items-center justify-center bg-destructive text-destructive-foreground text-xs rounded-full shadow-md"
                      variant="destructive"
                    >
                      {unreadCount}
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsTrigger>
            
            <TabsTrigger 
              value="adicionar" 
              className="flex items-center gap-2 transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/90 data-[state=active]:to-primary"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="flex items-center gap-2"
              >
                <PlusCircle className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{isMobile ? "Novo" : "Adicionar"}</span>
              </motion.div>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            <TabsContent value="listar" className="space-y-4 w-full m-0">
              <div className="bg-card rounded-xl shadow-sm border border-border/40 overflow-hidden">
                <OrientacoesList key={refreshKey} onNovaOrientacao={handleNovaOrientacao} />
              </div>
            </TabsContent>
            
            <TabsContent value="adicionar" className="space-y-4 w-full m-0">
              <div className="bg-card rounded-xl shadow-sm border border-border/40 overflow-hidden">
                <OrientacaoUploader onSuccess={handleUploadSuccess} />
              </div>
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}
