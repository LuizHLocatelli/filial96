
import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { useDepositos } from "@/hooks/crediario/useDepositos";
import { DepositStats } from "./depositos/DepositStats";
import { DepositionsCalendar } from "./depositos/DepositionsCalendar";
import { DepositFormDialog } from "./depositos/DepositFormDialog";
import { ImagePreviewDialog } from "./depositos/ImagePreviewDialog";

export function Depositos() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { depositos, isLoading, isUploading, saveDeposito } = useDepositos();
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
        alert("Por favor, selecione uma imagem.");
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
    
    const depositoData = {
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
          <DepositStats 
            depositos={depositos}
            currentMonth={currentMonth}
            diasDoMes={diasDoMes}
            progresso={progresso}
          />
          
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
        setOpenDialog={setOpenDialog}
        handleFileChange={handleFileChange}
        handleRemoveFile={handleRemoveFile}
        handleSubmit={handleSubmit}
      />
      
      {/* Dialog para visualizar imagem */}
      <ImagePreviewDialog
        viewImage={viewImage}
        setViewImage={setViewImage}
      />
    </div>
  );
}
