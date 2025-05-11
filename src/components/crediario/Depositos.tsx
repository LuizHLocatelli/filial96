
import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, ChevronLeft, ChevronRight, Upload, X, Image as ImageIcon } from "lucide-react";
import { useDepositos, Deposito } from "@/hooks/crediario/useDepositos";

export function Depositos() {
  const { toast } = useToast();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { depositos, isLoading, isUploading, saveDeposito, deleteDeposito } = useDepositos();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [depositoId, setDepositoId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [viewImage, setViewImage] = useState<string | null>(null);
  
  const diasDoMes = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });
  
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
  
  const handleSelectDay = (day: Date) => {
    // Verificar se já existe um depósito para este dia
    const existingDeposito = depositos.find(
      (deposito) => isSameDay(deposito.data, day)
    );
    
    if (existingDeposito) {
      setDepositoId(existingDeposito.id);
      setPreviewUrl(existingDeposito.comprovante);
    } else {
      setDepositoId(null);
      setPreviewUrl(null);
    }
    
    setSelectedDay(day);
    setSelectedFile(null);
    setOpenDialog(true);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Verifica se o arquivo é uma imagem
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Formato inválido",
          description: "Por favor, selecione uma imagem.",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };
  
  const handleRemoveFile = () => {
    if (selectedFile && previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
  };
  
  const handleSubmit = async () => {
    if (!selectedDay) return;
    
    const depositoData: Partial<Deposito> = {
      id: depositoId || undefined,
      data: selectedDay,
      concluido: true,
      comprovante: depositoId ? previewUrl : undefined
    };
    
    const success = await saveDeposito(depositoData, selectedFile);
    
    if (success) {
      setOpenDialog(false);
      setSelectedDay(null);
    }
  };
  
  const calcularProgresso = () => {
    // Filtra os depósitos do mês atual
    const depositosDoMes = depositos.filter((deposito) => 
      deposito.data.getMonth() === currentMonth.getMonth() && 
      deposito.data.getFullYear() === currentMonth.getFullYear()
    );
    
    // Calcula dias úteis (excluindo sábados e domingos)
    const diasUteisNoMes = diasDoMes.filter(
      (day) => ![0, 6].includes(day.getDay())
    ).length;
    
    if (diasUteisNoMes === 0) return 0;
    
    // Retorna o percentual
    return Math.round((depositosDoMes.length / diasUteisNoMes) * 100);
  };
  
  const progresso = calcularProgresso();
  
  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Acompanhamento de Depósitos</CardTitle>
              <CardDescription>
                Progresso dos depósitos bancários neste mês
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Progresso</span>
                  <span className="text-sm font-medium">{progresso}%</span>
                </div>
                <Progress value={progresso} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground text-sm">Total de Depósitos</span>
                  <p className="text-xl font-bold">
                    {depositos.filter((d) => 
                      d.data.getMonth() === currentMonth.getMonth() && 
                      d.data.getFullYear() === currentMonth.getFullYear()
                    ).length}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">Dias Úteis</span>
                  <p className="text-xl font-bold">
                    {diasDoMes.filter((day) => ![0, 6].includes(day.getDay())).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Calendário de Depósitos</CardTitle>
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
                Clique em um dia para marcar como concluído ou adicionar um comprovante
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                  <div key={day} className="text-center font-medium p-2 text-sm text-muted-foreground">
                    {day}
                  </div>
                ))}
                
                {/* Espaços vazios antes do primeiro dia do mês */}
                {Array.from({ length: diasDoMes[0].getDay() }).map((_, i) => (
                  <div key={`empty-start-${i}`} className="p-2"></div>
                ))}
                
                {/* Dias do mês */}
                {diasDoMes.map((day) => {
                  const deposito = depositos.find(
                    (deposito) => isSameDay(deposito.data, day)
                  );
                  
                  const isWeekend = [0, 6].includes(day.getDay());
                  const isToday = isSameDay(day, new Date());
                  
                  return (
                    <button
                      key={day.toString()}
                      type="button"
                      onClick={() => !isWeekend && handleSelectDay(day)}
                      disabled={isWeekend}
                      className={`
                        p-2 h-16 border rounded-md flex flex-col items-center justify-center
                        ${isToday ? "bg-muted" : ""}
                        ${isWeekend ? "bg-gray-50 opacity-50 cursor-not-allowed" : "hover:bg-muted/50"}
                        ${deposito?.concluido ? "border-green-500 border-2" : ""}
                      `}
                    >
                      <div className="font-medium">{day.getDate()}</div>
                      {deposito?.concluido && (
                        <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                      )}
                      {deposito?.comprovante && (
                        <ImageIcon 
                          className="h-3 w-3 text-blue-500 mt-1 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewImage(deposito.comprovante);
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Dialog para adicionar comprovante */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Depósito Bancário
              {selectedDay && ` - ${format(selectedDay, "dd/MM/yyyy")}`}
            </DialogTitle>
            <DialogDescription>
              Registre seu depósito bancário diário e anexe o comprovante.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="comprovante">Comprovante de Depósito</Label>
              {previewUrl ? (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Comprovante"
                    className="max-h-48 max-w-full object-contain mx-auto border rounded-md"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white rounded-full h-8 w-8 p-0"
                    onClick={handleRemoveFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                  <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Clique para selecionar ou arraste uma imagem
                  </p>
                  <Input
                    id="comprovante"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="comprovante">
                    <Button variant="outline" type="button" className="cursor-pointer">
                      Selecionar arquivo
                    </Button>
                  </label>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isUploading}>
              {isUploading ? "Salvando..." : (depositoId ? "Atualizar Depósito" : "Registrar Depósito")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog para visualizar imagem */}
      <Dialog open={!!viewImage} onOpenChange={() => setViewImage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Comprovante de Depósito</DialogTitle>
          </DialogHeader>
          {viewImage && (
            <div className="flex justify-center my-4">
              <img
                src={viewImage}
                alt="Comprovante"
                className="max-h-[70vh] max-w-full object-contain"
              />
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewImage(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
