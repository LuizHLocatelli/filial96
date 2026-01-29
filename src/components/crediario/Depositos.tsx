import { useState, useEffect, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Camera, Settings, Zap, Download, RefreshCw, Home, Calendar, BarChart3, FileText, Trash2, AlertTriangle, Crown } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useDepositos } from "@/hooks/crediario/useDepositos";
import { DailyStatusWidget } from "./depositos/DailyStatusWidget";
import { QuickDepositForm } from "./depositos/QuickDepositForm";
import { DepositionsCalendar } from "./depositos/DepositionsCalendar";
import { DepositFormDialog } from "./depositos/DepositFormDialog";
import { ImagePreviewDialog } from "./depositos/ImagePreviewDialog";
import { NotificationSystem } from "./depositos/NotificationSystem";
import { DepositAnalytics } from "./depositos/DepositAnalytics";
import { UploadProgress, AnalyticsSkeleton } from "./depositos/LoadingStates";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function Depositos() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [depositoId, setDepositoId] = useState<string | null>(null);
  const [viewImage, setViewImage] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{progress: number, fileName: string} | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const { toast } = useToast();
  const { profile } = useAuth();
  const isManager = profile?.role === 'gerente';
  const { 
    depositos, 
    statistics,
    isLoading, 
    lastResetDate,
    addDeposito, 
    updateDeposito, 
    deleteDeposito,
    clearAllDepositos,
    fetchDepositos,
    getMonthStatistics,
    forceRecalculateStatistics
  } = useDepositos();

  // Calcular dias do mês para o calendário
  const diasDoMes = useMemo(() => {
    return eachDayOfInterval({
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth)
    });
  }, [currentMonth]);

  // Depósitos do dia selecionado
  const depositosForDay = selectedDay 
    ? depositos.filter(d => isSameDay(d.data, selectedDay))
    : [];

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

  useEffect(() => {
    fetchDepositos();
  }, []);

  const handlePrevMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() - 1);
      return newMonth;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + 1);
      return newMonth;
    });
  };

  const handleSelectDay = (day: Date) => {
    setSelectedDay(day);
    setOpenDialog(true);
    
    // Se já existe depósito para o dia, carregá-lo
    const depositoExistente = depositos.find(d => isSameDay(d.data, day));
    if (depositoExistente) {
      setDepositoId(depositoExistente.id);
      setPreviewUrl(depositoExistente.comprovante);
    } else {
      setDepositoId(null);
      setPreviewUrl(null);
    }
  };

  const handleViewDeposito = (deposito: typeof depositos[0]) => {
    setSelectedDay(deposito.data);
    setDepositoId(deposito.id);
    setPreviewUrl(deposito.comprovante || null);
    setOpenDialog(true);
  };

  const handleAddNewDeposito = () => {
    setDepositoId(null);
    setPreviewUrl(null);
    setSelectedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 10MB.",
          variant: "destructive",
          duration: 4000,
        });
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleCameraCapture = (file: File) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setShowCamera(false);
    
    toast({
      title: "✅ Imagem Capturada",
      description: "Imagem capturada com sucesso! Pronta para upload.",
      duration: 3000,
    });
  };

  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
  };

  const resetDialogState = () => {
    setSelectedDay(null);
    setDepositoId(null);
    setPreviewUrl(null);
    setSelectedFile(null);
    setUploadProgress(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setTimeout(resetDialogState, 200);
  };

  const handleSubmit = async (jaIncluido: boolean) => {
    if (!selectedDay) return;

    try {
      setIsUploading(true);
      
      if (selectedFile) {
        setUploadProgress({ progress: 0, fileName: selectedFile.name });
        
        for (let i = 0; i <= 100; i += 20) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setUploadProgress({ progress: i, fileName: selectedFile.name });
        }
      }

      if (depositoId) {
        const updateData: any = {
          data: selectedDay,
          ja_incluido: jaIncluido
        };

        if (selectedFile) {
          updateData.comprovante = selectedFile;
        } else if (previewUrl && !previewUrl.startsWith('blob:')) {
          updateData.comprovante = previewUrl;
        }

        await updateDeposito(depositoId, updateData);
      } else {
        await addDeposito({
          data: selectedDay,
          comprovante: selectedFile,
          ja_incluido: jaIncluido
        });
      }

      handleCloseDialog();
      handleRemoveFile();
      setUploadProgress(null);
      setDepositoId(null);
      setSelectedDay(null);
      
      try {
        await forceRecalculateStatistics(currentMonth);
      } catch (error) {
        console.warn('⚠️ Erro ao atualizar estatísticas:', error);
      }
      
    } catch (error) {
      console.error('Erro ao salvar depósito:', error);
      toast({
        title: "❌ Erro ao Salvar",
        description: "Não foi possível salvar o depósito. Tente novamente.",
        variant: "destructive",
        duration: 4000,
      });
      setUploadProgress(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleQuickSubmit = async (data: {
    data: Date;
    comprovante?: string;
    ja_incluido: boolean;
  }, file?: File): Promise<boolean> => {
    try {
      setIsUploading(true);
      
      if (file) {
        setUploadProgress({ progress: 0, fileName: file.name });
        
        for (let i = 0; i <= 100; i += 25) {
          await new Promise(resolve => setTimeout(resolve, 80));
          setUploadProgress({ progress: i, fileName: file.name });
        }
      }

      const depositoExistente = depositos.find(d => isSameDay(d.data, data.data));
      
      if (depositoExistente) {
        await updateDeposito(depositoExistente.id, {
          data: data.data,
          comprovante: data.comprovante,
          ja_incluido: data.ja_incluido
        });
      } else {
        await addDeposito({
          data: data.data,
          comprovante: file,
          ja_incluido: data.ja_incluido
        });
      }

      handleCloseDialog();
      handleRemoveFile();
      setUploadProgress(null);
      
      try {
        await forceRecalculateStatistics(currentMonth);
      } catch (error) {
        console.warn('⚠️ Erro ao atualizar estatísticas:', error);
      }
      
      return true;
      
    } catch (error) {
      console.error('Erro no quick submit:', error);
      toast({
        title: "❌ Erro",
        description: "Erro ao registrar depósito.",
        variant: "destructive",
        duration: 4000,
      });
      setUploadProgress(null);
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      await fetchDepositos();
      await forceRecalculateStatistics(currentMonth);
      
      toast({
        title: "✅ Dados Atualizados",
        description: "Depósitos e estatísticas foram atualizados com sucesso.",
        duration: 3000,
      });
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      toast({
        title: "❌ Erro",
        description: "Falha ao atualizar dados. Tente novamente.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefreshStatistics = async () => {
    await forceRecalculateStatistics(currentMonth);
  };

  const handleDeleteDeposito = async (depositoId: string) => {
    try {
      await deleteDeposito(depositoId);
      await forceRecalculateStatistics(currentMonth);
    } catch (error) {
      console.error('Erro ao deletar depósito:', error);
    }
  };

  const handleClearAllDepositos = async () => {
    try {
      const success = await clearAllDepositos();
      if (success) {
        toast({
          title: "✅ Histórico Removido",
          description: "Todo o histórico de depósitos foi removido com sucesso.",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Erro ao limpar histórico:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível remover o histórico de depósitos.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleExportData = () => {
    try {
      const doc = new jsPDF();
      doc.text('RELATÓRIO DE DEPÓSITOS BANCÁRIOS', 105, 30, { align: 'center' });
      doc.text(`FILIAL 96 - ${format(currentMonth, 'MMMM yyyy', { locale: ptBR }).toUpperCase()}`, 105, 45, { align: 'center' });
      doc.save(`relatorio-depositos-${format(currentMonth, 'yyyy-MM')}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
    }
  };

  const currentMonthStats = getMonthStatistics(currentMonth);

  return (
    <div className="w-full mx-auto animate-fade-in space-y-4 sm:space-y-6 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5 max-w-7xl">
      {/* Notificações */}
        {notificationsEnabled && (
          <NotificationSystem 
          enabled={notificationsEnabled}
            depositos={depositos} 
          />
        )}

        {!isOnline && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0"></div>
            <span className="text-xs sm:text-sm text-yellow-800">
              Modo offline - As alterações serão sincronizadas quando a conexão for restaurada
            </span>
          </div>
        )}

        <Tabs defaultValue="dashboard" className="w-full">
        {/* Header */}
        <div className="flex flex-col space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Depósitos Diários
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  Gerencie seus depósitos bancários de forma inteligente
                </p>
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshData}
                  disabled={isRefreshing}
                className="flex-1 sm:flex-none text-sm h-10 sm:h-9"
                >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Atualizar
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportData}
                className="flex-1 sm:flex-none text-sm h-10 sm:h-9"
                >
                <FileText className="h-4 w-4 mr-2" />
                Relatório
                </Button>
              </div>
            </div>

          <TabsList className="grid w-full grid-cols-3 max-w-[320px] mx-auto h-11">
            <TabsTrigger value="dashboard" className="flex items-center gap-2 text-sm">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Início</span>
                </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Calendário</span>
                </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2 text-sm">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
                </TabsTrigger>
              </TabsList>
          </div>

        <TabsContent value="dashboard" className="space-y-6 mt-4">
            <DailyStatusWidget 
              depositos={depositos}
            />

            <QuickDepositForm 
              depositos={depositos}
              onSubmit={handleQuickSubmit}
              isUploading={isUploading}
            />

            <DepositionsCalendar
              currentMonth={currentMonth}
              diasDoMes={diasDoMes}
              depositos={depositos}
              monthStatistics={currentMonthStats}
              lastResetDate={lastResetDate}
              handlePrevMonth={handlePrevMonth}
              handleNextMonth={handleNextMonth}
              handleSelectDay={handleSelectDay}
              handleRefreshStatistics={handleRefreshStatistics}
              setViewImage={setViewImage}
            />

            <Card className="border border-border">
              <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="h-5 w-5" />
                  Configurações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Notificações</span>
                  <Button
                    variant={notificationsEnabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                    className="text-xs h-8 px-3"
                  >
                    {notificationsEnabled ? "Ativas" : "Inativas"}
                  </Button>
                </div>
                
              <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                  Total de depósitos este mês: <strong className="text-foreground">{depositos.filter(d => 
                    d.data >= startOfMonth(currentMonth) && d.data <= endOfMonth(currentMonth)
                  ).length}</strong>
                </div>

                {/* Botão de limpar histórico - apenas para gerentes */}
                {isManager && (
                  <div className="pt-3 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm text-foreground font-medium">Gerenciamento</span>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="text-xs h-8"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Limpar Histórico
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5 text-destructive" />
                              Confirmar Exclusão
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja remover <strong>TODO</strong> o histórico de depósitos? 
                              Esta ação não pode ser desfeita e todos os dados de depósitos serão permanentemente excluídos.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={handleClearAllDepositos}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Sim, Remover Tudo
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

        <TabsContent value="calendar" className="space-y-6 mt-4">
            <DepositionsCalendar 
              currentMonth={currentMonth}
              diasDoMes={diasDoMes}
              depositos={depositos}
              monthStatistics={currentMonthStats}
              lastResetDate={lastResetDate}
              handlePrevMonth={handlePrevMonth}
              handleNextMonth={handleNextMonth}
              handleSelectDay={handleSelectDay}
              handleRefreshStatistics={handleRefreshStatistics}
              setViewImage={setViewImage}
            />
          </TabsContent>

        <TabsContent value="analytics" className="space-y-6 mt-4">
            {isLoading ? (
              <AnalyticsSkeleton />
            ) : (
              <DepositAnalytics 
                depositos={depositos}
                currentMonth={currentMonth}
                monthStatistics={currentMonthStats}
              />
            )}
          </TabsContent>
        </Tabs>
        
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
          onDeleteDeposito={handleDeleteDeposito}
          onCloseDialog={handleCloseDialog}
        />
        
        <ImagePreviewDialog
          viewImage={viewImage}
          setViewImage={setViewImage}
        />

        {uploadProgress && (
          <UploadProgress 
            progress={uploadProgress.progress} 
            fileName={uploadProgress.fileName} 
          />
        )}
    </div>
  );
}
