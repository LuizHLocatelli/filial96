
import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { useDepositos } from "@/hooks/crediario/useDepositos";
import { DepositionsCalendar } from "./depositos/DepositionsCalendar";
import { DepositFormDialog } from "./depositos/DepositFormDialog";
import { ImagePreviewDialog } from "./depositos/ImagePreviewDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/hooks/use-toast";

export function Depositos() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { depositos, isLoading, isUploading, saveDeposito } = useDepositos();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [depositoId, setDepositoId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [viewImage, setViewImage] = useState<string | null>(null);
  const isMobile = useIsMobile();
  
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
    setSelectedDay(day);
    
    // Verificar se já existe um depósito para este dia
    const depositosForDay = depositos.filter(
      (deposito) => isSameDay(deposito.data, day)
    );
    
    if (depositosForDay.length > 0) {
      // Mostrar lista de depósitos existentes
      setDepositoId(null);
      setPreviewUrl(null);
    } else {
      // Iniciar novo depósito
      handleAddNewDeposito();
    }
    
    setOpenDialog(true);
  };
  
  const handleViewDeposito = (deposito: typeof depositos[0]) => {
    setDepositoId(deposito.id);
    setPreviewUrl(deposito.comprovante);
  };
  
  const handleAddNewDeposito = () => {
    setDepositoId(null);
    setPreviewUrl(null);
    setSelectedFile(null);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Verifica se o arquivo é uma imagem
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Tipo de arquivo inválido",
          description: "Por favor, selecione uma imagem.",
          variant: "destructive"
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
  
  const handleSubmit = async (jaIncluido: boolean) => {
    if (!selectedDay) {
      toast({
        title: "Data não selecionada",
        description: "Por favor, selecione uma data para o depósito.",
        variant: "destructive"
      });
      return;
    }
    
    const depositoData = {
      id: depositoId || undefined,
      data: selectedDay,
      concluido: true,
      jaIncluido: jaIncluido,
      comprovante: previewUrl || undefined
    };
    
    const success = await saveDeposito(depositoData, selectedFile);
    
    if (success) {
      setOpenDialog(false);
      setSelectedDay(null);
      setSelectedFile(null);
      setPreviewUrl(null);
      setDepositoId(null);
    }
  };
  
  // Obter todos os depósitos para o dia selecionado
  const depositosForDay = selectedDay 
    ? depositos.filter(deposito => isSameDay(deposito.data, selectedDay))
    : [];
  
  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <DepositionsCalendar 
            currentMonth={currentMonth}
            diasDoMes={diasDoMes}
            depositos={depositos}
            handlePrevMonth={handlePrevMonth}
            handleNextMonth={handleNextMonth}
            handleSelectDay={handleSelectDay}
            setViewImage={setViewImage}
          />
        </div>
      )}
      
      {/* Dialog para adicionar comprovante */}
      <DepositFormDialog
        openDialog={openDialog}
        selectedDay={selectedDay}
        previewUrl={previewUrl}
        isUploading={isUploading}
        depositoId={depositoId}
        depositosForDay={depositosForDay}
        setOpenDialog={setOpenDialog}
        handleFileChange={handleFileChange}
        handleRemoveFile={handleRemoveFile}
        handleSubmit={handleSubmit}
        onAddNewDeposito={handleAddNewDeposito}
        onViewDeposito={handleViewDeposito}
      />
      
      {/* Dialog para visualizar imagem */}
      <ImagePreviewDialog
        viewImage={viewImage}
        setViewImage={setViewImage}
      />
    </div>
  );
}
