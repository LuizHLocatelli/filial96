
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarIcon, ChevronLeft, ChevronRight, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

// Define the form schema
const formSchema = z.object({
  nome: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  conta: z.string().min(1, { message: "Número da conta é obrigatório" }),
  diaContato: z.date({ required_error: "Data de contato é obrigatória" }),
  diaPagamento: z.date({ required_error: "Data de pagamento é obrigatória" }),
  tipo: z.enum(["pagamento", "renegociacao"], { required_error: "Tipo é obrigatório" }),
  valorParcelas: z.string().optional(),
  contratosNegociados: z.string().optional(),
  valorEntrada: z.string().optional(),
  qtdParcelas: z.string().optional(),
  valorCadaParcela: z.string().optional(),
  observacao: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Cliente {
  id: string;
  nome: string;
  conta: string;
  diaContato: Date;
  diaPagamento: Date;
  tipo: "pagamento" | "renegociacao";
  valorParcelas?: string;
  contratosNegociados?: string;
  valorEntrada?: string;
  qtdParcelas?: string;
  valorCadaParcela?: string;
  observacao?: string;
}

export function ClientesAgendados() {
  const { toast } = useToast();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      conta: "",
      tipo: "pagamento",
      valorParcelas: "",
      contratosNegociados: "",
      valorEntrada: "",
      qtdParcelas: "",
      valorCadaParcela: "",
      observacao: "",
    }
  });
  
  const tipoAgendamento = form.watch("tipo");
  
  const resetForm = () => {
    form.reset({
      nome: "",
      conta: "",
      tipo: "pagamento",
      valorParcelas: "",
      contratosNegociados: "",
      valorEntrada: "",
      qtdParcelas: "",
      valorCadaParcela: "",
      observacao: "",
    });
    setEditingCliente(null);
  };
  
  const onSubmit = (data: FormValues) => {
    if (editingCliente) {
      // Edit existing client
      const updatedClientes = clientes.map(cliente => 
        cliente.id === editingCliente.id ? { ...data, id: editingCliente.id } : cliente
      );
      setClientes(updatedClientes);
      toast({
        title: "Cliente atualizado",
        description: "As informações do cliente foram atualizadas com sucesso.",
      });
    } else {
      // Add new client
      const newCliente: Cliente = {
        id: Math.random().toString(36).substr(2, 9),
        ...data
      };
      setClientes([...clientes, newCliente]);
      toast({
        title: "Cliente adicionado",
        description: "O cliente foi adicionado com sucesso.",
      });
    }
    
    setDialogOpen(false);
    resetForm();
  };
  
  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    form.reset({
      nome: cliente.nome,
      conta: cliente.conta,
      diaContato: cliente.diaContato,
      diaPagamento: cliente.diaPagamento,
      tipo: cliente.tipo,
      valorParcelas: cliente.valorParcelas || "",
      contratosNegociados: cliente.contratosNegociados || "",
      valorEntrada: cliente.valorEntrada || "",
      qtdParcelas: cliente.qtdParcelas || "",
      valorCadaParcela: cliente.valorCadaParcela || "",
      observacao: cliente.observacao || "",
    });
    setDialogOpen(true);
  };
  
  const handleDelete = (id: string) => {
    setClientes(clientes.filter(cliente => cliente.id !== id));
    toast({
      title: "Cliente removido",
      description: "O cliente foi removido com sucesso.",
    });
  };
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    
    let daysArray = [];
    for (let i = 1; i <= days; i++) {
      daysArray.push(new Date(year, month, i));
    }
    
    return daysArray;
  };
  
  const prevMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
  };
  
  const nextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
  };
  
  const daysInMonth = getDaysInMonth(currentMonth);
  
  // Filter clients by selected month
  const clientesNoMes = clientes.filter((cliente) => {
    const pagamentoMonth = cliente.diaPagamento.getMonth();
    const pagamentoYear = cliente.diaPagamento.getFullYear();
    return pagamentoMonth === currentMonth.getMonth() && pagamentoYear === currentMonth.getFullYear();
  });
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Card className="w-full md:w-auto">
          <CardHeader className="pb-3">
            <CardTitle>Resumo de Agendamentos</CardTitle>
            <CardDescription>Visão geral dos clientes agendados</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Total de Agendamentos</span>
                <span className="text-2xl font-bold">{clientes.length}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Pagamentos Simples</span>
                <span className="text-2xl font-bold">
                  {clientes.filter(c => c.tipo === 'pagamento').length}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Renegociações</span>
                <span className="text-2xl font-bold">
                  {clientes.filter(c => c.tipo === 'renegociacao').length}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Este Mês</span>
                <span className="text-2xl font-bold">
                  {clientesNoMes.length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="md:w-auto w-full" onClick={resetForm}>
              {editingCliente ? "Editar Cliente" : "Adicionar Cliente"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCliente ? "Editar Cliente" : "Adicionar Cliente"}</DialogTitle>
              <DialogDescription>
                {editingCliente 
                  ? "Edite as informações do cliente agendado." 
                  : "Adicione um novo cliente com agendamento de pagamento ou renegociação."
                }
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Cliente</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="conta"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número da Conta</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tipo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Agendamento</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pagamento">Pagamento de Parcelas</SelectItem>
                            <SelectItem value="renegociacao">Renegociação</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {tipoAgendamento === "pagamento" && (
                    <FormField
                      control={form.control}
                      name="valorParcelas"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor das Parcelas</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="R$ 0,00" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {tipoAgendamento === "renegociacao" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contratosNegociados"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contratos Negociados</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="valorEntrada"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor da Entrada</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="R$ 0,00" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="qtdParcelas"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantidade de Parcelas</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="valorCadaParcela"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor de cada Parcela</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="R$ 0,00" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="diaContato"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Dia do Contato</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
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
                              initialFocus
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="diaPagamento"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Dia do Pagamento</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
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
                              initialFocus
                              className="p-3 pointer-events-auto"
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
                  name="observacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observação</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => {
                    setDialogOpen(false);
                    resetForm();
                  }}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingCliente ? "Salvar Alterações" : "Adicionar Cliente"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Calendário de Agendamentos</CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" onClick={prevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="font-medium min-w-[120px] text-center">
                  {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
                </span>
                <Button variant="outline" size="icon" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardDescription>
              Visualize e gerencie os clientes agendados para cada dia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                <div key={day} className="text-center font-medium p-2 text-sm text-muted-foreground">
                  {day}
                </div>
              ))}
              
              {/* Preencher os dias vazios no começo do mês */}
              {Array.from({ length: daysInMonth[0].getDay() }).map((_, i) => (
                <div key={`empty-start-${i}`} className="p-2"></div>
              ))}
              
              {/* Dias do mês */}
              {daysInMonth.map((day) => {
                const clientesNoDia = clientes.filter((cliente) =>
                  cliente.diaPagamento.getDate() === day.getDate() &&
                  cliente.diaPagamento.getMonth() === day.getMonth() &&
                  cliente.diaPagamento.getFullYear() === day.getFullYear()
                );
                
                const isToday = new Date().toDateString() === day.toDateString();
                
                return (
                  <div
                    key={day.toString()}
                    className={cn(
                      "p-2 h-24 border rounded-md overflow-y-auto",
                      isToday ? "bg-muted" : "hover:bg-muted/50"
                    )}
                  >
                    <div className="text-right font-medium text-sm">{day.getDate()}</div>
                    {clientesNoDia.length > 0 ? (
                      <div className="mt-1 space-y-1">
                        {clientesNoDia.map((cliente) => (
                          <div
                            key={cliente.id}
                            className={cn(
                              "text-xs p-1 rounded truncate",
                              cliente.tipo === "pagamento"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            )}
                            title={cliente.nome}
                          >
                            {cliente.nome}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
              
              {/* Preencher os dias vazios no fim do mês */}
              {Array.from({ length: 6 - daysInMonth[daysInMonth.length - 1].getDay() }).map((_, i) => (
                <div key={`empty-end-${i}`} className="p-2"></div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes Agendados</CardTitle>
            <CardDescription>
              Todos os clientes com agendamentos de pagamento ou renegociação
            </CardDescription>
          </CardHeader>
          <CardContent>
            {clientes.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">Nenhum cliente agendado</p>
                <Button className="mt-4" onClick={() => setDialogOpen(true)}>
                  Adicionar Cliente
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Conta</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Data de Contato</TableHead>
                    <TableHead>Data de Pagamento</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientes.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell className="font-medium">{cliente.nome}</TableCell>
                      <TableCell>{cliente.conta}</TableCell>
                      <TableCell>
                        {cliente.tipo === "pagamento" ? "Pagamento" : "Renegociação"}
                      </TableCell>
                      <TableCell>
                        {format(cliente.diaContato, "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>
                        {format(cliente.diaPagamento, "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(cliente)}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(cliente.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Excluir</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
