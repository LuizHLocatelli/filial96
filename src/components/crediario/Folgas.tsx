import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, addDays, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { CalendarIcon, ChevronLeft, ChevronRight, Trash2, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Crediarista {
  id: string;
  nome: string;
  avatar?: string;
}

interface Folga {
  id: string;
  data: Date;
  crediaristaId: string;
  motivo?: string;
}

export function Folgas() {
  const { toast } = useToast();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [crediaristas] = useState<Crediarista[]>([
    { id: "1", nome: "Ana Silva" },
    { id: "2", nome: "Carlos Oliveira" },
    { id: "3", nome: "Juliana Costa" },
  ]);
  const [folgas, setFolgas] = useState<Folga[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedCrediarista, setSelectedCrediarista] = useState<string>("");
  const [viewImage, setViewImage] = useState<string | null>(null);
  
  const handlePrevMonth = () => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };
  
  const handleNextMonth = () => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };
  
  const handleAddFolga = () => {
    if (!selectedDate) {
      toast({
        title: "Selecione uma data",
        description: "Por favor, selecione uma data para a folga.",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedCrediarista) {
      toast({
        title: "Selecione um crediarista",
        description: "Por favor, selecione um crediarista para a folga.",
        variant: "destructive",
      });
      return;
    }
    
    // Verificar se já existe folga para este crediarista nesta data
    const existingFolga = folgas.find(
      (folga) =>
        folga.crediaristaId === selectedCrediarista &&
        isSameDay(folga.data, selectedDate)
    );
    
    if (existingFolga) {
      toast({
        title: "Folga já registrada",
        description: "Este crediarista já possui folga registrada nesta data.",
        variant: "destructive",
      });
      return;
    }
    
    const novaFolga: Folga = {
      id: Math.random().toString(36).substr(2, 9),
      data: selectedDate,
      crediaristaId: selectedCrediarista,
    };
    
    setFolgas([...folgas, novaFolga]);
    
    toast({
      title: "Folga adicionada",
      description: `Folga registrada para ${format(selectedDate, "dd/MM/yyyy")}.`,
    });
    
    setOpenDialog(false);
    setSelectedDate(null);
    setSelectedCrediarista("");
  };
  
  const handleDeleteFolga = (folgaId: string) => {
    setFolgas(folgas.filter((folga) => folga.id !== folgaId));
    toast({
      title: "Folga removida",
      description: "A folga foi removida com sucesso.",
    });
  };
  
  const getCrediaristaById = (id: string) => {
    return crediaristas.find((crediarista) => crediarista.id === id);
  };
  
  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });
  
  // Função para gerar semanas do mês
  const getWeeks = () => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const end = endOfMonth(currentMonth);
    const totalDays = eachDayOfInterval({ start, end });
    
    const weeks = [];
    let week = [];
    
    for (let i = 0; i < totalDays.length; i++) {
      week.push(totalDays[i]);
      if (week.length === 7 || i === totalDays.length - 1) {
        weeks.push(week);
        week = [];
      }
    }
    
    // Completar a última semana, se necessário
    if (week.length > 0 && week.length < 7) {
      const lastDay = week[week.length - 1];
      for (let i = 1; i <= 7 - week.length; i++) {
        week.push(addDays(lastDay, i));
      }
      weeks.push(week);
    }
    
    return weeks;
  };
  
  const weeks = getWeeks();
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Card className="w-full md:w-auto">
          <CardHeader className="pb-3">
            <CardTitle>Folgas Registradas</CardTitle>
            <CardDescription>
              Resumo das folgas da equipe de crediaristas
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-3 gap-4">
              {crediaristas.map((crediarista) => (
                <div key={crediarista.id} className="flex flex-col">
                  <span className="text-muted-foreground text-sm">
                    {crediarista.nome}
                  </span>
                  <span className="text-2xl font-bold">
                    {folgas.filter(
                      (folga) => folga.crediaristaId === crediarista.id &&
                      folga.data.getMonth() === currentMonth.getMonth() &&
                      folga.data.getFullYear() === currentMonth.getFullYear()
                    ).length}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Button onClick={() => setOpenDialog(true)}>
          Adicionar Folga
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Calendário de Folgas</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium min-w-[120px] text-center">
                {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
              </span>
              <Button variant="outline" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription>
            Visualização de folgas por crediarista durante o mês
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-40">Crediarista</TableHead>
                {weeks[0]?.map((day) => (
                  <TableHead key={day.toString()} className="text-center p-1">
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-muted-foreground">
                        {format(day, "EEE", { locale: ptBR })}
                      </span>
                      <span className={cn(
                        "font-medium",
                        !isSameMonth(day, currentMonth) && "text-muted-foreground opacity-50"
                      )}>
                        {day.getDate()}
                      </span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {crediaristas.map((crediarista) => (
                <TableRow key={crediarista.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span>{crediarista.nome}</span>
                    </div>
                  </TableCell>
                  {weeks[0]?.map((day) => {
                    // Verificar se existe folga para este crediarista neste dia
                    const folga = folgas.find(
                      (folga) =>
                        folga.crediaristaId === crediarista.id &&
                        isSameDay(folga.data, day)
                    );
                    
                    return (
                      <TableCell key={day.toString()} className="text-center p-1">
                        {folga && (
                          <div 
                            className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mx-auto cursor-pointer"
                            title={`Folga de ${crediarista.nome} em ${format(day, "dd/MM/yyyy")}`}
                          >
                            <span className="h-2 w-2 bg-blue-500 rounded-full" />
                          </div>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* Exibir outras semanas */}
          {weeks.slice(1).map((week, weekIndex) => (
            <Table key={`week-${weekIndex + 1}`} className="mt-4">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-40"></TableHead>
                  {week.map((day) => (
                    <TableHead key={day.toString()} className="text-center p-1">
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-muted-foreground">
                          {format(day, "EEE", { locale: ptBR })}
                        </span>
                        <span className={cn(
                          "font-medium",
                          !isSameMonth(day, currentMonth) && "text-muted-foreground opacity-50"
                        )}>
                          {day.getDate()}
                        </span>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {crediaristas.map((crediarista) => (
                  <TableRow key={`${crediarista.id}-week-${weekIndex + 1}`}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span>{crediarista.nome}</span>
                      </div>
                    </TableCell>
                    {week.map((day) => {
                      // Verificar se existe folga para este crediarista neste dia
                      const folga = folgas.find(
                        (folga) =>
                          folga.crediaristaId === crediarista.id &&
                          isSameDay(folga.data, day)
                      );
                      
                      return (
                        <TableCell key={day.toString()} className="text-center p-1">
                          {folga && (
                            <div 
                              className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mx-auto cursor-pointer"
                              title={`Folga de ${crediarista.nome} em ${format(day, "dd/MM/yyyy")}`}
                            >
                              <span className="h-2 w-2 bg-blue-500 rounded-full" />
                            </div>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ))}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Lista de Folgas</CardTitle>
          <CardDescription>Gerencie todas as folgas registradas</CardDescription>
        </CardHeader>
        <CardContent>
          {folgas.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">Nenhuma folga registrada</p>
              <Button className="mt-4" onClick={() => setOpenDialog(true)}>
                Adicionar Folga
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Crediarista</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {folgas
                  .sort((a, b) => b.data.getTime() - a.data.getTime())
                  .map((folga) => {
                    const crediarista = getCrediaristaById(folga.crediaristaId);
                    return (
                      <TableRow key={folga.id}>
                        <TableCell className="font-medium">
                          {crediarista?.nome || "Desconhecido"}
                        </TableCell>
                        <TableCell>
                          {format(folga.data, "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteFolga(folga.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Excluir</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Dialog para adicionar folga */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Folga</DialogTitle>
            <DialogDescription>
              Selecione um crediarista e uma data para registrar uma folga.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Crediarista</label>
              <Select
                value={selectedCrediarista}
                onValueChange={setSelectedCrediarista}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um crediarista" />
                </SelectTrigger>
                <SelectContent>
                  {crediaristas.map((crediarista) => (
                    <SelectItem key={crediarista.id} value={crediarista.id}>
                      {crediarista.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Data da Folga</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddFolga}>
              Adicionar Folga
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog para visualizar imagem */}
      <Dialog open={!!viewImage} onOpenChange={() => setViewImage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Visualizar Imagem</DialogTitle>
          </DialogHeader>
          <DialogContent className="p-0">
            <img src={viewImage} alt="Imagem" className="w-full h-full object-cover" />
          </DialogContent>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewImage(null)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
