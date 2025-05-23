
import { useState, useEffect } from 'react';
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrientacoesList } from "./OrientacoesList";
import { OrientacaoTarefas } from "./OrientacaoTarefas";
import { OrientacaoUploader } from "./OrientacaoUploader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";

export function Orientacoes() {
  const [selectedTab, setSelectedTab] = useState("listar");
  const [refreshKey, setRefreshKey] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  
  const handleUploadSuccess = () => {
    // Increment refresh key to trigger a refresh of the list
    setRefreshKey(prev => prev + 1);
    // Switch to list view after upload
    setSelectedTab("listar");
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
  const handleTabChange = (value: string) => {
    setSelectedTab(value);
    
    if (value === "listar" && unreadCount > 0 && user) {
      // Marcar todas as orientações como lidas
      const markAsRead = async () => {
        try {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          
          const { data: orientacoes } = await supabase
            .from('moveis_orientacoes')
            .select('id')
            .gte('data_criacao', thirtyDaysAgo.toISOString());
            
          if (!orientacoes || orientacoes.length === 0) return;
          
          // Para cada orientação não lida, inserir um registro na tabela notification_read_status
          const orientacaoIds = orientacoes.map(o => o.id);
          
          // Primeiro, verificar quais já estão marcadas como lidas
          const { data: readStatus } = await supabase
            .from('notification_read_status')
            .select('activity_id')
            .eq('user_id', user.id)
            .in('activity_id', orientacaoIds);
            
          const readIds = readStatus?.map(s => s.activity_id) || [];
          const unreadIds = orientacaoIds.filter(id => !readIds.includes(id));
          
          // Para cada orientação não lida, inserir um registro
          for (const id of unreadIds) {
            await supabase
              .from('notification_read_status')
              .insert({
                user_id: user.id,
                activity_id: id,
                read: true
              });
          }
          
          // Atualizar o contador
          setUnreadCount(0);
        } catch (error) {
          console.error("Erro ao marcar orientações como lidas:", error);
        }
      };
      
      markAsRead();
    }
  };
  
  return (
    <div className="w-full max-w-full overflow-hidden">
      <Tabs value={selectedTab} onValueChange={handleTabChange} className="space-y-4 w-full">
        <div className="w-full overflow-x-auto">
          <TabsList className="grid w-full grid-cols-3 min-w-[300px]">
            <TabsTrigger value="listar" className="text-xs sm:text-sm whitespace-nowrap relative">
              Listar Orientações
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs rounded-full">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="adicionar" className="text-xs sm:text-sm whitespace-nowrap">
              Adicionar Nova
            </TabsTrigger>
            <TabsTrigger value="tarefas" className="text-xs sm:text-sm whitespace-nowrap">
              Tarefas
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="listar" className="space-y-4 w-full">
          <OrientacoesList key={refreshKey} />
        </TabsContent>
        
        <TabsContent value="adicionar" className="space-y-4 w-full">
          <OrientacaoUploader onSuccess={handleUploadSuccess} />
        </TabsContent>
        
        <TabsContent value="tarefas" className="space-y-4 w-full">
          <OrientacaoTarefas />
        </TabsContent>
      </Tabs>
    </div>
  );
}
