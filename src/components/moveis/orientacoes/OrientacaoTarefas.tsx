import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { TarefaForm } from "./components/TarefaForm";
import { TarefasList } from "./components/TarefasList";
import { TarefasHeader } from "./components/TarefasHeader";
import { Tarefa } from "./types";

const tarefaFormSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório"),
  descricao: z.string().optional(),
  data_entrega: z.date(),
  orientacao_id: z.string().optional(),
  rotina_id: z.string().optional(),
  prioridade: z.enum(['baixa', 'media', 'alta', 'urgente']).default('media'),
  origem: z.enum(['manual', 'rotina', 'orientacao']).default('manual'),
});

type TarefaFormValues = z.infer<typeof tarefaFormSchema>;

interface OrientacaoTarefasProps {
  defaultRotina?: string;
  onViewRotina?: (rotinaId: string) => void;
}

export function OrientacaoTarefas({ defaultRotina, onViewRotina }: OrientacaoTarefasProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [orientacoes, setOrientacoes] = useState<Array<{ id: string; titulo: string }>>([]);
  const [rotinas, setRotinas] = useState<Array<{ id: string; nome: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const form = useForm<TarefaFormValues>({
    resolver: zodResolver(tarefaFormSchema),
    defaultValues: {
      titulo: "",
      descricao: "",
      orientacao_id: "none",
      rotina_id: defaultRotina || "none",
      prioridade: "media",
      origem: defaultRotina ? "rotina" : "manual",
    },
  });

  useEffect(() => {
    fetchTarefas();
    fetchOrientacoes();
    fetchRotinas();
  }, []);

  const fetchTarefas = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("moveis_tarefas")
        .select(`
          *,
          orientacao:moveis_orientacoes(titulo)
        `)
        .order("data_entrega", { ascending: true });

      if (error) throw error;

      setTarefas((data || []) as unknown as Tarefa[]);
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de tarefas.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrientacoes = async () => {
    try {
      const { data, error } = await supabase
        .from("moveis_orientacoes")
        .select("id, titulo")
        .order("titulo", { ascending: true });

      if (error) throw error;

      setOrientacoes((data || []) as unknown as Array<{ id: string; titulo: string }>);
    } catch (error) {
      console.error("Erro ao buscar orientações:", error);
    }
  };

  const fetchRotinas = async () => {
    try {
      const { data, error } = await supabase
        .from("moveis_rotinas")
        .select("id, nome")
        .eq("ativo", true)
        .order("nome", { ascending: true });

      if (error) throw error;

      setRotinas((data || []) as unknown as Array<{ id: string; nome: string }>);
    } catch (error) {
      console.error("Erro ao buscar rotinas:", error);
    }
  };

  const onSubmit = async (data: TarefaFormValues) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para criar tarefas.",
        variant: "destructive",
      });
      return;
    }

    try {
      const orientacaoId = data.orientacao_id === "none" ? null : data.orientacao_id;
      const rotinaId = data.rotina_id === "none" ? null : data.rotina_id;
      
      const newTask = {
        titulo: data.titulo,
        descricao: data.descricao,
        data_entrega: data.data_entrega.toISOString(),
        orientacao_id: orientacaoId,
        rotina_id: rotinaId,
        prioridade: data.prioridade,
        origem: data.origem,
        status: "pendente",
        criado_por: user.id,
      };

      const { error } = await supabase
        .from("moveis_tarefas")
        .insert(newTask);

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Tarefa criada com sucesso.",
      });

      form.reset({
        titulo: "",
        descricao: "",
        orientacao_id: "none",
        rotina_id: defaultRotina || "none",
        prioridade: "media",
        origem: defaultRotina ? "rotina" : "manual",
      });
      setShowForm(false);
      fetchTarefas();
    } catch (error: any) {
      console.error("Erro ao criar tarefa:", error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao criar a tarefa.",
        variant: "destructive",
      });
    }
  };

  const handleAtualizarStatus = async (tarefaId: string, novoStatus: string) => {
    try {
      const { error } = await supabase
        .from("moveis_tarefas")
        .update({ 
          status: novoStatus,
          data_atualizacao: new Date().toISOString()
        })
        .eq("id", tarefaId);

      if (error) {
        throw error;
      }

      setTarefas((current) =>
        current.map((tarefa) =>
          tarefa.id === tarefaId ? { ...tarefa, status: novoStatus as any } : tarefa
        )
      );

      toast({
        title: "Status atualizado",
        description: "O status da tarefa foi atualizado com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao atualizar o status.",
        variant: "destructive",
      });
    }
  };

  const handleExcluirTarefa = async (tarefaId: string) => {
    try {
      const { error } = await supabase
        .from("moveis_tarefas")
        .delete()
        .eq("id", tarefaId);

      if (error) {
        throw error;
      }

      setTarefas((current) => current.filter((tarefa) => tarefa.id !== tarefaId));

      toast({
        title: "Tarefa excluída",
        description: "A tarefa foi excluída com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao excluir tarefa:", error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao excluir a tarefa.",
        variant: "destructive",
      });
    }
  };

  const handleToggleForm = () => {
    setShowForm(!showForm);
    if (showForm) {
      form.reset({
        titulo: "",
        descricao: "",
        orientacao_id: "none",
        rotina_id: defaultRotina || "none",
        prioridade: "media",
        origem: defaultRotina ? "rotina" : "manual",
      });
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <TarefasHeader showForm={showForm} onToggleForm={handleToggleForm} />

      {showForm && (
        <TarefaForm
          form={form}
          orientacoes={orientacoes}
          rotinas={rotinas}
          defaultRotina={defaultRotina}
          onSubmit={onSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}

      <TarefasList
        tarefas={tarefas}
        isLoading={isLoading}
        onAtualizarStatus={handleAtualizarStatus}
        onExcluirTarefa={handleExcluirTarefa}
        onViewRotina={(rotinaId) => {
          if (onViewRotina) {
            onViewRotina(rotinaId);
          } else {
            console.log('Navegar para rotina:', rotinaId);
          }
        }}
      />
    </div>
  );
}
