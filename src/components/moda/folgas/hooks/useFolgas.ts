import { useState, useEffect, useMemo } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { Folga } from "../types";

interface FolgaFormValues {
  data: Date;
  consultorId: string;
  motivo?: string;
}

interface EstisticasFolgas {
  totalFolgas: number;
  folgasNoMes: number;
  consultoresComFolga: number;
  proximasFolgas: number;
}

export function useFolgas() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingFolga, setEditingFolga] = useState<Folga | null>(null);
  const [folgas, setFolgas] = useState<Folga[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Buscar folgas do banco
  useEffect(() => {
    fetchFolgas();
  }, []);

  const fetchFolgas = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("moda_folgas")
        .select("*")
        .order('data', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedFolgas: Folga[] = data.map((folga) => ({
          id: folga.id,
          data: new Date(folga.data),
          consultorId: folga.consultor_id,
          motivo: folga.motivo || undefined,
          createdAt: folga.created_at,
          createdBy: folga.created_by || undefined,
        }));
        setFolgas(formattedFolgas);
      }
    } catch (error) {
      console.error("Erro ao buscar folgas:", error);
      toast({
        title: "Erro ao carregar folgas",
        description: "Não foi possível carregar a lista de folgas.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createFolga = async (dadosFolga: FolgaFormValues) => {
    try {
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("moda_folgas")
        .insert({
          data: dadosFolga.data.toISOString().split('T')[0],
          consultor_id: dadosFolga.consultorId,
          motivo: dadosFolga.motivo || null,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Adicionar a nova folga ao estado
      const novaFolga: Folga = {
        id: data.id,
        data: new Date(data.data),
        consultorId: data.consultor_id,
        motivo: data.motivo || undefined,
        createdAt: data.created_at,
        createdBy: data.created_by,
      };

      setFolgas(prev => [novaFolga, ...prev]);

      toast({
        title: "Folga criada",
        description: "A folga foi registrada com sucesso.",
      });

      return novaFolga;
    } catch (error: any) {
      console.error("Erro ao criar folga:", error);
      toast({
        title: "Erro ao criar folga",
        description: error.message || "Não foi possível criar a folga.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateFolga = async (folgaId: string, dadosFolga: FolgaFormValues) => {
    try {
      const { data, error } = await supabase
        .from("moda_folgas")
        .update({
          data: dadosFolga.data.toISOString().split('T')[0],
          consultor_id: dadosFolga.consultorId,
          motivo: dadosFolga.motivo || null,
        })
        .eq('id', folgaId)
        .select()
        .single();

      if (error) throw error;

      // Atualizar a folga no estado
      const folgaAtualizada: Folga = {
        id: data.id,
        data: new Date(data.data),
        consultorId: data.consultor_id,
        motivo: data.motivo || undefined,
        createdAt: data.created_at,
        createdBy: data.created_by,
      };

      setFolgas(prev => prev.map(f => f.id === folgaId ? folgaAtualizada : f));

      toast({
        title: "Folga atualizada",
        description: "A folga foi atualizada com sucesso.",
      });

      return folgaAtualizada;
    } catch (error: any) {
      console.error("Erro ao atualizar folga:", error);
      toast({
        title: "Erro ao atualizar folga",
        description: error.message || "Não foi possível atualizar a folga.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteFolga = async (folgaId: string) => {
    try {
      const { error } = await supabase
        .from("moda_folgas")
        .delete()
        .eq('id', folgaId);

      if (error) throw error;

      // Remover a folga do estado
      setFolgas(prev => prev.filter(f => f.id !== folgaId));

      toast({
        title: "Folga excluída",
        description: "A folga foi excluída com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao excluir folga:", error);
      toast({
        title: "Erro ao excluir folga",
        description: error.message || "Não foi possível excluir a folga.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Estatísticas calculadas
  const estatisticas: EstisticasFolgas = useMemo(() => {
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    const em7Dias = new Date();
    em7Dias.setDate(hoje.getDate() + 7);

    const folgasNoMes = folgas.filter(folga => {
      const dataFolga = new Date(folga.data);
      return dataFolga >= inicioMes && dataFolga <= fimMes;
    });

    const proximasFolgas = folgas.filter(folga => {
      const dataFolga = new Date(folga.data);
      return dataFolga >= hoje && dataFolga <= em7Dias;
    });

    const consultoresComFolga = new Set(folgasNoMes.map(f => f.consultorId)).size;

    return {
      totalFolgas: folgas.length,
      folgasNoMes: folgasNoMes.length,
      consultoresComFolga,
      proximasFolgas: proximasFolgas.length,
    };
  }, [folgas]);

  return {
    // Estados
    showForm,
    setShowForm,
    editingFolga,
    setEditingFolga,
    folgas,
    isLoading,
    
    // Operações CRUD
    createFolga,
    updateFolga,
    deleteFolga,
    fetchFolgas,
    
    // Estatísticas
    estatisticas,
  };
} 