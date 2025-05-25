import { UseFormReturn } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, ListTodo, X } from "lucide-react";
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

interface TarefaFormProps {
  form: UseFormReturn<any>;
  orientacoes: Array<{ id: string; titulo: string }>;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function TarefaForm({ form, orientacoes, onSubmit, onCancel }: TarefaFormProps) {
  return (
    <Card className="p-4 sm:p-6 shadow-sm border">
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg sm:text-xl font-semibold text-foreground">Nova Tarefa</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onCancel}
            className="h-8 w-8 p-0 hover:bg-destructive/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-muted-foreground text-sm">
          Crie uma nova tarefa para organizar o trabalho do setor de móveis
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
          <FormField
            control={form.control}
            name="titulo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Título da Tarefa</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Digite o título da tarefa" 
                    {...field} 
                    className="text-sm"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="orientacao_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Orientação relacionada (opcional)</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value || "none"}
                  >
                    <FormControl>
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Selecione uma orientação" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma</SelectItem>
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
                  <FormLabel className="text-sm font-medium">Data de entrega</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className="pl-3 text-left font-normal text-sm justify-start"
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ptBR })
                          ) : (
                            <span className="text-muted-foreground">Selecione uma data</span>
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
                        disabled={(date) => date < new Date()}
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
                <FormLabel className="text-sm font-medium">Descrição</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descreva os detalhes desta tarefa..."
                    className="min-h-[100px] sm:min-h-[120px] text-sm resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancelar
            </Button>
            <Button type="submit" className="w-full sm:flex-1 order-1 sm:order-2">
              <ListTodo className="mr-2 h-4 w-4" />
              Criar Tarefa
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
