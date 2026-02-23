import { useState, useMemo } from "react";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bot, CalendarIcon, Loader2, CheckCircle2, AlertCircle, Truck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Dialog, DialogContent, DialogDescription } from "@/components/ui/dialog";
import { StandardDialogHeader, StandardDialogFooter } from "@/components/ui/standard-dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { fetchConsultores, generateEscalaWithAI, saveEscalas } from "./services/escalasApi";
import { EscalaAIResponse } from "@/types/shared/escalas";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function GeradorEscalaDialog({ open, onOpenChange, onSuccess }: Props) {
  const { toast } = useToast();
  
  // States
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [daysToGenerate, setDaysToGenerate] = useState(30);
  const [firstPairIds, setFirstPairIds] = useState<string[]>([]);
  const [excludedConsultantsIds, setExcludedConsultantsIds] = useState<string[]>([]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewSchedule, setPreviewSchedule] = useState<EscalaAIResponse[] | null>(null);

  // Queries
  const { data: consultores, isLoading: isLoadingConsultores } = useQuery({
    queryKey: ["consultores-moveis"],
    queryFn: fetchConsultores,
  });

  const availableConsultantsIds = useMemo(() => {
    return consultores?.map(c => c.id) || [];
  }, [consultores]);

  // Handlers
  const handleGenerate = async () => {
    if (firstPairIds.length !== 2) {
      toast({
        variant: "destructive",
        title: "Seleção incompleta",
        description: "Você deve selecionar exatamente 2 pessoas para iniciar a carga."
      });
      return;
    }

    if (!startDate) {
      toast({
        variant: "destructive",
        title: "Data inválida",
        description: "Selecione uma data de início válida."
      });
      return;
    }

    const dateObj = new Date(startDate + "T12:00:00");
    const dayOfWeek = dateObj.getDay();
    if (dayOfWeek !== 1) { // 1 = Segunda
      toast({
        variant: "destructive",
        title: "Data inválida",
        description: "A escala da carga deve sempre começar em uma Segunda-feira."
      });
      return;
    }

    try {
      setIsGenerating(true);
      const schedule = await generateEscalaWithAI({
        startDate,
        daysToGenerate,
        firstPairIds,
        availableConsultantsIds,
        excludedConsultantsIds
      });
      
      setPreviewSchedule(schedule);
      toast({
        title: "Escala gerada com sucesso!",
        description: "Revise a escala antes de salvar no banco de dados.",
      });
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro ao gerar escala",
        description: error.message || "A inteligência artificial encontrou um erro."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!previewSchedule) return;

    try {
      setIsSaving(true);
      await saveEscalas(previewSchedule);
      
      toast({
        title: "Escala salva!",
        description: "A escala foi registrada com sucesso.",
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro ao salvar a escala no banco de dados."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setPreviewSchedule(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto flex flex-col p-0 sm:max-w-3xl" hideCloseButton>
        <StandardDialogHeader 
          icon={Bot} 
          title="Gerador de Escala com IA" 
          onClose={() => onOpenChange(false)} 
        />
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <DialogDescription>
            Defina os parâmetros e deixe a Inteligência Artificial calcular automaticamente a escala da sua equipe, respeitando folgas e espelhamento de horários.
          </DialogDescription>

          {!previewSchedule ? (
            <div className="space-y-6">
              {/* Parameters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Data de Início (Segunda-feira)</Label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="startDate"
                      type="date" 
                      className="pl-9"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="days">Período (Dias)</Label>
                  <Input 
                    id="days"
                    type="number" 
                    min={7}
                    max={90}
                    value={daysToGenerate}
                    onChange={(e) => setDaysToGenerate(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">Recomendado: 30 dias (1 mês).</p>
                </div>
              </div>

              {/* Consultants Selection */}
              {isLoadingConsultores ? (
                <div className="flex items-center justify-center p-6"><Loader2 className="animate-spin" /></div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b pb-2">
                      <Truck className="h-4 w-4 text-primary" />
                      <div>
                        <Label className="text-base">Equipe da Primeira Carga</Label>
                        <p className="text-sm text-muted-foreground">Selecione as 2 pessoas que farão a carga no primeiro dia da escala ({format(new Date(startDate + "T12:00:00"), "dd/MM", { locale: ptBR })}).</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {consultores?.map(consultor => (
                        <Card 
                          key={`first-${consultor.id}`}
                          className={`cursor-pointer transition-colors ${
                            firstPairIds.includes(consultor.id) 
                              ? "border-primary bg-primary/5" 
                              : "hover:border-primary/50"
                          } ${excludedConsultantsIds.includes(consultor.id) ? "opacity-50 pointer-events-none" : ""}`}
                          onClick={() => {
                            if (excludedConsultantsIds.includes(consultor.id)) return;
                            
                            setFirstPairIds(prev => {
                              if (prev.includes(consultor.id)) return prev.filter(id => id !== consultor.id);
                              if (prev.length < 2) return [...prev, consultor.id];
                              return [prev[1], consultor.id]; // Replace oldest if full
                            });
                          }}
                        >
                          <CardContent className="p-3 flex items-center gap-3">
                            <Checkbox 
                              checked={firstPairIds.includes(consultor.id)} 
                              onCheckedChange={() => {}} // Handled by Card onClick
                              className="pointer-events-none"
                            />
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={consultor.avatar_url || ''} />
                              <AvatarFallback>{consultor.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium line-clamp-1">{consultor.name}</span>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-2 border-b pb-2">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <div>
                        <Label className="text-base text-destructive">Exceções (Férias/Atestados)</Label>
                        <p className="text-sm text-muted-foreground">Selecione consultores que não devem participar desta escala (opcional).</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {consultores?.map(consultor => (
                        <Card 
                          key={`exc-${consultor.id}`}
                          className={`cursor-pointer transition-colors ${
                            excludedConsultantsIds.includes(consultor.id) 
                              ? "border-destructive bg-destructive/5" 
                              : "hover:border-destructive/30"
                          } ${firstPairIds.includes(consultor.id) ? "opacity-50 pointer-events-none" : ""}`}
                          onClick={() => {
                            if (firstPairIds.includes(consultor.id)) return;
                            
                            setExcludedConsultantsIds(prev => {
                              if (prev.includes(consultor.id)) return prev.filter(id => id !== consultor.id);
                              return [...prev, consultor.id];
                            });
                          }}
                        >
                          <CardContent className="p-3 flex items-center gap-3">
                            <Checkbox 
                              checked={excludedConsultantsIds.includes(consultor.id)} 
                              onCheckedChange={() => {}} // Handled by Card onClick
                              className="pointer-events-none border-destructive data-[state=checked]:bg-destructive data-[state=checked]:border-destructive"
                            />
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={consultor.avatar_url || ''} />
                              <AvatarFallback>{consultor.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium line-clamp-1">{consultor.name}</span>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg flex items-center justify-between border">
                <div>
                  <h4 className="font-semibold text-primary flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" /> Escala Gerada com Sucesso
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Revise os horários abaixo antes de salvar. Foram gerados {previewSchedule.length} turnos.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={resetForm}>Voltar</Button>
              </div>

              <ScrollArea className="h-[400px] rounded-md border p-4">
                <div className="space-y-4">
                  {/* Group preview by date */}
                  {Array.from(new Set(previewSchedule.map(s => s.date))).sort().map(date => {
                    const daySchedule = previewSchedule.filter(s => s.date === date);
                    const isCargaDay = ["Monday", "Wednesday", "Friday"].includes(format(new Date(date + "T12:00:00"), "EEEE"));
                    
                    return (
                      <div key={date} className="space-y-2 pb-4 border-b last:border-0">
                        <h5 className="font-medium text-sm flex items-center justify-between bg-muted/30 p-2 rounded">
                          <span className="capitalize">{format(new Date(date + "T12:00:00"), "EEEE, dd 'de' MMMM", { locale: ptBR })}</span>
                          {isCargaDay && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Dia de Carga</span>}
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2">
                          {daySchedule.map((shift, i) => {
                            const consultor = consultores?.find(c => c.id === shift.user_id);
                            return (
                              <div key={i} className={`flex items-center justify-between p-2 rounded text-sm border ${shift.is_carga ? 'border-primary/30 bg-primary/5' : 'bg-background'}`}>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="text-[10px]">{consultor?.name?.charAt(0) || '?'}</AvatarFallback>
                                  </Avatar>
                                  <span className="truncate max-w-[120px]">{consultor?.name || 'Desconhecido'}</span>
                                </div>
                                <span className={`font-mono text-xs px-1.5 py-0.5 rounded ${shift.is_carga ? 'bg-primary/20 font-semibold' : 'bg-muted'}`}>
                                  {shift.shift_start.substring(0, 5)} - {shift.shift_end.substring(0, 5)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <StandardDialogFooter>
          {!previewSchedule ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button onClick={handleGenerate} disabled={isGenerating || firstPairIds.length !== 2 || !startDate}>
                {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isGenerating ? "Gerando..." : "Gerar com IA"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={resetForm} disabled={isSaving}>Descartar</Button>
              <Button onClick={handleSave} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSaving ? "Salvando..." : "Salvar Escala"}
              </Button>
            </>
          )}
        </StandardDialogFooter>
      </DialogContent>
    </Dialog>
  );
}
