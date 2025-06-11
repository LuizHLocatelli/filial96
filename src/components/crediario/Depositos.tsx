import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Camera, Settings, Zap, Download, RefreshCw, Home, Calendar, BarChart3, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useDepositos } from "@/hooks/crediario/useDepositos";
import { DailyStatusWidget } from "./depositos/DailyStatusWidget";
import { QuickDepositForm } from "./depositos/QuickDepositForm";
import { DepositionsCalendar } from "./depositos/DepositionsCalendar";
import { DepositFormDialog } from "./depositos/DepositFormDialog";
import { ImagePreviewDialog } from "./depositos/ImagePreviewDialog";
import { NotificationSystem } from "./depositos/NotificationSystem";
import { DepositAnalytics } from "./depositos/DepositAnalytics";
import { UploadProgress, AnalyticsSkeleton } from "./depositos/LoadingStates";

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
  const { 
    depositos, 
    isLoading, 
    addDeposito, 
    updateDeposito, 
    deleteDeposito,
    fetchDepositos 
  } = useDepositos();

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
    console.log('🔧 Editando depósito:', {
      id: deposito.id,
      data: deposito.data,
      ja_incluido: deposito.ja_incluido,
      comprovante: deposito.comprovante
    });
    
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
    // Resetar estado após um pequeno delay para permitir a animação de fechamento
    setTimeout(resetDialogState, 200);
  };

  const handleSubmit = async (jaIncluido: boolean) => {
    if (!selectedDay) return;

    try {
      setIsUploading(true);
      
      // Simular progresso de upload se há arquivo novo
      if (selectedFile) {
        setUploadProgress({ progress: 0, fileName: selectedFile.name });
        
        for (let i = 0; i <= 100; i += 20) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setUploadProgress({ progress: i, fileName: selectedFile.name });
        }
      }

      if (depositoId) {
        // Atualizar depósito existente
        const updateData: any = {
          data: selectedDay,
          ja_incluido: jaIncluido
        };

        // Se há um arquivo novo, usar ele; senão manter o URL existente se não for blob
        if (selectedFile) {
          updateData.comprovante = selectedFile;
        } else if (previewUrl && !previewUrl.startsWith('blob:')) {
          // Manter o comprovante existente se não há arquivo novo
          updateData.comprovante = previewUrl;
        }

        console.log('📝 Atualizando depósito com dados:', updateData);
        await updateDeposito(depositoId, updateData);
      } else {
        // Criar novo depósito
        await addDeposito({
          data: selectedDay,
          comprovante: selectedFile || undefined,
          ja_incluido: jaIncluido
        });
      }

      handleCloseDialog();
      handleRemoveFile();
      setUploadProgress(null);
      setDepositoId(null);
      setSelectedDay(null);
      
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

      // Verificar se já existe depósito para o dia
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
      toast({
        title: "✅ Dados Atualizados",
        description: "Informações carregadas com sucesso!",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "❌ Erro",
        description: "Não foi possível atualizar os dados.",
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExportData = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');

      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Relatório de Depósitos - Crediário", 14, 22);
      
      // Configurações do documento
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      
      // Cabeçalho do documento
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`FILIAL 96 - ${format(currentMonth, 'MMMM yyyy', { locale: ptBR }).toUpperCase()}`, pageWidth / 2, 45, { align: 'center' });
      
      // Linha separadora
      doc.setLineWidth(0.5);
      doc.line(margin, 55, pageWidth - margin, 55);
      
      // Informações gerais
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Data de geração: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, margin, 65);
      
      // Estatísticas do mês
      const diasDoMes = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth)
      });
      const diasUteis = diasDoMes.filter(day => day.getDay() !== 0); // Excluir apenas domingo
      const depositosDoMes = depositos.filter(d => 
        d.data >= startOfMonth(currentMonth) && d.data <= endOfMonth(currentMonth)
      );
      const depositosCompletos = depositosDoMes.filter(d => d.comprovante && d.ja_incluido);
      const depositosPendentes = depositosDoMes.filter(d => d.comprovante && !d.ja_incluido);
      const depositosPerdidos = diasUteis.filter(day => {
        const hasDeposit = depositosDoMes.some(d => isSameDay(d.data, day));
        return !hasDeposit && day < new Date();
      });
      
      // Calcular depósitos atrasados (feitos após às 12h)
      const depositosAtrasados = depositosDoMes.filter(d => {
        // Verificar se o depósito foi feito no mesmo dia que deveria ser
        const isDayDeposit = isSameDay(d.data, new Date(d.created_at));
        if (!isDayDeposit) return false;
        
        // Verificar se foi criado após às 12h
        const createdHour = new Date(d.created_at).getHours();
        return createdHour >= 12;
      });
      
      const taxaConclusao = diasUteis.length > 0 ? Math.round((depositosCompletos.length / diasUteis.length) * 100) : 0;
      
      // Resumo executivo
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('RESUMO EXECUTIVO', margin, 85);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const resumoY = 95;
      doc.text(`• Total de dias úteis no mês: ${diasUteis.length}`, margin, resumoY);
      doc.text(`• Depósitos realizados: ${depositosDoMes.length}`, margin, resumoY + 8);
      doc.text(`• Depósitos completos (com comprovante e incluídos): ${depositosCompletos.length}`, margin, resumoY + 16);
      doc.text(`• Depósitos pendentes no sistema: ${depositosPendentes.length}`, margin, resumoY + 24);
      doc.text(`• Depósitos feitos com atraso (após 12h): ${depositosAtrasados.length}`, margin, resumoY + 32);
      doc.text(`• Dias perdidos: ${depositosPerdidos.length}`, margin, resumoY + 40);
      doc.text(`• Taxa de conclusão: ${taxaConclusao}%`, margin, resumoY + 48);
      
      // Tabela detalhada
      const tableStartY = resumoY + 63;
      
      // Preparar dados da tabela
      const tableData = diasDoMes.map(day => {
        const isWeekend = day.getDay() === 0;
        const depositoForDay = depositosDoMes.find(d => isSameDay(d.data, day));
        
        if (isWeekend) {
          return [
            format(day, 'dd/MM/yyyy'),
            format(day, 'EEEE', { locale: ptBR }),
            'DOMINGO',
            '-',
            '-',
            'Não obrigatório'
          ];
        }
        
        if (!depositoForDay) {
          const isPast = day < new Date();
          return [
            format(day, 'dd/MM/yyyy'),
            format(day, 'EEEE', { locale: ptBR }),
            isPast ? 'PERDIDO' : 'PENDENTE',
            'Não',
            'Não',
            isPast ? 'Prazo expirado' : 'Aguardando depósito'
          ];
        }
        
        const hasComprovante = !!depositoForDay.comprovante;
        const isIncluded = depositoForDay.ja_incluido;
        
        // Verificar se foi feito com atraso
        const isDayDeposit = isSameDay(new Date(depositoForDay.created_at), day);
        const createdHour = new Date(depositoForDay.created_at).getHours();
        const isLate = isDayDeposit && createdHour >= 12;
        
        let status = 'INCOMPLETO';
        if (hasComprovante && isIncluded) {
          status = isLate ? 'COMPLETO (ATRASO)' : 'COMPLETO';
        } else if (hasComprovante && !isIncluded) {
          status = isLate ? 'PENDENTE TESOURARIA (ATRASO)' : 'PENDENTE TESOURARIA';
        }
        
        const observacoes = isLate 
          ? `Depósito registrado com atraso (${format(new Date(depositoForDay.created_at), 'HH:mm')})`
          : `Depósito registrado (${format(new Date(depositoForDay.created_at), 'HH:mm')})`;
        
        return [
          format(day, 'dd/MM/yyyy'),
          format(day, 'EEEE', { locale: ptBR }),
          status,
          hasComprovante ? 'Sim' : 'Não',
          isIncluded ? 'Sim' : 'Não',
          observacoes
        ];
      });
      
      // Configurar tabela
      autoTable(doc, {
        head: [['Data', 'Dia da Semana', 'Status', 'Comprovante', 'Na Tesouraria/P2K', 'Observações']],
        body: tableData,
        startY: tableStartY,
        styles: {
          fontSize: 8,
          cellPadding: 2,
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          lineWidth: 0.2,
        },
        columnStyles: {
          0: { cellWidth: 25, halign: 'center' },  // Data
          1: { cellWidth: 25, halign: 'center' },  // Dia
          2: { cellWidth: 30, halign: 'center' },  // Status
          3: { cellWidth: 20, halign: 'center' },  // Comprovante
          4: { cellWidth: 20, halign: 'center' },  // Sistema
          5: { cellWidth: 50, halign: 'left' },    // Observações
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        margin: { left: margin, right: margin },
        didParseCell: function(data) {
          // Colorir células baseado no status (em tons de cinza para P&B)
          if (data.column.index === 2 && data.cell.raw) {
            const status = data.cell.raw.toString();
            if (status.includes('COMPLETO')) {
              data.cell.styles.fillColor = status.includes('ATRASO') ? [200, 200, 200] : [220, 220, 220]; // Cinza para atraso
              data.cell.styles.fontStyle = 'bold';
            } else if (status === 'PERDIDO') {
              data.cell.styles.fillColor = [180, 180, 180]; // Cinza escuro
              data.cell.styles.fontStyle = 'bold';
            } else if (status.includes('PENDENTE TESOURARIA')) {
              data.cell.styles.fillColor = status.includes('ATRASO') ? [190, 190, 190] : [200, 200, 200]; // Cinza para atraso
            }
          }
        }
      });
      
      // Rodapé
      const finalY = (doc as any).lastAutoTable.finalY + 20;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text('Documento gerado automaticamente pelo Sistema de Gestão de Depósitos - Filial 96', pageWidth / 2, finalY, { align: 'center' });
      doc.text(`Página 1 de 1`, pageWidth / 2, finalY + 8, { align: 'center' });
      
      // Salvar o arquivo
      const fileName = `relatorio-depositos-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      doc.save(fileName);
      
      toast({
        title: "Relatório Gerado",
        description: `O arquivo ${fileName} foi salvo com sucesso.`,
      });
      
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "Erro ao Gerar Relatório",
        description: "Não foi possível gerar o PDF.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDeposito = async (depositoId: string) => {
    try {
      await deleteDeposito(depositoId);
      
      // Fechar dialog se não há mais depósitos para o dia
      const remainingDeposits = depositos.filter(d => 
        d.id !== depositoId && selectedDay && isSameDay(d.data, selectedDay)
      );
      
      if (remainingDeposits.length === 0) {
        setOpenDialog(false);
        setSelectedDay(null);
        setDepositoId(null);
        setPreviewUrl(null);
      }
      
    } catch (error) {
      console.error('Erro ao excluir depósito:', error);
      toast({
        title: "❌ Erro ao Excluir",
        description: "Não foi possível excluir o depósito. Tente novamente.",
        variant: "destructive",
        duration: 4000,
      });
    }
  };

  const diasDoMes = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const depositosForDay = selectedDay 
    ? depositos.filter(d => isSameDay(d.data, selectedDay))
    : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Container principal com padding responsivo */}
      <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
        
        {/* Notificações Inteligentes */}
        {notificationsEnabled && (
          <NotificationSystem 
            depositos={depositos} 
          />
        )}

        {/* Indicador de Status Online/Offline */}
        {!isOnline && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2 mx-1">
            <div className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0"></div>
            <span className="text-xs sm:text-sm text-yellow-800">
              Modo offline - As alterações serão sincronizadas quando a conexão for restaurada
            </span>
          </div>
        )}

        <Tabs defaultValue="dashboard" className="w-full">
          {/* Header melhorado para mobile */}
          <div className="flex flex-col space-y-4 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Depósitos Diários
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  Gerencie seus depósitos bancários de forma inteligente
                </p>
              </div>
              
              {/* Botões de ação responsivos */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshData}
                  disabled={isRefreshing}
                  className="flex-1 sm:flex-none text-sm sm:text-sm h-10 sm:h-9"
                >
                  <RefreshCw className={`h-4 w-4 sm:h-4 sm:w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>Atualizar</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportData}
                  className="flex-1 sm:flex-none text-sm sm:text-sm h-10 sm:h-9"
                >
                  <FileText className="h-4 w-4 sm:h-4 sm:w-4 mr-2" />
                  <span>Relatório</span>
                </Button>
              </div>
            </div>

            {/* Tabs com ícones responsivos */}
            <div className="w-full overflow-x-auto">
              <TabsList className="grid w-full grid-cols-3 min-w-[280px] sm:min-w-0 sm:w-[320px] mx-auto h-11 sm:h-11">
                <TabsTrigger 
                  value="dashboard" 
                  className="flex items-center justify-center gap-2 sm:gap-2 px-3 sm:px-4 text-sm sm:text-sm"
                  title="Dashboard Principal"
                >
                  <Home className="h-4 w-4 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline lg:inline">Início</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="calendar" 
                  className="flex items-center justify-center gap-2 sm:gap-2 px-3 sm:px-4 text-sm sm:text-sm"
                  title="Calendário de Depósitos"
                >
                  <Calendar className="h-4 w-4 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline lg:inline">Calendário</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="flex items-center justify-center gap-2 sm:gap-2 px-3 sm:px-4 text-sm sm:text-sm"
                  title="Analytics e Relatórios"
                >
                  <BarChart3 className="h-4 w-4 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline lg:inline">Analytics</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="dashboard" className="space-y-4 sm:space-y-6 mt-4">
            {/* Widget de Status Diário */}
            <DailyStatusWidget 
              depositos={depositos}
            />

            {/* Formulário Rápido */}
            <QuickDepositForm 
              depositos={depositos}
              onSubmit={handleQuickSubmit}
              isUploading={isUploading}
            />

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

            {/* Configurações */}
            <Card className="border border-border">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-base sm:text-base flex items-center gap-2">
                  <Settings className="h-5 w-5 sm:h-5 sm:w-5 flex-shrink-0" />
                  Configurações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-sm text-foreground">Notificações</span>
                  <Button
                    variant={notificationsEnabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                    className="text-xs h-8 px-3"
                  >
                    {notificationsEnabled ? "Ativas" : "Inativas"}
                  </Button>
                </div>
                
                <div className="text-sm sm:text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                  Total de depósitos este mês: <strong className="text-foreground">{depositos.filter(d => 
                    d.data >= startOfMonth(currentMonth) && d.data <= endOfMonth(currentMonth)
                  ).length}</strong>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4 sm:space-y-6 mt-4">
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

          <TabsContent value="analytics" className="space-y-4 sm:space-y-6 mt-4">
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
          onDeleteDeposito={handleDeleteDeposito}
          onCloseDialog={handleCloseDialog}
        />
        
        {/* Dialog para visualizar imagem */}
        <ImagePreviewDialog
          viewImage={viewImage}
          setViewImage={setViewImage}
        />

        {/* Progress de Upload */}
        {uploadProgress && (
          <UploadProgress 
            progress={uploadProgress.progress} 
            fileName={uploadProgress.fileName} 
          />
        )}
      </div>
    </div>
  );
}
