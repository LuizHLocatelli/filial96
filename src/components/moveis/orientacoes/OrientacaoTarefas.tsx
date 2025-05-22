
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ListTodo,
  CalendarIcon,
  CheckCircle2,
  CircleDashed,
  CircleEllipsis,
  Clock,
  Plus,
  Trash2,
} from "lucide-react";
import { Tarefa } from "./types";

const tarefaFormSchema = z.object({
  titulo: z.string().min(3, { message: "Título deve ter pelo menos 3 caracteres" }),
  descricao: z.string().min(10, { message: "Descrição deve ter pelo menos 10 caracteres" }),
  data_entrega: z.date({ required_error: "Data de entrega é obrigatória" }),
  orientacao_id: z.string().optional(),
});

type TarefaFormValues = z.infer<typeof tarefaFormSchema>;

export function OrientacaoTarefas() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [orientacoes, setOrientacoes] = useState<Array<{ id: string; titulo: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const form = useForm<TarefaFormValues>({
    resolver: zodResolver(tarefaFormSchema),
    defaultValues: {
      titulo: "",
      descricao: "",
    },
  });

  useEffect(() => {
    fetchTarefas();
    fetchOrientacoes();
  }, []);

  const fetchTarefas = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("moveis_tarefas")
        .select("*")
        .order("data_entrega", { ascending: true });

      if (error) throw error;

      setTarefas(data as Tarefa[]);
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

      setOrientacoes(data);
    } catch (error) {
      console.error("Erro ao buscar orientações:", error);
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
      const { error } = await supabase.from("moveis_tarefas").insert({
        titulo: data.titulo,
        descricao: data.descricao,
        data_entrega: data.data_entrega.toISOString(),
        orientacao_id: data.orientacao_id || null,
        status: "pendente",
        criado_por: user.id,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Tarefa criada com sucesso.",
      });

      // Limpar formulário e atualizar lista
      form.reset();
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pendente":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">Pendente</Badge>;
      case "em_andamento":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">Em andamento</Badge>;
      case "concluida":
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Concluída</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pendente":
        return <CircleDashed className="h-5 w-5 text-yellow-500" />;
      case "em_andamento":
        return <CircleEllipsis className="h-5 w-5 text-blue-500" />;
      case "concluida":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      default:
        return <CircleDashed className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Tarefas de VM</h2>
        <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"} size="sm">
          {showForm ? "Cancelar" : <><Plus className="mr-2 h-4 w-4" /> Nova Tarefa</>}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="titulo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Título da tarefa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="orientacao_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Orientação relacionada (opcional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma orientação" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Nenhuma</SelectItem>
                          {orientacoes.map((orientacao) => (
                            <SelectItem key={orientacao.id} value={orientacao.id}>
                              {orientacao.titulo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="data_entrega"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data de entrega</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: ptBR })
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva esta tarefa"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                <ListTodo className="mr-2 h-4 w-4" />
                Criar Tarefa
              </Button>
            </form>
          </Form>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <Card className="p-6 text-center">
            <div className="flex flex-col items-center justify-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground animate-pulse mb-4" />
              <p>Carregando tarefas...</p>
            </div>
          </Card>
        ) : tarefas.length === 0 ? (
          <Card className="p-6 text-center">
            <div className="flex flex-col items-center justify-center py-8">
              <ListTodo className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Nenhuma tarefa encontrada</h3>
              <p className="text-muted-foreground mt-2">
                Adicione novas tarefas para começar a organizar o trabalho.
              </p>
            </div>
          </Card>
        ) : (
          tarefas.map((tarefa) => (
            <Card key={tarefa.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getStatusIcon(tarefa.status)}
                    <span>{tarefa.titulo}</span>
                  </CardTitle>
                  <div className="flex items-center space-x-1">
                    {getStatusBadge(tarefa.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    <span>
                      {format(new Date(tarefa.data_entrega), "PPP", { locale: ptBR })}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm">{tarefa.descricao}</p>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex gap-2">
                    {tarefa.status !== "pendente" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                        onClick={() => handleAtualizarStatus(tarefa.id, "pendente")}
                      >
                        <CircleDashed className="h-4 w-4 mr-1" /> Pendente
                      </Button>
                    )}
                    {tarefa.status !== "em_andamento" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        onClick={() => handleAtualizarStatus(tarefa.id, "em_andamento")}
                      >
                        <CircleEllipsis className="h-4 w-4 mr-1" /> Em andamento
                      </Button>
                    )}
                    {tarefa.status !== "concluida" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => handleAtualizarStatus(tarefa.id, "concluida")}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" /> Concluída
                      </Button>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => handleExcluirTarefa(tarefa.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
