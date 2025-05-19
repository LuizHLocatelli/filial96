
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { useUsers } from "../useUsers";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cardColors } from "@/lib/utils";

// Update the form schema to include background color and time
const formSchema = z.object({
  title: z.string({ required_error: "O título é obrigatório" }).min(1, "O título é obrigatório"),
  description: z.string().optional(),
  priority: z.string({ required_error: "A prioridade é obrigatória" }),
  assigneeId: z.string().optional(),
  dueDate: z.date().optional(),
  dueTime: z.string().optional(),
  backgroundColor: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CardFormFieldsProps {
  form: UseFormReturn<FormValues>;
}

export function CardFormFields({ form }: CardFormFieldsProps) {
  const { usersData, isLoading: isUsersLoading } = useUsers();
  
  return (
    <>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Título</FormLabel>
            <FormControl>
              <Input placeholder="Digite o título do cartão" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descrição</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Digite a descrição (opcional)" 
                {...field} 
                value={field.value || ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="backgroundColor"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cor do cartão</FormLabel>
            <FormControl>
              <div className="flex flex-wrap gap-2">
                {cardColors.map((colorOption) => (
                  <button
                    key={colorOption.value}
                    type="button"
                    onClick={() => field.onChange(colorOption.value)}
                    className={`w-8 h-8 rounded-full transition-all ${
                      field.value === colorOption.value ? 'ring-2 ring-offset-2 ring-primary' : 'ring-1 ring-muted'
                    }`}
                    style={{ backgroundColor: colorOption.value }}
                    title={colorOption.label}
                  />
                ))}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="priority"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Prioridade</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value || "media"}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="baixa">Baixa</SelectItem>
                <SelectItem value="media">Média</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="assigneeId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Responsável</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
              value={field.value || undefined}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um responsável (opcional)" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {usersData && usersData.length > 0 ? (
                  usersData.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-users">Nenhum usuário disponível</SelectItem>
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Prazo</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "dd/MM/yyyy", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data (opcional)</span>
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
                    initialFocus
                    locale={ptBR}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="dueTime"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Horário</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    type="time"
                    placeholder="Horário limite" 
                    {...field} 
                    value={field.value || ""}
                    className="pl-10"
                  />
                  <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}

// Export the form schema for reuse
export { formSchema };
export type { FormValues };
