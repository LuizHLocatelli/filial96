import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { useDepositos } from "@/hooks/crediario/useDepositos";
import { DepositionsCalendar } from "./depositos/DepositionsCalendar";
import { DepositFormDialog } from "./depositos/DepositFormDialog";
import { ImagePreviewDialog } from "./depositos/ImagePreviewDialog";
import { DailyStatusWidget } from "./depositos/DailyStatusWidget";
import { QuickDepositForm } from "./depositos/QuickDepositForm";
import { NotificationSystem } from "./depositos/NotificationSystem";
import { DepositAnalytics } from "./depositos/DepositAnalytics";
import { AutomationFeatures, CameraCapture } from "./depositos/AutomationFeatures";
import { 
  DailyStatusSkeleton, 
  QuickDepositFormSkeleton, 
  CalendarSkeleton,
  AnalyticsSkeleton,
  OfflineIndicator,
  SuccessAnimation,
  UploadProgress
} from "./depositos/LoadingStates";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/hooks/use-toast";
import { 
  Calendar, 
  BarChart3, 
  Settings, 
  Zap, 
  Camera, 
  Wifi, 
  WifiOff,
  RefreshCw,
  Download
} from "lucide-react";

interface ValidationResult {
  isValid: boolean;
  confidence: number;
  detectedInfo: {
    valor?: number;
    dataDeposito?: Date;
    banco?: string;
    tipoComprovante?: 'deposito' | 'transferencia' | 'boleto' | 'outros';
  };
  issues: string[];
  suggestions: string[];
}

export function Depositos() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { depositos, isLoading, isUploading, saveDeposito } = useDepositos();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [depositoId, setDepositoId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [viewImage, setViewImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showAutomation, setShowAutomation] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [automationResult, setAutomationResult] = useState<ValidationResult | null>(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ progress: number; fileName: string } | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const isMobile = useIsMobile();
  
  const diasDoMes = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  // Monitorar status de conexão
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
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
    setAutomationResult(null);
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
      
      // Auto-ativar análise de automação se disponível
      if (file.size < 5 * 1024 * 1024) {
        setShowAutomation(true);
      }
    }
  };

  const handleCameraCapture = (file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setShowCamera(false);
    setShowAutomation(true);
    
    toast({
      title: "Foto Capturada!",
      description: "Imagem capturada com sucesso. Analisando automaticamente...",
    });
  };

  const handleValidationResult = (result: ValidationResult) => {
    setAutomationResult(result);
    
    // Se a validação foi bem-sucedida, preencher campos automaticamente
    if (result.isValid && result.confidence > 0.8) {
      toast({
        title: "✨ Análise Automática Concluída",
        description: `Comprovante validado com ${Math.round(result.confidence * 100)}% de confiança!`,
        duration: 5000,
      });
    }
  };
  
  const handleRemoveFile = () => {
    if (selectedFile && previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setAutomationResult(null);
    setShowAutomation(false);
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

    // Simular progresso de upload
    if (selectedFile) {
      setUploadProgress({ progress: 0, fileName: selectedFile.name });
      
      // Simular progresso
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (!prev || prev.progress >= 100) {
            clearInterval(progressInterval);
            return null;
          }
          return { ...prev, progress: prev.progress + 10 };
        });
      }, 200);
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
      setUploadProgress(null);
      setShowSuccessAnimation(true);
      
      // Esconder animação de sucesso após 2 segundos
      setTimeout(() => {
        setShowSuccessAnimation(false);
      }, 2000);
      
      setOpenDialog(false);
      setSelectedDay(null);
      setSelectedFile(null);
      setPreviewUrl(null);
      setDepositoId(null);
      setAutomationResult(null);
      setShowAutomation(false);
    } else {
      setUploadProgress(null);
    }
  };

  // Handler para o formulário rápido
  const handleQuickSubmit = async (data: {
    data: Date;
    comprovante?: string;
    ja_incluido: boolean;
  }, file?: File) => {
    // Simular progresso se houver arquivo
    if (file) {
      setUploadProgress({ progress: 0, fileName: file.name });
      
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (!prev || prev.progress >= 100) {
            clearInterval(progressInterval);
            return null;
          }
          return { ...prev, progress: prev.progress + 15 };
        });
      }, 150);
    }

    const depositoData = {
      data: data.data,
      concluido: true,
      jaIncluido: data.ja_incluido,
      comprovante: data.comprovante
    };
    
    const success = await saveDeposito(depositoData, file);
    
    if (success) {
      setUploadProgress(null);
      setShowSuccessAnimation(true);
      
      setTimeout(() => {
        setShowSuccessAnimation(false);
      }, 2000);
    } else {
      setUploadProgress(null);
    }
    
    return success;
  };

  const handleRefreshData = async () => {
    // Implementar refresh manual dos dados
    window.location.reload();
  };

  const handleExportData = () => {
    // Implementar exportação de dados
    const data = JSON.stringify(depositos, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `depositos_${format(currentMonth, 'yyyy-MM')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Dados Exportados",
      description: "Arquivo de backup foi baixado com sucesso.",
    });
  };
  
  // Obter todos os depósitos para o dia selecionado
  const depositosForDay = selectedDay 
    ? depositos.filter(deposito => isSameDay(deposito.data, selectedDay))
    : [];

  // Render loading states
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DailyStatusSkeleton />
          <QuickDepositFormSkeleton />
        </div>
        <CalendarSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Indicador Offline */}
      <OfflineIndicator />

      {/* Sistema de Notificações */}
      <NotificationSystem 
        depositos={depositos} 
        enabled={notificationsEnabled} 
      />

      {/* Barra Superior com Status */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Gerenciamento de Depósitos
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema inteligente para acompanhamento de depósitos bancários
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Status de Conexão */}
              <Badge variant={isOnline ? "default" : "destructive"} className="flex items-center gap-1">
                {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                {isOnline ? "Online" : "Offline"}
              </Badge>

              {/* Controles */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshData}
                  disabled={!isOnline}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  {!isMobile && "Atualizar"}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportData}
                >
                  <Download className="h-4 w-4 mr-1" />
                  {!isMobile && "Exportar"}
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {!isMobile && "Dashboard"}
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {!isMobile && "Calendário"}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {!isMobile && "Analytics"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Dashboard Principal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DailyStatusWidget depositos={depositos} />
            <QuickDepositForm 
              depositos={depositos}
              isUploading={isUploading}
              onSubmit={handleQuickSubmit}
            />
          </div>

          {/* Funcionalidades de Automação */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recursos de IA */}
            <Card className="border border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  Recursos Inteligentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => setShowAutomation(!showAutomation)}
                  variant="outline"
                  className="w-full quick-action-btn automation"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Análise Automática de Comprovantes
                </Button>
                
                <Button
                  onClick={() => setShowCamera(!showCamera)}
                  variant="outline"
                  className="w-full"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Captura por Câmera
                </Button>
              </CardContent>
            </Card>

            {/* Configurações */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Notificações</span>
                  <Button
                    variant={notificationsEnabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  >
                    {notificationsEnabled ? "Ativas" : "Inativas"}
                  </Button>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Total de depósitos este mês: <strong>{depositos.filter(d => 
                    d.data >= startOfMonth(currentMonth) && d.data <= endOfMonth(currentMonth)
                  ).length}</strong>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Análise Automática */}
          {showAutomation && selectedFile && (
            <AutomationFeatures
              selectedFile={selectedFile}
              onValidationResult={handleValidationResult}
            />
          )}

          {/* Captura por Câmera */}
          {showCamera && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Captura por Câmera</CardTitle>
              </CardHeader>
              <CardContent>
                <CameraCapture onCapture={handleCameraCapture} />
              </CardContent>
            </Card>
          )}

          {/* Calendário Resumido */}
          <DepositionsCalendar 
            currentMonth={currentMonth}
            diasDoMes={diasDoMes}
            depositos={depositos}
            handlePrevMonth={handlePrevMonth}
            handleNextMonth={handleNextMonth}
            handleSelectDay={handleSelectDay}
            setViewImage={setViewImage}
          />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          {/* Calendário Completo */}
          <DepositionsCalendar 
            currentMonth={currentMonth}
            diasDoMes={diasDoMes}
            depositos={depositos}
            handlePrevMonth={handlePrevMonth}
            handleNextMonth={handleNextMonth}
            handleSelectDay={handleSelectDay}
            setViewImage={setViewImage}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics e Relatórios */}
          {isLoading ? (
            <AnalyticsSkeleton />
          ) : (
            <DepositAnalytics 
              depositos={depositos}
              currentMonth={currentMonth}
            />
          )}
        </TabsContent>
      </Tabs>
      
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

      {/* Animação de Sucesso */}
      {showSuccessAnimation && (
        <SuccessAnimation message="Depósito registrado com sucesso!" />
      )}

      {/* Progress de Upload */}
      {uploadProgress && (
        <UploadProgress 
          progress={uploadProgress.progress} 
          fileName={uploadProgress.fileName} 
        />
      )}
    </div>
  );
}
