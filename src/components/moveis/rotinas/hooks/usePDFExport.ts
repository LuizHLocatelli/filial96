import { useCallback } from 'react';
import { RotinaWithStatus } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { PDFExportOptions } from '../components/PDFExportDialog';

export function usePDFExport() {
  const { toast } = useToast();

  const exportToPDF = useCallback(async (rotinas: RotinaWithStatus[], options: PDFExportOptions) => {
    try {
      const { default: jsPDF } = await import('jspdf');
      
      const doc = new jsPDF();
      
      // Configurações iniciais
      doc.setFont('helvetica');
      let yPosition = 20;
      const pageHeight = doc.internal.pageSize.height;
      const marginBottom = 20;
      
      // Título do documento baseado no template
      doc.setFontSize(options.template === 'executivo' ? 24 : 20);
      doc.setFont('helvetica', 'bold');
      
      let titulo = 'Relatório de Rotinas - Móveis';
      if (options.template === 'compacto') titulo = 'Rotinas - Resumo';
      if (options.template === 'executivo') titulo = 'Dashboard Executivo - Rotinas';
      
      doc.text(titulo, 20, yPosition);
      yPosition += options.template === 'executivo' ? 20 : 15;
      
      // Data de geração se solicitada
      if (options.includeDate) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const dataAtual = format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
        doc.text(`Gerado em: ${dataAtual}`, 20, yPosition);
        yPosition += 20;
      }
      
      // Estatísticas gerais (se incluídas)
      if (options.includeStats) {
        const totalRotinas = rotinas.length;
        const concluidas = rotinas.filter(r => r.status === 'concluida').length;
        const pendentes = rotinas.filter(r => r.status === 'pendente').length;
        const atrasadas = rotinas.filter(r => r.status === 'atrasada').length;
        
        if (options.template === 'executivo') {
          // Layout executivo com indicadores visuais
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Indicadores de Performance', 20, yPosition);
          yPosition += 15;
          
          // Cards de estatísticas
          const cardWidth = 40;
          const cardHeight = 25;
          const spacing = 5;
          
          // Total
          doc.setFillColor(59, 130, 246); // Blue
          doc.rect(20, yPosition, cardWidth, cardHeight, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(20);
          doc.setFont('helvetica', 'bold');
          doc.text(totalRotinas.toString(), 40 - doc.getTextWidth(totalRotinas.toString()) / 2, yPosition + 12);
          doc.setFontSize(8);
          doc.text('TOTAL', 40 - doc.getTextWidth('TOTAL') / 2, yPosition + 20);
          
          // Concluídas
          doc.setFillColor(34, 197, 94); // Green
          doc.rect(20 + cardWidth + spacing, yPosition, cardWidth, cardHeight, 'F');
          doc.setFontSize(20);
          doc.text(concluidas.toString(), 40 + cardWidth + spacing - doc.getTextWidth(concluidas.toString()) / 2, yPosition + 12);
          doc.setFontSize(8);
          doc.text('CONCLUÍDAS', 40 + cardWidth + spacing - doc.getTextWidth('CONCLUÍDAS') / 2, yPosition + 20);
          
          // Pendentes
          doc.setFillColor(251, 191, 36); // Yellow
          doc.rect(20 + (cardWidth + spacing) * 2, yPosition, cardWidth, cardHeight, 'F');
          doc.setFontSize(20);
          doc.text(pendentes.toString(), 40 + (cardWidth + spacing) * 2 - doc.getTextWidth(pendentes.toString()) / 2, yPosition + 12);
          doc.setFontSize(8);
          doc.text('PENDENTES', 40 + (cardWidth + spacing) * 2 - doc.getTextWidth('PENDENTES') / 2, yPosition + 20);
          
          // Atrasadas
          doc.setFillColor(239, 68, 68); // Red
          doc.rect(20 + (cardWidth + spacing) * 3, yPosition, cardWidth, cardHeight, 'F');
          doc.setFontSize(20);
          doc.text(atrasadas.toString(), 40 + (cardWidth + spacing) * 3 - doc.getTextWidth(atrasadas.toString()) / 2, yPosition + 12);
          doc.setFontSize(8);
          doc.text('ATRASADAS', 40 + (cardWidth + spacing) * 3 - doc.getTextWidth('ATRASADAS') / 2, yPosition + 20);
          
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
          doc.text(`Total de rotinas: ${totalRotinas}`, 25, yPosition);
          yPosition += 6;
          doc.text(`Concluídas: ${concluidas}`, 25, yPosition);
          yPosition += 6;
          doc.text(`Pendentes: ${pendentes}`, 25, yPosition);
          yPosition += 6;
          doc.text(`Atrasadas: ${atrasadas}`, 25, yPosition);
          yPosition += 20;
        }
      }
      
      // Processar rotinas baseado nas opções
      if (options.groupByCategory) {
        // Agrupar rotinas por categoria
        const rotinasPorCategoria = rotinas.reduce((acc, rotina) => {
          if (!acc[rotina.categoria]) {
            acc[rotina.categoria] = [];
          }
          acc[rotina.categoria].push(rotina);
          return acc;
        }, {} as Record<string, RotinaWithStatus[]>);
        
        // Listar rotinas por categoria
        Object.entries(rotinasPorCategoria).forEach(([categoria, rotinasCategoria]) => {
          yPosition = renderCategory(doc, categoria, rotinasCategoria, yPosition, pageHeight, marginBottom, options);
        });
      } else {
        // Listar todas as rotinas sem agrupamento
        yPosition = renderCategory(doc, 'Todas as Rotinas', rotinas, yPosition, pageHeight, marginBottom, options);
      }
      
      // Salvar o PDF
      const templateSuffix = options.template === 'compacto' ? '-compacto' : 
                           options.template === 'executivo' ? '-executivo' : '-detalhado';
      const fileName = `rotinas-moveis${templateSuffix}-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`;
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

  const renderCategory = (
    doc: any,
    categoria: string, 
    rotinas: RotinaWithStatus[], 
    startY: number, 
    pageHeight: number, 
    marginBottom: number, 
    options: PDFExportOptions
  ): number => {
    let yPosition = startY;
    
    // Verificar se precisa de nova página para o cabeçalho da categoria
    if (yPosition > pageHeight - marginBottom - 60) {
      doc.addPage();
      yPosition = 20;
    }
    
    if (options.groupByCategory && categoria !== 'Todas as Rotinas') {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Categoria: ${categoria.charAt(0).toUpperCase() + categoria.slice(1)}`, 20, yPosition);
      yPosition += 10;
    }
    
    rotinas.forEach((rotina) => {
      const itemHeight = calculateItemHeight(rotina, options);
      
      // Verificar se precisa de nova página
      if (yPosition > pageHeight - marginBottom - itemHeight) {
        doc.addPage();
        yPosition = 20;
      }
      
      yPosition = renderRotina(doc, rotina, yPosition, options);
    });
    
    return yPosition + 5;
  };

  const calculateItemHeight = (rotina: RotinaWithStatus, options: PDFExportOptions): number => {
    let height = 15; // Base height for name and status
    
    if (options.includeDescription && rotina.descricao) {
      const lines = Math.ceil(rotina.descricao.length / 80); // Approximate lines
      height += lines * 4;
    }
    
    if (options.includeSchedule) {
      height += 8;
    }
    
    height += 8; // Separator line
    
    return height;
  };

  const renderRotina = (
    doc: any,
    rotina: RotinaWithStatus, 
    yPosition: number, 
    options: PDFExportOptions
  ): number => {
    const startY = yPosition;
    
    // Status da rotina (se incluído)
    if (options.includeStatus) {
      let statusText = '';
      let statusColor: [number, number, number] = [0, 0, 0];
      
      switch (rotina.status) {
        case 'concluida':
          statusText = '✓ Concluída';
          statusColor = [0, 128, 0];
          break;
        case 'atrasada':
          statusText = '⚠ Atrasada';
          statusColor = [255, 0, 0];
          break;
        default:
          statusText = '○ Pendente';
          statusColor = [128, 128, 128];
          break;
      }
      
      // Nome da rotina
      doc.setFontSize(options.template === 'compacto' ? 9 : 10);
      doc.setFont('helvetica', 'bold');
      doc.text(rotina.nome, 25, yPosition);
      
      // Status
      doc.setTextColor(...statusColor);
      doc.text(statusText, 140, yPosition);
      doc.setTextColor(0, 0, 0);
      yPosition += 6;
    } else {
      // Apenas o nome, sem status
      doc.setFontSize(options.template === 'compacto' ? 9 : 10);
      doc.setFont('helvetica', 'bold');
      doc.text(rotina.nome, 25, yPosition);
      yPosition += 6;
    }
    
    // Descrição (se incluída e existir)
    if (options.includeDescription && rotina.descricao && options.template !== 'compacto') {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const descricaoLines = doc.splitTextToSize(rotina.descricao, 160);
      doc.text(descricaoLines, 30, yPosition);
      yPosition += descricaoLines.length * 4;
    }
    
    // Periodicidade e horário (se incluídos)
    if (options.includeSchedule) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      let detalhes = `Periodicidade: ${rotina.periodicidade}`;
      if (rotina.horario_preferencial) {
        detalhes += ` | Horário: ${rotina.horario_preferencial}`;
      }
      doc.text(detalhes, 30, yPosition);
      yPosition += 8;
    }
    
    // Linha separadora (exceto para template compacto)
    if (options.template !== 'compacto') {
      doc.setDrawColor(200, 200, 200);
      doc.line(25, yPosition, 185, yPosition);
      yPosition += 8;
    } else {
      yPosition += 4;
    }
    
    return yPosition;
  };

  return {
    exportToPDF,
  };
}
