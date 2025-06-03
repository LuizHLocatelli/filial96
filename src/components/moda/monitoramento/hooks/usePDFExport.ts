import { useCallback } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

export interface MonitoringData {
  id: string;
  user_id: string;
  secao: string;
  acao?: string;
  timestamp: string;
  session_id: string;
  duracao_segundos?: number;
  detalhes?: any;
  metadata?: any;
  ip_address?: string;
  user_agent?: string;
}

export interface PDFExportOptions {
  template: 'compacto' | 'detalhado' | 'executivo';
  includeStats: boolean;
  includeDetails: boolean;
  includeMetadata: boolean;
  includeCharts: boolean;
  groupBySection: boolean;
  groupByUser: boolean;
  includeDate: boolean;
  periodo: string;
}

export function usePDFExport() {
  const { toast } = useToast();

  const exportToPDF = useCallback(async (
    data: MonitoringData[], 
    stats: any, 
    options: PDFExportOptions
  ) => {
    try {
      const doc = new jsPDF();
      
      // Configurações iniciais
      doc.setFont('helvetica');
      let yPosition = 20;
      const pageHeight = doc.internal.pageSize.height;
      const marginBottom = 20;
      const pageWidth = doc.internal.pageSize.width;
      
      // Título do documento baseado no template
      doc.setFontSize(options.template === 'executivo' ? 24 : 20);
      doc.setFont('helvetica', 'bold');
      
      let titulo = 'Relatório de Monitoramento - Seção Moda';
      if (options.template === 'compacto') titulo = 'Monitoramento Moda - Resumo';
      if (options.template === 'executivo') titulo = 'Dashboard Executivo - Monitoramento Moda';
      
      doc.text(titulo, 20, yPosition);
      yPosition += options.template === 'executivo' ? 20 : 15;
      
      // Data de geração se solicitada
      if (options.includeDate) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const dataAtual = format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
        doc.text(`Gerado em: ${dataAtual}`, 20, yPosition);
        doc.text(`Período: ${options.periodo}`, 20, yPosition + 6);
        yPosition += 20;
      }
      
      // Estatísticas gerais (se incluídas)
      if (options.includeStats && stats) {
        yPosition = renderStats(doc, stats, yPosition, options, pageHeight, marginBottom);
      }
      
      // Processar dados baseado nas opções
      if (options.groupBySection) {
        yPosition = renderDataBySection(doc, data, yPosition, pageHeight, marginBottom, options);
      } else if (options.groupByUser) {
        yPosition = renderDataByUser(doc, data, yPosition, pageHeight, marginBottom, options);
      } else {
        yPosition = renderDataTable(doc, data, yPosition, pageHeight, marginBottom, options);
      }
      
      // Salvar o PDF
      const templateSuffix = options.template === 'compacto' ? '-compacto' : 
                           options.template === 'executivo' ? '-executivo' : '-detalhado';
      const fileName = `monitoramento-moda${templateSuffix}-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`;
      doc.save(fileName);
      
      toast({
        title: "PDF gerado com sucesso",
        description: `Arquivo ${fileName} foi baixado.`,
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Não foi possível gerar o arquivo PDF.",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const renderStats = (
    doc: jsPDF,
    stats: any,
    startY: number,
    options: PDFExportOptions,
    pageHeight: number,
    marginBottom: number
  ): number => {
    let yPosition = startY;
    
    // Verificar se precisa de nova página
    if (yPosition > pageHeight - marginBottom - 80) {
      doc.addPage();
      yPosition = 20;
    }

    if (options.template === 'executivo') {
      // Layout executivo com cards coloridos
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Indicadores de Performance', 20, yPosition);
      yPosition += 15;
      
      const cardWidth = 40;
      const cardHeight = 25;
      const spacing = 5;
      
      // Total de usuários
      doc.setFillColor(59, 130, 246); // Blue
      doc.rect(20, yPosition, cardWidth, cardHeight, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      const totalText = stats.totalUsuarios?.toString() || '0';
      doc.text(totalText, 40 - doc.getTextWidth(totalText) / 2, yPosition + 12);
      doc.setFontSize(8);
      doc.text('USUÁRIOS', 40 - doc.getTextWidth('USUÁRIOS') / 2, yPosition + 20);
      
      // Usuários ativos hoje
      doc.setFillColor(34, 197, 94); // Green
      doc.rect(20 + cardWidth + spacing, yPosition, cardWidth, cardHeight, 'F');
      doc.setFontSize(16);
      const ativosText = stats.usuariosAtivosHoje?.toString() || '0';
      doc.text(ativosText, 40 + cardWidth + spacing - doc.getTextWidth(ativosText) / 2, yPosition + 12);
      doc.setFontSize(8);
      doc.text('ATIVOS HOJE', 40 + cardWidth + spacing - doc.getTextWidth('ATIVOS HOJE') / 2, yPosition + 20);
      
      // Total de sessões
      doc.setFillColor(251, 191, 36); // Yellow
      doc.rect(20 + (cardWidth + spacing) * 2, yPosition, cardWidth, cardHeight, 'F');
      doc.setFontSize(16);
      const sessoesText = stats.totalSessoes?.toString() || '0';
      doc.text(sessoesText, 40 + (cardWidth + spacing) * 2 - doc.getTextWidth(sessoesText) / 2, yPosition + 12);
      doc.setFontSize(8);
      doc.text('SESSÕES', 40 + (cardWidth + spacing) * 2 - doc.getTextWidth('SESSÕES') / 2, yPosition + 20);
      
      // Páginas visualizadas
      doc.setFillColor(139, 69, 19); // Brown
      doc.rect(20 + (cardWidth + spacing) * 3, yPosition, cardWidth, cardHeight, 'F');
      doc.setFontSize(16);
      const paginasText = stats.paginasVisualizadasHoje?.toString() || '0';
      doc.text(paginasText, 40 + (cardWidth + spacing) * 3 - doc.getTextWidth(paginasText) / 2, yPosition + 12);
      doc.setFontSize(8);
      doc.text('PÁGINAS', 40 + (cardWidth + spacing) * 3 - doc.getTextWidth('PÁGINAS') / 2, yPosition + 20);
      
      doc.setTextColor(0, 0, 0);
      yPosition += cardHeight + 20;
      
    } else {
      // Layout padrão para outros templates
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Resumo Geral', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total de usuários únicos: ${stats.totalUsuarios || 0}`, 25, yPosition);
      yPosition += 6;
      doc.text(`Usuários ativos hoje: ${stats.usuariosAtivosHoje || 0}`, 25, yPosition);
      yPosition += 6;
      doc.text(`Total de sessões: ${stats.totalSessoes || 0}`, 25, yPosition);
      yPosition += 6;
      doc.text(`Páginas visualizadas hoje: ${stats.paginasVisualizadasHoje || 0}`, 25, yPosition);
      yPosition += 6;
      doc.text(`Tempo médio por sessão: ${formatDuration(stats.tempoMedioSessao || 0)}`, 25, yPosition);
      yPosition += 6;
      doc.text(`Seção mais acessada: ${getSectionName(stats.secaoMaisAcessada)}`, 25, yPosition);
      yPosition += 6;
      doc.text(`Crescimento semanal: ${stats.crescimentoSemanal || 0}%`, 25, yPosition);
      yPosition += 20;
    }
    
    return yPosition;
  };

  const renderDataBySection = (
    doc: jsPDF,
    data: MonitoringData[],
    startY: number,
    pageHeight: number,
    marginBottom: number,
    options: PDFExportOptions
  ): number => {
    let yPosition = startY;
    
    // Agrupar por seção
    const dataBySection = data.reduce((acc, item) => {
      if (!acc[item.secao]) {
        acc[item.secao] = [];
      }
      acc[item.secao].push(item);
      return acc;
    }, {} as Record<string, MonitoringData[]>);
    
    Object.entries(dataBySection).forEach(([secao, items]) => {
      // Verificar se precisa de nova página
      if (yPosition > pageHeight - marginBottom - 40) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Seção: ${getSectionName(secao)}`, 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total de acessos: ${items.length}`, 25, yPosition);
      doc.text(`Usuários únicos: ${new Set(items.map(i => i.user_id)).size}`, 110, yPosition);
      yPosition += 15;
      
      // Criar tabela para esta seção
      const tableData = items.slice(0, 10).map(item => [
        format(new Date(item.timestamp), 'dd/MM HH:mm'),
        item.user_id.substring(0, 8) + '...',
        item.acao || 'Visualização',
        item.duracao_segundos ? formatDuration(item.duracao_segundos) : 'N/A'
      ]);
      
      autoTable(doc, {
        head: [['Data/Hora', 'Usuário', 'Ação', 'Duração']],
        body: tableData,
        startY: yPosition,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] },
        margin: { left: 25 },
        didDrawPage: (data) => {
          yPosition = data.cursor?.y || yPosition;
        }
      });
      
      yPosition += 10;
    });
    
    return yPosition;
  };

  const renderDataByUser = (
    doc: jsPDF,
    data: MonitoringData[],
    startY: number,
    pageHeight: number,
    marginBottom: number,
    options: PDFExportOptions
  ): number => {
    let yPosition = startY;
    
    // Agrupar por usuário
    const dataByUser = data.reduce((acc, item) => {
      if (!acc[item.user_id]) {
        acc[item.user_id] = [];
      }
      acc[item.user_id].push(item);
      return acc;
    }, {} as Record<string, MonitoringData[]>);
    
    // Pegar top 10 usuários mais ativos
    const topUsers = Object.entries(dataByUser)
      .sort(([,a], [,b]) => b.length - a.length)
      .slice(0, 10);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Top 10 Usuários Mais Ativos', 20, yPosition);
    yPosition += 15;
    
    const tableData = topUsers.map(([userId, items]) => [
      userId.substring(0, 12) + '...',
      items.length.toString(),
      new Set(items.map(i => i.secao)).size.toString(),
      items.reduce((acc, i) => acc + (i.duracao_segundos || 0), 0) > 0 ? 
        formatDuration(items.reduce((acc, i) => acc + (i.duracao_segundos || 0), 0)) : 'N/A'
    ]);
    
    autoTable(doc, {
      head: [['Usuário', 'Total Acessos', 'Seções Visitadas', 'Tempo Total']],
      body: tableData,
      startY: yPosition,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [139, 69, 19] },
      margin: { left: 20 },
      didDrawPage: (data) => {
        yPosition = data.cursor?.y || yPosition;
      }
    });
    
    return yPosition + 10;
  };

  const renderDataTable = (
    doc: jsPDF,
    data: MonitoringData[],
    startY: number,
    pageHeight: number,
    marginBottom: number,
    options: PDFExportOptions
  ): number => {
    let yPosition = startY;
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Dados de Monitoramento', 20, yPosition);
    yPosition += 15;
    
    const tableData = data.slice(0, 50).map(item => {
      const row = [
        format(new Date(item.timestamp), 'dd/MM/yy HH:mm'),
        item.user_id.substring(0, 10) + '...',
        getSectionName(item.secao),
        item.acao || 'Visualização'
      ];
      
      if (options.includeDetails) {
        row.push(item.duracao_segundos ? formatDuration(item.duracao_segundos) : 'N/A');
      }
      
      if (options.includeMetadata && item.session_id) {
        row.push(item.session_id.substring(0, 8) + '...');
      }
      
      return row;
    });
    
    const headers = ['Data/Hora', 'Usuário', 'Seção', 'Ação'];
    if (options.includeDetails) headers.push('Duração');
    if (options.includeMetadata) headers.push('Sessão');
    
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: yPosition,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [139, 69, 19] },
      margin: { left: 20 },
      didDrawPage: (data) => {
        yPosition = data.cursor?.y || yPosition;
      }
    });
    
    return yPosition + 10;
  };

  const getSectionName = (secao: string) => {
    const names: Record<string, string> = {
      'moda-inicio': 'Início',
      'moda-vendas': 'Vendas',
      'moda-estoque': 'Estoque',
      'moda-clientes': 'Clientes',
      'moda-relatorios': 'Relatórios',
      'moda-configuracoes': 'Configurações'
    };
    return names[secao] || secao;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  return {
    exportToPDF,
  };
} 